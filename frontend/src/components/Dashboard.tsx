import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import {
  getDashboardStats,
  getCalendarData,
  getEmotionTrends,
  getUserProfile,
  deleteUserProfile,
} from '../services/api';
import {
  DashboardStats,
  CalendarEntry,
  EmotionTrend,
  UserProfileResponse,
} from '../types';

interface DashboardProps {
  onNewEntry: () => void;
  onViewArchive: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewEntry, onViewArchive }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarEntry[]>([]);
  const [trends, setTrends] = useState<EmotionTrend[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, calData, trendsData] = await Promise.all([
        getDashboardStats(),
        getCalendarData(),
        getEmotionTrends(30),
      ]);

      setStats(statsData);
      setCalendarData(calData.entries);
      setTrends(trendsData.trends);

      // Try to load user profile (may not exist)
      try {
        const profileData = await getUserProfile();
        setUserProfile(profileData);
      } catch (err) {
        // User profile not found, that's okay
        console.log('No user profile found');
      }

      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getDatesWithEntries = () => {
    const dates = new Set(calendarData.map((entry) => entry.date));
    return dates;
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split('T')[0];
    const hasEntry = getDatesWithEntries().has(dateStr);
    return hasEntry ? 'has-entry' : '';
  };

  const getTopEmotions = () => {
    if (!stats) return [];
    const emotions = Object.entries(stats.emotions_distribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    return emotions;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getEntriesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (!stats) return [];
    return stats.all_entries.filter(entry => {
      const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
      return entryDate === dateStr;
    });
  };

  const handleDateClick = (value: Date) => {
    setSelectedDate(value);
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This will reset the onboarding flow.')) {
      return;
    }

    try {
      await deleteUserProfile();
      localStorage.removeItem('onboarding_complete');
      window.location.reload(); // Reload to trigger onboarding
    } catch (err) {
      console.error('Failed to delete profile:', err);
      alert('Failed to delete profile');
    }
  };

  const renderEmotionTrendsChart = () => {
    if (trends.length === 0) return null;

    // Group trends by emotion
    const emotionGroups = trends.reduce((acc, trend) => {
      if (!acc[trend.emotion]) {
        acc[trend.emotion] = [];
      }
      acc[trend.emotion].push(trend);
      return acc;
    }, {} as Record<string, EmotionTrend[]>);

    // Prepare data for visualization
    const emotionColors: Record<string, string> = {
      happy: '#22c55e',
      sad: '#3b82f6',
      angry: '#ef4444',
      fear: '#8b5cf6',
      surprise: '#f59e0b',
      disgust: '#10b981',
      neutral: '#6b7280',
    };

    const containerWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth - 100, 1200) : 1200;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    // Get all unique dates sorted
    const allDates = Array.from(new Set(trends.map((t) => t.date))).sort();
    if (allDates.length === 0) return null;

    // Create date objects for each unique date
    const uniqueDateObjects = allDates.map(d => new Date(d));

    // Create scales
    const xScale = scaleTime({
      domain: [new Date(allDates[0]), new Date(allDates[allDates.length - 1])],
      range: [margin.left, containerWidth - margin.right],
    });

    const yScale = scaleLinear({
      domain: [0, 1],
      range: [height - margin.bottom, margin.top],
    });

    return (
      <div className="w-full overflow-x-auto">
        <svg width={containerWidth} height={height} className="w-full">
          <GridRows
            scale={yScale}
            width={containerWidth - margin.left - margin.right}
            left={margin.left}
            stroke="#e8e8e8"
            strokeWidth={1}
          />
          <GridColumns
            scale={xScale}
            height={height - margin.top - margin.bottom}
            top={margin.top}
            stroke="#e8e8e8"
            strokeWidth={1}
          />

          {Object.entries(emotionGroups).map(([emotion, emotionTrends]) => {
            const sortedTrends = emotionTrends.sort((a, b) =>
              a.date.localeCompare(b.date)
            );

            return (
              <LinePath
                key={emotion}
                data={sortedTrends}
                x={(d: EmotionTrend) => xScale(new Date(d.date))}
                y={(d: EmotionTrend) => yScale(d.average_confidence)}
                stroke={emotionColors[emotion] || '#666666'}
                strokeWidth={2}
                curve={curveMonotoneX}
              />
            );
          })}

          <AxisBottom
            top={height - margin.bottom}
            scale={xScale}
            stroke="#1a1a1a"
            tickStroke="#1a1a1a"
            numTicks={Math.min(allDates.length, 10)}
            tickValues={uniqueDateObjects}
            tickFormat={(date) => {
              const d = date as Date;
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            tickLabelProps={() => ({
              fill: '#1a1a1a',
              fontSize: 10,
              fontFamily: 'Courier New, monospace',
              textAnchor: 'middle',
            })}
          />
          <AxisLeft
            left={margin.left}
            scale={yScale}
            stroke="#1a1a1a"
            tickStroke="#1a1a1a"
            tickLabelProps={() => ({
              fill: '#1a1a1a',
              fontSize: 10,
              fontFamily: 'Courier New, monospace',
              textAnchor: 'end',
              dx: -4,
            })}
            label="Confidence"
            labelProps={{
              fill: '#1a1a1a',
              fontSize: 12,
              fontFamily: 'Courier New, monospace',
              textAnchor: 'middle',
            }}
          />
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {Object.keys(emotionGroups).map((emotion) => (
            <div key={emotion} className="flex items-center gap-2">
              <div
                className="w-4 h-4 border-2 border-eink-black"
                style={{ backgroundColor: emotionColors[emotion] }}
              />
              <span className="font-mono text-sm text-eink-dark">
                {emotion.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-eink-paper flex items-center justify-center">
        <div className="text-eink-black font-mono text-xl">[ LOADING... ]</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-eink-paper flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-eink-white border-4 border-eink-black p-8">
            <h2 className="text-2xl font-bold text-eink-black mb-4">[ ERROR ]</h2>
            <p className="font-mono text-eink-dark mb-6">{error}</p>
            <button
              onClick={loadDashboardData}
              className="px-6 py-3 border-2 border-eink-black bg-eink-black text-eink-white font-mono hover:bg-eink-dark"
            >
              [ RETRY ]
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eink-paper p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-eink-black mb-2">
                [ DASHBOARD ]
              </h1>
              {userProfile && (
                <p className="text-eink-gray font-mono text-lg">
                  Welcome back, {userProfile.name}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onNewEntry}
                className="px-4 py-2 border-2 border-eink-black bg-eink-black text-eink-white font-mono hover:bg-eink-dark transition-colors whitespace-nowrap"
              >
                [ + NEW ENTRY ]
              </button>
              <button
                onClick={onViewArchive}
                className="px-4 py-2 border-2 border-eink-black bg-eink-white text-eink-black font-mono hover:bg-eink-light transition-colors whitespace-nowrap"
              >
                [ VIEW ARCHIVE ]
              </button>
            </div>
          </div>
          
          {/* Debug Button */}
          <button
            onClick={handleDeleteProfile}
            className="px-3 py-1 border border-eink-gray bg-white text-eink-gray font-mono text-xs hover:bg-eink-light hover:text-eink-black hover:border-eink-black transition-colors"
            title="Delete user profile and reset onboarding (for testing)"
          >
            [ 🐛 DEBUG: RESET ONBOARDING ]
          </button>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Card */}
          <div className="bg-eink-white border-4 border-eink-black p-6">
            <h2 className="text-xl font-bold text-eink-black mb-4 border-b-2 border-eink-black pb-2">
              [ STATS ]
            </h2>
            <div className="space-y-4 font-mono">
              <div>
                <div className="text-eink-gray text-sm">TOTAL ENTRIES</div>
                <div className="text-3xl font-bold text-eink-black">
                  {stats?.total_entries || 0}
                </div>
              </div>
              <div>
                <div className="text-eink-gray text-sm">RECORDING TIME</div>
                <div className="text-2xl font-bold text-eink-black">
                  {formatDuration(stats?.total_recording_time || 0)}
                </div>
              </div>
              <div>
                <div className="text-eink-gray text-sm mb-2">TOP EMOTIONS</div>
                <div className="space-y-1">
                  {getTopEmotions().map(([emotion, count]) => (
                    <div key={emotion} className="flex justify-between text-sm">
                      <span className="text-eink-dark">{emotion}</span>
                      <span className="text-eink-black font-bold">{count}</span>
                    </div>
                  ))}
                  {getTopEmotions().length === 0 && (
                    <div className="text-eink-gray text-sm">No data yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Card */}
          <div className="bg-eink-white border-4 border-eink-black p-6 md:col-span-2">
            <h2 className="text-xl font-bold text-eink-black mb-4 border-b-2 border-eink-black pb-2">
              [ CALENDAR ]
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="calendar-wrapper">
                <Calendar
                  tileClassName={tileClassName}
                  className="border-2 border-eink-black font-mono"
                  onClickDay={handleDateClick}
                  value={selectedDate}
                />
                <style>{`
                  .calendar-wrapper .react-calendar {
                    border: none;
                    font-family: 'Courier New', monospace;
                    background: #f5f5f5;
                    width: 100%;
                  }
                  .calendar-wrapper .react-calendar__tile {
                    border: 1px solid #e8e8e8;
                    background: white;
                    padding: 10px;
                  }
                  .calendar-wrapper .react-calendar__tile:hover {
                    background: #cccccc;
                  }
                  .calendar-wrapper .react-calendar__tile.has-entry {
                    background: #1a1a1a;
                    color: #e8e8e8;
                    font-weight: bold;
                  }
                  .calendar-wrapper .react-calendar__tile.has-entry:hover {
                    background: #333333;
                  }
                  .calendar-wrapper .react-calendar__tile--active {
                    background: #666666 !important;
                    color: white;
                  }
                  .calendar-wrapper .react-calendar__navigation button {
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    color: #1a1a1a;
                  }
                `}</style>
              </div>
              
              {/* Selected Date Info */}
              <div className="border-2 border-eink-black bg-eink-paper p-4">
                <h3 className="font-mono text-sm text-eink-gray mb-3 border-b border-eink-gray pb-2">
                  SELECTED DATE
                </h3>
                {!selectedDate ? (
                  <div className="text-center py-8 text-eink-gray font-mono text-sm">
                    No day selected
                  </div>
                ) : (
                  <>
                    <div className="font-mono text-eink-black mb-4">
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    {getEntriesForDate(selectedDate).length === 0 ? (
                      <div className="text-eink-gray font-mono text-sm py-4">
                        No entries for this day
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getEntriesForDate(selectedDate).map((entry) => (
                          <div
                            key={entry.id}
                            className="border border-eink-black p-3 bg-white hover:bg-eink-light transition-colors"
                          >
                            <div className="font-mono text-sm text-eink-dark mb-1 truncate">
                              {entry.filename}
                            </div>
                            <div className="text-xs text-eink-gray font-mono">
                              {new Date(entry.created_at).toLocaleTimeString()}
                            </div>
                            {entry.has_analysis && (
                              <div className="mt-1 text-xs font-mono text-green-700">
                                ✓ ANALYZED
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Emotion Trends Chart */}
          <div className="bg-eink-white border-4 border-eink-black p-6 lg:col-span-3">
            <h2 className="text-xl font-bold text-eink-black mb-4 border-b-2 border-eink-black pb-2">
              [ EMOTION TRENDS ]
            </h2>
            {trends.length > 0 ? (
              renderEmotionTrendsChart()
            ) : (
              <div className="text-center py-12 text-eink-gray font-mono">
                No trend data available yet. Record more entries to see patterns.
              </div>
            )}
          </div>

          {/* Recent Entries */}
          {stats && stats.recent_entries.length > 0 && (
            <div className="bg-eink-white border-4 border-eink-black p-6 lg:col-span-3">
              <h2 className="text-xl font-bold text-eink-black mb-4 border-b-2 border-eink-black pb-2">
                [ RECENT ENTRIES ]
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.recent_entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border-2 border-eink-black p-4 bg-eink-paper hover:bg-eink-light transition-colors cursor-pointer"
                  >
                    <div className="font-mono text-sm text-eink-dark truncate mb-2">
                      {entry.filename}
                    </div>
                    <div className="text-xs text-eink-gray font-mono">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                    {entry.has_analysis && (
                      <div className="mt-2 text-xs font-mono text-green-700">
                        ✓ ANALYZED
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
