import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testAttemptsApi, levelProgressApi, questionsApi } from '@/db/api';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { Trophy, Clock, Target, TrendingUp, Home, Unlock, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TestResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProgress } = useProgress(user?.id);
  const { toast } = useToast();
  const results = location.state;
  const [unlockedLevel, setUnlockedLevel] = useState<string | null>(null);
  const saveGuard = useRef(false);
  const [incorrectDetails, setIncorrectDetails] = useState<Array<{
    id: number;
    question_text: string;
    selected_answer_text: string;
    correct_answer_text: string;
  }>>([]);
  const [wrongAnswers, setWrongAnswers] = useState<Array<{
    id: number;
    question_text: string;
    options: string[];
    selected_index: number;
    correct_index: number;
    explanation: string;
    solution_steps: { steps: string[] } | null;
  }>>([]);

  useEffect(() => {
    if (!results) {
      navigate('/test');
      return;
    }
    if (user && !saveGuard.current) {
      saveGuard.current = true;
      saveResults();
    }
    loadIncorrectQuestions();
  }, [user, results]);

  const saveResults = async () => {
    if (!user || !results) return;

    // Save attempt first; show success/failure immediately
    try {
      await testAttemptsApi.create({
        user_id: user.id,
        topic_id: results.config.topicId,
        difficulty: results.config.difficulty,
        question_count: results.config.questionCount,
        timer_enabled: results.config.timerEnabled,
        time_limit: results.config.timeLimit,
        time_taken: results.timeSpent,
        score: results.score,
        total_questions: results.totalQuestions,
        answers: results.answers,
        is_practice: false
      });
      toast({
        title: 'Attempt Saved',
        description: `Your ${results.config.difficulty} attempt is saved.`,
      });
    } catch (error) {
      console.error('Error saving test results:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save your attempt. Please try again.',
        variant: 'destructive',
        duration: 5000
      });
      return;
    }

    // Ensure level progress base rows and backfill from attempts to reflect unlocks
    try {
      await levelProgressApi.backfillFromAttempts(user.id, results.config.topicId);
    } catch (error) {
      console.error('Error backfilling level progress from attempts:', error);
    }

    // Update aggregate progress; non-blocking for saved attempt
    try {
      await updateProgress(results.totalQuestions, results.score, results.timeSpent);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Progress Update Failed',
        description: 'Your attempt is saved, but progress stats were not updated.',
        variant: 'destructive',
        duration: 4000
      });
    }

    // Update level progress and check for unlocks; non-blocking for saved attempt
    try {
      const percentage = Math.round((results.score / results.totalQuestions) * 100);
      const progressResult = await levelProgressApi.updateLevelProgress(
        user.id,
        results.config.topicId,
        results.config.difficulty,
        percentage
      );

      if (progressResult.unlocked_next_level && progressResult.next_level) {
        setUnlockedLevel(progressResult.next_level);
        toast({
          title: '🎉 Level Unlocked!',
          description: `Congratulations! You've unlocked ${progressResult.next_level.charAt(0).toUpperCase() + progressResult.next_level.slice(1)} difficulty!`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error updating level progress:', error);
      // No toast here by default; attempt is already saved and user may not need extra noise.
    }
  };

  const loadIncorrectQuestions = async () => {
    if (!results) return;
    const incorrect = (results.answers || []).filter((a: any) => !a.is_correct);
    if (incorrect.length === 0) {
      setIncorrectDetails([]);
      return;
    }
    try {
      const ids = incorrect.map((a: any) => a.question_id);
      const questions = await questionsApi.getByIds(ids);
      const byId = new Map(questions.map(q => [q.id, q]));
      const items = incorrect.map((a: any) => {
        const q = byId.get(a.question_id);
        return {
          id: a.question_id,
          question_text: q ? q.question_text : `Question ${a.question_id}`,
          options: q ? q.options : [],
          selected_index: a.selected_answer,
          correct_index: q ? q.correct_answer : -1,
          explanation: q ? q.explanation : '',
          solution_steps: q ? q.solution_steps : null
        };
      });
      setWrongAnswers(items);
      const details = items.map((item: typeof items[number]) => {
        const selectedText =
          item.options && item.selected_index >= 0 && item.selected_index < item.options.length
            ? item.options[item.selected_index]
            : 'No answer selected';
        const correctText =
          item.options && item.correct_index >= 0 && item.correct_index < item.options.length
            ? item.options[item.correct_index]
            : '';
        return {
          id: item.id,
          question_text: item.question_text,
          selected_answer_text: selectedText,
          correct_answer_text: correctText
        };
      });
      setIncorrectDetails(details);
    } catch (error) {
      console.error('Error loading incorrect questions:', error);
      setIncorrectDetails([]);
    }
  };

  if (!results) {
    return null;
  }

  const percentage = Math.round((results.score / results.totalQuestions) * 100);
  const avgTimePerQuestion = Math.round(results.timeSpent / results.totalQuestions);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getMessage = () => {
    if (percentage === 100) {
      return {
        title: 'Perfect Score! 🎉',
        message: 'Outstanding! You answered all questions correctly. Excellent work!',
        color: 'text-success'
      };
    } else if (percentage >= 80) {
      return {
        title: 'Great Job! 👏',
        message: 'You did very well! Keep up the excellent work.',
        color: 'text-success'
      };
    } else if (percentage >= 60) {
      return {
        title: 'Good Effort! 👍',
        message: 'You\'re making progress. Review the topics and try again to improve.',
        color: 'text-primary'
      };
    } else {
      return {
        title: 'Keep Practicing! 💪',
        message: 'Don\'t give up! Review the learning materials and practice more to improve your score.',
        color: 'text-muted-foreground'
      };
    }
  };

  const getSuggestions = () => {
    const suggestions = [];
    
    if (avgTimePerQuestion > 90) {
      suggestions.push('Try to improve your solving speed. Practice more to become faster.');
    }
    
    if (percentage < 70) {
      suggestions.push('Review the topic materials and practice problems to strengthen your understanding.');
    }
    
    if (results.config.timerEnabled && results.autoSubmit) {
      suggestions.push('You ran out of time. Practice with a timer to improve your time management.');
    }

    return suggestions;
  };

  const message = getMessage();
  const suggestions = getSuggestions();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-2 border-primary mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Trophy className="h-16 w-16 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">Test Complete!</CardTitle>
            <p className="text-muted-foreground">
              Here are your results
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-8">
              <div className="inline-block p-8 bg-primary/5 rounded-full mb-4">
                <p className="text-6xl font-bold text-primary">
                  {percentage}%
                </p>
              </div>
              <p className="text-xl font-medium text-foreground">
                {results.score} out of {results.totalQuestions} correct
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold text-primary">
                    {results.score}/{results.totalQuestions}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Time Taken</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatTime(results.timeSpent)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Avg Time</p>
                  <p className="text-2xl font-bold text-primary">
                    {avgTimePerQuestion}s
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className={`p-6 rounded-lg mb-6 ${
              percentage >= 80 ? 'bg-success/10' : 'bg-muted'
            }`}>
              <h3 className={`text-2xl font-bold mb-2 ${message.color}`}>
                {message.title}
              </h3>
              <p className="text-foreground">
                {message.message}
              </p>
            </div>

            {unlockedLevel && (
              <div className="p-6 rounded-lg mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-full">
                    <Unlock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-1">
                      🎉 New Level Unlocked!
                    </h4>
                    <p className="text-foreground">
                      Congratulations! You've unlocked <span className="font-bold">{unlockedLevel.charAt(0).toUpperCase() + unlockedLevel.slice(1)}</span> difficulty for this topic!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="p-6 bg-card border border-border rounded-lg mb-6">
                <h4 className="font-medium text-foreground mb-3">Suggestions for Improvement:</h4>
                <ul className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {incorrectDetails.length > 0 && (
              <div className="p-6 bg-card border border-border rounded-lg mb-6">
                <h4 className="font-medium text-foreground mb-3">Incorrect Questions</h4>
                <div className="space-y-4">
                  {incorrectDetails.map(item => (
                    <div key={item.id} className="p-4 rounded-lg border border-border">
                      <p className="font-medium text-foreground mb-2">{item.question_text}</p>
                      <div className="text-sm">
                        <p className="text-muted-foreground">
                          Your answer: <span className="text-destructive font-semibold">{item.selected_answer_text}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Correct answer: <span className="text-success font-semibold">{item.correct_answer_text}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() =>
                      navigate('/test/wrong-answers', {
                        state: {
                          items: wrongAnswers,
                          meta: {
                            topicId: results.config.topicId,
                            difficulty: results.config.difficulty
                          }
                        }
                      })
                    }
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Wrong Answers
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                variant="outline"
                onClick={() => navigate('/test')}
              >
                Take Another Test
              </Button>
              <Button
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
