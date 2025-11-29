import { createHabit } from "@/lib/database";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function AddHabitScreen() {
  const [habitName, setHabitName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: "health", label: "Health", icon: "heart-pulse", color: "#e74c3c" },
    { value: "productivity", label: "Productivity", icon: "chart-line", color: "#3498db" },
    { value: "learning", label: "Learning", icon: "book-open-variant", color: "#9b59b6" },
    { value: "social", label: "Social", icon: "account-group", color: "#f39c12" },
    { value: "creativity", label: "Creativity", icon: "palette", color: "#27ae60" }
  ];

  const handleSubmit = async () => {
    if (!habitName.trim() || !category) {
      Alert.alert("Error", "Please fill in habit name and category");
      return;
    }

    setLoading(true);
    try {
      await createHabit(habitName.trim(), category, description.trim() || undefined);
      Alert.alert("Success", "Habit created successfully!");

      // Reset form
      setHabitName("");
      setCategory("");
      setDescription("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create habit";
      Alert.alert("Error", errorMessage);
      console.error("Error creating habit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          Add New Habit
        </Text>
        
        <TextInput
          label="Habit Name"
          value={habitName}
          onChangeText={setHabitName}
          mode="outlined"
          style={styles.input}
          maxLength={100}
        />
        
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Category
        </Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setCategory(cat.value)}
              style={[
                styles.categoryCard,
                category === cat.value && { borderColor: cat.color, borderWidth: 2 }
              ]}
            >
              <MaterialCommunityIcons 
                name={cat.icon as any} 
                size={32} 
                color={category === cat.value ? cat.color : '#666'} 
              />
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.categoryText,
                  category === cat.value && { color: cat.color, fontWeight: 'bold' }
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TextInput
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
          maxLength={255}
        />
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        >
          Create Habit
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  formContainer: {
    padding: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 32,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  submitButton: {
    marginTop: 24,
  },
});
