import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ListChecks } from 'lucide-react';

export default function WrongAnswers() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    items: Array<{
      id: number;
      question_text: string;
      options: string[];
      selected_index: number;
      correct_index: number;
      explanation: string;
      solution_steps: { steps: string[] } | null;
    }>;
    meta?: {
      topicId: number;
      difficulty: string;
    };
  } | null;

  const items = state?.items || [];

  if (!state || !items || items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-destructive/50">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-destructive mb-2">No Wrong Answers</h2>
            <p className="text-muted-foreground mb-6">
              There are no wrong answers to display for this test.
            </p>
            <Button onClick={() => navigate('/test/results')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate('/test/results')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
        </div>

        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <ListChecks className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-foreground">Wrong Answers</CardTitle>
            {state?.meta && (
              <p className="text-sm text-muted-foreground">
                {`Topic #${state.meta.topicId} • ${state.meta.difficulty}`}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="p-4 rounded-lg border border-border">
                <p className="font-medium text-foreground mb-3">{item.question_text}</p>
                <div className="space-y-2 mb-4">
                  {item.options?.map((opt, idx) => {
                    const isSelected = idx === item.selected_index;
                    const isCorrect = idx === item.correct_index;
                    let cls = 'px-3 py-2 rounded-md text-sm border';
                    if (isCorrect) {
                      cls += ' bg-success/10 border-success/30 text-success';
                    } else if (isSelected) {
                      cls += ' bg-destructive/10 border-destructive/30 text-destructive';
                    } else {
                      cls += ' bg-muted border-border text-muted-foreground';
                    }
                    return (
                      <div key={idx} className={cls}>
                        {opt}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2">
                  <h5 className="font-semibold text-foreground mb-2">Explanation</h5>
                  <p className="text-sm text-muted-foreground">{item.explanation || 'No explanation provided.'}</p>
                </div>
                {item.solution_steps && item.solution_steps.steps && item.solution_steps.steps.length > 0 && (
                  <div className="mt-3">
                    <h5 className="font-semibold text-foreground mb-2">Solution Steps</h5>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {item.solution_steps.steps.map((step, i) => {
                        const text = typeof step === 'string'
                          ? step.replace(/^\s*(\d+[\.\)]|[-•])\s*/, '')
                          : String(step);
                        return <li key={i}>{text}</li>;
                      })}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
