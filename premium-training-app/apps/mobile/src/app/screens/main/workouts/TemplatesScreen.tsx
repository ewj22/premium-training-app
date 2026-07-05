import { FlatList, View, Pressable } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { WorkoutsStackParamList } from "../../../WorkoutsNavigator";
import { Screen, Text, Card, Button, EmptyState, LoadingSpinner } from "@shared/components/ui";
import { useStartQuickWorkout } from "@features/workouts";
import { useMyTemplates, useDeleteTemplate } from "@features/workouts/hooks/templateHooks";

type Props = NativeStackScreenProps<WorkoutsStackParamList, "Templates">;

export function TemplatesScreen({ navigation }: Props) {
  const { data: templates, isLoading } = useMyTemplates();
  const startWorkout = useStartQuickWorkout();
  const deleteTemplate = useDeleteTemplate();

  const handleUseTemplate = (title: string, exerciseIds: string[]) => {
    startWorkout.mutate({ title, exerciseIds }, {
      onSuccess: ({ sessionId }) => navigation.replace("ActiveWorkout", { sessionId }),
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Screen>
      <Text variant="largeTitle" style={{ marginTop: 8, marginBottom: 16 }}>📋 My Templates</Text>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        ListEmptyComponent={<EmptyState title="No templates yet" description="After a workout, save it as a template to reuse it quickly." />}
        renderItem={({ item }) => (
          <Card style={{ gap: 8 }}>
            <Text variant="headline">{item.title}</Text>
            <Text variant="footnote" color="secondary">{item.exerciseNames.join(" · ")}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
              <Button label="▶ Use Template" size="sm" onPress={() => handleUseTemplate(item.title, item.exerciseIds)} style={{ flex: 1 }} />
              <Pressable onPress={() => deleteTemplate.mutate(item.id)} style={{ justifyContent: "center", paddingHorizontal: 12 }}>
                <Text variant="footnote" color="danger">Delete</Text>
              </Pressable>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}
