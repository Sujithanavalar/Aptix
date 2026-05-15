import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { topicsApi, questionsApi, testAttemptsApi } from '@/db/api';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import type { Topic, Question } from '@/types/types';
import { ArrowLeft, Check, X, Eye } from 'lucide-react';

export default function Practice() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProgress } = useProgress(user?.id);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug]);

  const fetchData = async () => {
    if (!slug) return;
    try {
      const topicData = await topicsApi.getBySlug(slug);
      setTopic(topicData);
      
      if (topicData) {
        const questionsData = await questionsApi.getRandomByTopic(topicData.id, 'easy', 10);
        setQuestions(questionsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    if (answered) return;
    
    setSelectedAnswer(answerIndex);
    setAnswered(true);
    
    if (answerIndex === currentQuestion.correct_answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setShowSolution(false);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    if (user) {
      try {
        await testAttemptsApi.create({
          user_id: user.id,
          topic_id: topic!.id,
          difficulty: 'easy',
          question_count: 10,
          timer_enabled: false,
          time_limit: null,
          time_taken: timeSpent,
          score,
          total_questions: questions.length,
          answers: [],
          is_practice: true
        });

        await updateProgress(questions.length, score, timeSpent);
      } catch (error) {
        console.error('Error saving practice:', error);
      }
    }

    navigate('/learn', { 
      state: { 
        message: `Practice complete! Score: ${score}/${questions.length}`,
        score 
      } 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading practice questions...</p>
        </div>
      </div>
    );
  }

  if (!topic || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">No questions available</p>
          <Button onClick={() => navigate('/learn')}>
            Back to Topics
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/learn/${slug}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Topic
        </Button>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-primary">Practice Mode</h1>
            <span className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-8">
            <p className="text-lg font-medium text-foreground mb-6">
              {currentQuestion.question_text}
            </p>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correct_answer;
                const showCorrect = answered && isCorrect;
                const showIncorrect = answered && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={answered}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      showCorrect
                        ? 'border-success bg-success/10'
                        : showIncorrect
                        ? 'border-destructive bg-destructive/10'
                        : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary hover:bg-muted'
                    } ${answered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">{option}</span>
                      {showCorrect && <Check className="h-5 w-5 text-success" />}
                      {showIncorrect && <X className="h-5 w-5 text-destructive" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">
                  {selectedAnswer === currentQuestion.correct_answer
                    ? '✓ Correct!'
                    : '✗ Incorrect'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {answered && !showSolution && currentQuestion.solution_steps && (
              <Button
                variant="outline"
                onClick={() => setShowSolution(true)}
                className="mt-4"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Solution
              </Button>
            )}

            {showSolution && currentQuestion.solution_steps && (
              <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                <p className="font-medium text-foreground mb-3">Step-by-step Solution:</p>
                <ol className="space-y-2">
                  {currentQuestion.solution_steps.steps.map((step, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{index + 1}.</span> {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>

        {answered && (
          <div className="flex justify-end">
            <Button onClick={handleNext} size="lg">
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Practice'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
