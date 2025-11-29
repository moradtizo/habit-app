import { ID } from 'react-native-appwrite';
import { databaseId, databases } from './appwrite';

export const createHabit = async (
  habitName: string,
  category: string,
  description?: string
) => {
  try {
    const response = await databases.createDocument(
      databaseId,
      'habits', // collection ID
      ID.unique(),
      {
        habitName,
        category,
        description: description || null,
        createTime: new Date().toISOString(),
        isActive: true
      }
      // Permissions are handled at the collection level in Appwrite
    );
    return response;
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
};

export const getHabits = async () => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      'habits'
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }
};

export const updateHabit = async (
  habitId: string,
  updates: { habitName?: string; category?: string; description?: string; isActive?: boolean }
) => {
  try {
    const response = await databases.updateDocument(
      databaseId,
      'habits',
      habitId,
      {
        ...updates,
        updateTime: new Date().toISOString()
      }
    );
    return response;
  } catch (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};

export const deleteHabit = async (habitId: string) => {
  try {
    await databases.deleteDocument(
      databaseId,
      'habits',
      habitId
    );
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
};

// Habit Completions (for tracking streaks)
export const markHabitComplete = async (habitId: string, date: string) => {
  try {
    const response = await databases.createDocument(
      databaseId,
      'habit_completions',
      ID.unique(),
      {
        completionId: ID.unique(),
        habitId,
        completionDate: date,
        completionStatus: 'completed',
        notes: null,
        streakCount: null
      }
    );
    return response;
  } catch (error) {
    console.error('Error marking habit complete:', error);
    throw error;
  }
};

export const getHabitCompletions = async (habitId: string) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      'habit_completions',
      [`habitId=${habitId}`]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching habit completions:', error);
    throw error;
  }
};

export const getAllCompletions = async () => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      'habit_completions'
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching all completions:', error);
    throw error;
  }
};

export const checkIfCompletedToday = async (habitId: string) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const response = await databases.listDocuments(
      databaseId,
      'habit_completions',
      [`habitId=${habitId}`, `completionDate>=${todayStr}`]
    );
    return response.documents.length > 0;
  } catch (error) {
    console.error('Error checking completion:', error);
    return false;
  }
};

