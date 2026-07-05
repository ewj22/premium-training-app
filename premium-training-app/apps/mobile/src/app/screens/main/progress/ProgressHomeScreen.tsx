import { ScrollView, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProgressStackParamList } from "../../../ProgressNavigator";
import { Screen, Text, Card, Button, Badge, LoadingSpinner } from "@shared/components/ui";
import { useProgressPhotos, useUploadPhoto, useBodyMetrics, useRecentCheckins } from "@features/progress/hooks/useProgress";
import { getPhotoUrl } from "@features/progress/api/progressApi";

type Props = NativeStackScreenProps<ProgressStackParamList, "ProgressHome">;

export function ProgressHomeScreen({ navigation }: Props) {
  const { data: photos, isLoading } = useProgressPhotos();
  const { data: metrics } = useBodyMetrics();
  const { data: checkins } = useRecentCheckins();
  const uploadPhoto = useUploadPhoto();

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets[0]) uploadPhoto.mutate({ fileUri: result.assets[0].uri, angle: "front" });
  };

  const statusTone = { pending: "neutral" as const, submitted: "primary" as const, reviewed: "success" as const };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="largeTitle" style={{ marginTop: 16, marginBottom: 16 }}>Progress</Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text variant="title3">Photos</Text>
          <Button label="Upload" size="sm" variant="secondary" loading={uploadPhoto.isPending} onPress={handlePickPhoto} />
        </View>
        {isLoading ? <LoadingSpinner /> : (photos ?? []).length === 0 ? (
          <Card style={{ marginBottom: 16 }}><Text variant="subhead" color="secondary">No progress photos yet.</Text></Card>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {(photos ?? []).map((photo) => (
                <View key={photo.id} style={{ gap: 4 }}>
                  <Image source={{ uri: getPhotoUrl(photo.storagePath) }} style={{ width: 120, height: 160, borderRadius: 14 }} transition={150} />
                  <Text variant="caption" color="tertiary" style={{ textAlign: "center" }}>{photo.takenDate}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        <Text variant="title3" style={{ marginBottom: 12 }}>Body Metrics</Text>
        <Card style={{ gap: 8, marginBottom: 16 }}>
          {(metrics ?? []).length === 0 ? <Text variant="subhead" color="secondary">No measurements recorded yet.</Text> : (
            (metrics ?? []).slice(0, 5).map((m) => (
              <View key={m.id} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="footnote" color="secondary">{m.recordedDate}</Text>
                <Text variant="footnote">{m.weightKg ? `${m.weightKg}kg` : "—"}{m.bodyFatPct ? ` · ${m.bodyFatPct}%` : ""}</Text>
              </View>
            ))
          )}
        </Card>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text variant="title3">Check-ins</Text>
          <Button label="New Check-in" size="sm" variant="secondary" onPress={() => navigation.navigate("SubmitCheckin")} />
        </View>
        {(checkins ?? []).length === 0 ? (
          <Card><Text variant="subhead" color="secondary">No check-ins yet.</Text></Card>
        ) : (
          <View style={{ gap: 8 }}>
            {(checkins ?? []).map((ci: any) => (
              <Card key={ci.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text variant="headline">Week of {ci.week_start_date}</Text>
                  <Badge label={ci.status} tone={statusTone[ci.status as keyof typeof statusTone]} />
                </View>
                {ci.coach_feedback && <Text variant="footnote" color="secondary" style={{ marginTop: 4 }}>Coach: {ci.coach_feedback}</Text>}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
