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

