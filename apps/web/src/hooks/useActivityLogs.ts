import { useState, useEffect } from 'react';

export interface ActivityLog {
  id: string;
  type: 'workout' | 'steps' | 'exercise' | 'cardio' | 'yoga' | 'strength';
  title: string;
  time: string;
  duration: string;
  calories: number;
  timestamp: Date;
  metadata?: {
    steps?: number;
    exercises?: string[];
    heartRate?: number;
    distance?: number;
  };
}

export const useActivityLogs = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Load activity logs from localStorage on mount
  useEffect(() => {
    const savedLogs = localStorage.getItem('activityLogs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs).map((log: { timestamp: string; [key: string]: unknown }) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        setActivityLogs(parsedLogs);
      } catch (error) {
        console.error('Failed to parse activity logs:', error);
      }
    }
  }, []);

  // Save activity logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const addWorkoutLog = (duration: number, calories: number, exercises: string[] = []) => {
    addActivityLog({
      type: 'workout',
      title: 'Progressive Workout Completed',
      time: 'Just now',
      duration: `${duration} min`,
      calories,
      metadata: { exercises }
    });
  };

  const addStepsLog = (steps: number, calories: number) => {
    addActivityLog({
      type: 'steps',
      title: 'Daily Steps Goal Reached',
      time: 'Just now',
      duration: `${steps.toLocaleString()} steps`,
      calories,
      metadata: { steps }
    });
  };

  const addExerciseLog = (exerciseType: string, duration: number, calories: number) => {
    addActivityLog({
      type: 'exercise',
      title: `${exerciseType} Session`,
      time: 'Just now',
      duration: `${duration} min`,
      calories,
      metadata: { exercises: [exerciseType] }
    });
  };

  const getRecentLogs = (limit: number = 10) => {
    return activityLogs.slice(0, limit);
  };

  const getLogsByType = (type: ActivityLog['type']) => {
    return activityLogs.filter(log => log.type === type);
  };

  const getTodayLogs = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activityLogs.filter(log => log.timestamp >= today);
  };

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyLogs = activityLogs.filter(log => log.timestamp >= weekAgo);
    
    return {
      totalWorkouts: weeklyLogs.filter(log => log.type === 'workout').length,
      totalSteps: weeklyLogs
        .filter(log => log.type === 'steps')
        .reduce((sum, log) => sum + (log.metadata?.steps || 0), 0),
      totalCalories: weeklyLogs.reduce((sum, log) => sum + log.calories, 0),
      totalDuration: weeklyLogs
        .filter(log => log.type !== 'steps')
        .reduce((sum, log) => {
          const duration = parseInt(log.duration.split(' ')[0]);
          return sum + (isNaN(duration) ? 0 : duration);
        }, 0)
    };
  };

  const clearLogs = () => {
    setActivityLogs([]);
    localStorage.removeItem('activityLogs');
  };

  return {
    activityLogs,
    addActivityLog,
    addWorkoutLog,
    addStepsLog,
    addExerciseLog,
    getRecentLogs,
    getLogsByType,
    getTodayLogs,
    getWeeklyStats,
    clearLogs
  };
}; 