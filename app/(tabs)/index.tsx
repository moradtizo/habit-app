import { useAuth } from "@/lib/auth-context";
import { deleteHabit, getHabits } from "@/lib/database";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, IconButton, Text } from "react-native-paper";

interface Habit {
  $id: string;
  habitName: string;
  category: string;
  description?: string;
  createTime: string;
  isActive: boolean;
}

export default function Index() {
  const { signOut } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHabits = async () => {
    try {
      const data = await getHabits();
      setHabits(data as Habit[]);
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchHabits();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHabits();
  };

  const handleDelete = (habitId: string, habitName: string) => {
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habitName}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              // Remove from local state
              setHabits((prev) => prev.filter((h) => h.$id !== habitId));
            } catch (error) {
              Alert.alert("Error", "Failed to delete habit");
              console.error("Error deleting habit:", error);
            }
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      health: "heart-pulse",
      productivity: "chart-line",
      learning: "book-open-variant",
      social: "account-group",
      creativity: "palette",
    };
    return icons[category] || "checkbox-marked-circle";
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

  const renderHabit = ({ item }: { item: Habit }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons
              name={getCategoryIcon(item.category) as any}
              size={24}
              color={getCategoryColor(item.category)}
            />
            <Text variant="titleMedium" style={styles.habitName}>
              {item.habitName}
            </Text>
          </View>
          <View style={styles.actionRow}>
            <Chip
              mode="outlined"
              textStyle={{ color: getCategoryColor(item.category) }}
              style={{ borderColor: getCategoryColor(item.category) }}
            >
              {item.category}
            </Chip>
            <IconButton
              icon="delete"
              iconColor="#e74c3c"
              size={20}
              onPress={() => handleDelete(item.$id, item.habitName)}
            />
          </View>
        </View>
        {item.description && (
          <Text variant="bodyMedium" style={styles.description}>
            {item.description}
          </Text>
        )}
        <Text variant="bodySmall" style={styles.date}>
          Created: {new Date(item.createTime).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading habits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          My Habits
        </Text>
        <View style={styles.headerActions}>
          {/* <IconButton
            icon="refresh"
            size={24}
            onPress={fetchHabits}
          /> */}
          <Button mode="text" onPress={signOut} icon="logout">
            Sign out
          </Button>
        </View>
      </View>

      {habits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#95a5a6" />
          <Text variant="titleMedium" style={styles.emptyText}>
            No habits yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Create your first habit to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          renderItem={renderHabit}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor:"#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  habitName: {
    marginLeft: 8,
    fontWeight: "600",
    flex: 1,
  },
  description: {
    color: "#666",
    marginTop: 4,
    marginBottom: 8,
  },
  date: {
    color: "#999",
    marginTop: 4,
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
});

