import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Interview {
  mockId: string;
  jobPosition: string;
  jobExperience: string;
  createdAt: string;
  tags?: string;
}

interface GroupedInterviews {
  [year: string]: {
    [month: string]: Interview[];
  };
}

interface Props {
  interviews: Interview[];
}

const GroupedInterviewList: React.FC<Props> = ({ interviews }) => {
  const router = useRouter();
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  // Group interviews by year and month
  const groupedInterviews = interviews.reduce<GroupedInterviews>((acc, interview) => {
    const date = new Date(interview.createdAt.split('-').reverse().join('-'));
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('default', { month: 'long' });

    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][month]) {
      acc[year][month] = [];
    }
    acc[year][month].push(interview);
    return acc;
  }, {});

  // Toggle month expansion
  const toggleMonth = (year: string, month: string) => {
    const key = `${year}-${month}`;
    setExpandedMonths(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getTagColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-500/80 text-emerald-50';
    if (score >= 5) return 'bg-amber-500/80 text-amber-50';
    return 'bg-rose-500/80 text-rose-50';
  };

  const parseTags = (tags: string | undefined): Record<string, number> => {
    try {
      return JSON.parse(tags || '{}') as Record<string, number>;
    } catch {
      return {};
    }
  };

  const onFeedbackPress = (mockId: string) => {
    router.push(`dashboard/interview/${mockId}/feedback`);
  };

  return (
    <Card className="bg-white/5 border-0">
      <CardHeader className="p-6">
        <CardTitle className="text-xl text-white flex items-center gap-3">
          <Calendar className="w-6 h-6" />
          Previous Mock Interviews
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-6">
          {Object.entries(groupedInterviews)
            .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
            .map(([year, months]) => (
              <div key={year} className="space-y-4">
                <h3 className="text-2xl font-bold text-white/90 border-b border-white/10 pb-2">
                  {year}
                </h3>
                <div className="space-y-4 pl-4">
                  {Object.entries(months)
                    .sort(([monthA], [monthB]) => {
                      const dateA = new Date(`${monthA} 1, 2000`);
                      const dateB = new Date(`${monthB} 1, 2000`);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .map(([month, monthInterviews]) => {
                      const isExpanded = expandedMonths[`${year}-${month}`];
                      return (
                        <div key={`${year}-${month}`} className="space-y-3">
                          <button
                            onClick={() => toggleMonth(year, month)}
                            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-full text-left"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span className="text-lg font-semibold">
                              {month} ({monthInterviews.length})
                            </span>
                          </button>
                          
                          {isExpanded && (
                            <div className="space-y-4 pl-6">
                              {monthInterviews.map((interview) => (
                                <Card 
                                  key={interview.mockId}
                                  className="bg-white/5 hover:bg-white/10 transition-colors duration-200 border-0"
                                >
                                  <CardContent className="p-6">
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-semibold text-lg text-white">
                                          {interview.jobPosition}
                                        </h4>
                                        <p className="text-sm text-gray-400">
                                          {interview.jobExperience}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {interview.createdAt}
                                        </p>
                                      </div>
                                      
                                      <div className="flex flex-wrap gap-2">
                                        {Object.entries(parseTags(interview.tags)).map(([skill, score], index) => (
                                          <span
                                            key={index}
                                            className={`text-sm px-3 py-1.5 rounded-full font-medium ${getTagColor(score)}`}
                                          >
                                            {skill}
                                          </span>
                                        ))}
                                      </div>

                                      <Button 
                                        variant="outline" 
                                        className="w-full hover:bg-white/10" 
                                        onClick={() => onFeedbackPress(interview.mockId)}
                                      >
                                        View Feedback
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupedInterviewList;