import { useEffect, useRef, useState } from "react";
import { ScrollView, View, Modal, Pressable, TextInput, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { WorkoutsStackParamList } from "../../../WorkoutsNavigator";
import { Screen, Text, Button, LoadingSpinner } from "@shared/components/ui";
import { useSessionDetail, useCompleteWorkout, ExerciseCard, RestTimer, useActiveWorkoutStore } from "@features/workouts";
import { useSaveAsTemplate } from "@features/workouts/hooks/templateHooks";
import { colors } from "@shared/theme/tokens";

type Props = NativeStackScreenProps<WorkoutsStackParamList, "ActiveWorkout">;

export function ActiveWorkoutScreen({ route, navigation }: Props) {
  const { sessionId } = route.params;
  const { data: exercises, isLoading } = useSessionDetail(sessionId);
  const completeWorkout = useCompleteWorkout();
  const saveTemplate = useSaveAsTemplate();
  const startSession = useActiveWorkoutStore((s) => s.startSession);
  const endSession = useActiveWorkoutStore((s) => s.endSession);
  const startRestTimer = useActiveWorkoutStore((s) => s.startRestTimer);
  const startedAtMs = useRef(Date.now());

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState("My Workout");
  const [exerciseIdsForTemplate, setExerciseIdsForTemplate] = useState<string[]>([]);

  useEffect(() => { startSession(sessionId); return () => endSession(); }, [sessionId]);

  const handleFinish = () => {
    const durationSeconds = Math.round((Date.now() - startedAtMs.current) / 1000);
    completeWorkout.mutate({ sessionId, durationSeconds }, {
      onSuccess: () => {
        const ids = exercises?.map((e) => e.exerciseId) ?? [];
        if (ids.length > 0) {
          setExerciseIdsForTemplate(ids);
          setShowSaveModal(true);
        } else {
          navigation.navigate("WorkoutsHome");
        }
      },
    });
  };

  const handleSaveTemplate = () => {
    saveTemplate.mutate(
      { title: templateName.trim() || "My Workout", exerciseIds: exerciseIdsForTemplate },
      {
        onSuccess: () => {
          setShowSaveModal(false);
          navigation.navigate("WorkoutsHome");
        },
        onError: () => {
          setShowSaveModal(false);
          navigation.navigate("WorkoutsHome");
        },
      }
    );
  };

  const handleSkipTemplate = () => {
    setShowSaveModal(false);
    navigation.navigate("WorkoutsHome");
  };

  if (isLoading) return <LoadingSpinner message="Loading workout..." />;

  return (
    <Screen>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 16 }}>
        <Text variant="title1">Workout</Text>
        <Button label="Finish" size="sm" loading={completeWorkout.isPending} onPress={handleFinish} />
      </View>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {exercises?.map((ex) => <ExerciseCard key={ex.id} loggedExercise={ex} onSetLogged={() => startRestTimer(90)} />)}
      </ScrollView>
      <View style={{ position: "absolute", bottom: 24, left: 16, right: 16 }}>
        <RestTimer />
      </View>

      {/* Save as Template Modal */}
      <Modal visible={showSaveModal} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={handleSkipTemplate}>
          <View style={styles.modal}>
            <Text variant="title3" style={{ marginBottom: 4 }}>Save as Template?</Text>
            <Text variant="subhead" color="secondary" style={{ marginBottom: 16 }}>
              Reuse this workout configuration next time.
            </Text>
            <TextInput
              style={styles.input}
              value={templateName}
              onChangeText={setTemplateName}
              placeholder="Template name"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
              <Button label="Skip" variant="secondary" size="sm" onPress={handleSkipTemplate} style={{ flex: 1 }} />
              <Button label="Save" size="sm" loading={saveTemplate.isPending} onPress={handleSaveTemplate} style={{ flex: 1 }} />
            </View>
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modal: { width: "85%", backgroundColor: colors.backgroundCard, borderRadius: 20, padding: 24 },
  input: { height: 48, paddingHorizontal: 16, borderRadius: 10, backgroundColor: colors.backgroundElevated, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, fontSize: 17 },
});
