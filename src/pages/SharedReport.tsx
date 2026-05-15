import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sharedReportsApi } from '@/db/api';
import type { SharedReport as SharedReportType } from '@/types/types';
import { ArrowLeft, Trophy, Target, Clock, Award, Zap, Eye } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SharedReport() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<SharedReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (shareId) {
      fetchReport();
    }
  }, [shareId]);

  const fetchReport = async () => {
    if (!shareId) return;
    
    setLoading(true);
    try {
      const data = await sharedReportsApi.getByShareId(shareId);
      if (data) {
        setReport(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error fetching shared report:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading progress report...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-destructive/50">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-destructive mb-2">Report Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This progress report doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { report_data, username, created_at, view_count } = report;
  const { stats, weeklyData, achievements } = report_data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{view_count} views</span>
          </div>
        </div>

        {/* Main Report Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl text-primary mb-2">{username}'s Progress Report</CardTitle>
            <p className="text-sm text-muted-foreground">
              Shared on {new Date(created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 border-secondary/30 bg-secondary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-secondary" />
                    <span className="text-sm text-muted-foreground">Average Score</span>
                  </div>
                  <p className="text-3xl font-bold text-secondary">{stats.averageScore}%</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-accent/30 bg-accent/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-accent-foreground" />
                    <span className="text-sm text-muted-foreground">Questions Today</span>
                  </div>
                  <p className="text-3xl font-bold text-accent-foreground">{stats.questionsSolvedToday}</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Avg Time</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">{formatTime(stats.averageTime)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="h-6 w-6 text-secondary" />
                Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-secondary/30 bg-secondary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-secondary" />
                      <span className="text-sm font-medium">Best Score</span>
                    </div>
                    <p className="text-2xl font-bold text-secondary">{achievements.bestScore}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{achievements.bestScoreDate}</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-accent/30 bg-accent/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-accent-foreground" />
                      <span className="text-sm font-medium">Fastest Time</span>
                    </div>
                    <p className="text-2xl font-bold text-accent-foreground">
                      {achievements.fastestTime !== Infinity ? `${Math.round(achievements.fastestTime)}s/Q` : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{achievements.fastestTimeDate}</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Total Questions</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{achievements.totalQuestions}</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Total Tests</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{achievements.totalTests}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Weekly Charts */}
            {weeklyData && weeklyData.length > 0 && (
              <>
                {/* Score Chart */}
                {weeklyData.some(d => d.score > 0) && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Weekly Score Progress</h3>
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                              domain={[0, 100]}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))', 
                                border: '1px solid hsl(var(--border))' 
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke="hsl(var(--secondary))" 
                              strokeWidth={3}
                              name="Avg Score (%)"
                              dot={{ fill: 'hsl(var(--secondary))', r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Time Chart */}
                {weeklyData.some(d => d.time > 0) && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Weekly Time Efficiency</h3>
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))', 
                                border: '1px solid hsl(var(--border))' 
                              }}
                            />
                            <Bar 
                              dataKey="time" 
                              fill="hsl(var(--primary))" 
                              name="Avg Time (min)"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Want to track your own progress?</h3>
            <p className="text-muted-foreground mb-4">
              Join Aptix and start your learning journey today!
            </p>
            <Button size="lg" onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
