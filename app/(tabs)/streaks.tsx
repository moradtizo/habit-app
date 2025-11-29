import { getAllCompletions, getHabits, markHabitComplete } from "@/lib/database";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, Text } from "react-native-paper";

interface Habit {
  $id: string;
  habitName: string;
  category: string;
  description?: string;
  createTime: string;
  isActive: boolean;
}

interface Completion {
  $id: string;
  completionId: string;
  habitId: string;
  completionDate: string;
  completionStatus: string;
  notes?: string;
  streakCount?: number;
  $createdAt: string;
  $updatedAt: string;
}

export default function StreaksScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectionMissing, setCollectionMissing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const habitsData = await getHabits();
      setHabits(habitsData as Habit[]);

      // Try to fetch completions, but handle if collection doesn't exist yet
      try {
        const completionsData = await getAllCompletions();
        setCompletions(completionsData as Completion[]);
        setCollectionMissing(false);
      } catch (completionError: any) {
        if (completionError?.message?.includes("Collection")) {
          console.warn("habit_completions collection not found. Please create it in Appwrite.");
          setCompletions([]);
          setCollectionMissing(true);
        } else {
          throw completionError;
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const calculateStreak = (habitId: string) => {
    const habitCompletions = completions
      .filter((c) => c.habitId === habitId)
      .map((c) => new Date(c.completionDate).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (habitCompletions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < habitCompletions.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      const expectedDateStr = expectedDate.toDateString();

      if (habitCompletions.includes(expectedDateStr)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getTotalCompletions = (habitId: string) => {
    return completions.filter((c) => c.habitId === habitId).length;
  };

  const isCompletedToday = (habitId: string) => {
    const today = new Date().toDateString();
    return completions.some(
      (c) => c.habitId === habitId && new Date(c.completionDate).toDateString() === today
    );
  };

  const handleMarkComplete = async (habitId: string) => {
    try {
      const today = new Date().toISOString();
      await markHabitComplete(habitId, today);
      await fetchData();
    } catch (error) {
      console.error("Error marking habit complete:", error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      health: "#e74c3c",
      productivity: "#3498db",
      learning: "#9b59b6",
      social: "#f39c12",
      creativity: "#27ae60",
    };
    return colors[category] || "#95a5a6";
  };

  const renderHabitStreak = ({ item }: { item: Habit }) => {
    const streak = calculateStreak(item.$id);
    const totalCompletions = getTotalCompletions(item.$id);
    const completedToday = isCompletedToday(item.$id);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.habitName}>
              {item.habitName}
            </Text>
            <Chip
              mode="outlined"
              textStyle={{ color: getCategoryColor(item.category) }}
              style={{ borderColor: getCategoryColor(item.category) }}
            >
              {item.category}
            </Chip>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="fire" size={32} color="#ff6b35" />
              <Text variant="headlineSmall" style={styles.statNumber}>
                {streak}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Day Streak
              </Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons name="check-circle" size={32} color="#4caf50" />
              <Text variant="headlineSmall" style={styles.statNumber}>
                {totalCompletions}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total
              </Text>
            </View>
          </View>

          <Button
            mode={completedToday ? "outlined" : "contained"}
            onPress={() => handleMarkComplete(item.$id)}
            disabled={completedToday}
            style={styles.completeButton}
            icon={completedToday ? "check" : "checkbox-marked-circle"}
          >
            {completedToday ? "Completed Today" : "Mark Complete"}
          </Button>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading streaks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Habit Streaks
        </Text>
      </View>

      {collectionMissing && (
        <Card style={styles.warningCard}>
          <Card.Content>
            <View style={styles.warningContent}>
              <MaterialCommunityIcons name="alert-circle" size={32} color="#ff9800" />
              <Text variant="titleMedium" style={styles.warningTitle}>
                Setup Required
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.warningText}>
              Please create the "habit_completions" collection in Appwrite to track streaks.
            </Text>
            <Text variant="bodySmall" style={styles.warningSubtext}>
              Collection ID: habit_completions{"\n"}
              Attributes: habitId (string), completionDate (datetime), createdAt (datetime)
            </Text>
          </Card.Content>
        </Card>
      )}

      {habits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="fire-off" size={64} color="#95a5a6" />
          <Text variant="titleMedium" style={styles.emptyText}>
            No habits yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Create habits to start tracking your streaks!
          </Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          renderItem={renderHabitStreak}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  habitName: {
    fontWeight: "600",
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    color: "#666",
    marginTop: 4,
  },
  completeButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    color: "#666",
  },
  emptySubtext: {
    marginTop: 8,
    color: "#999",
    textAlign: "center",
  },
  warningCard: {
    margin: 16,
    backgroundColor: "#fff3e0",
    borderLeftWidth: 4,
    borderLeftColor: "#ff9800",
  },
  warningContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  warningTitle: {
    marginLeft: 8,
    fontWeight: "bold",
    color: "#ff9800",
  },
  warningText: {
    marginTop: 8,
    color: "#666",
  },
  warningSubtext: {
    marginTop: 8,
    color: "#999",
    fontFamily: "monospace",
  },
});
