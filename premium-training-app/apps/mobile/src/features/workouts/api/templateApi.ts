import { supabase } from "@shared/lib/supabase";

export interface WorkoutTemplate {
  id: string;
  title: string;
  exerciseNames: string[];
  exerciseIds: string[];
}

export async function fetchMyTemplates(clientId: string): Promise<WorkoutTemplate[]> {
  const { data, error } = await supabase
    .from("programmes")
    .select("id, title")
    .eq("coach_id", clientId)
    .eq("is_template", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const templates: WorkoutTemplate[] = [];

  for (const prog of data) {
    const { data: wts } = await supabase
      .from("workout_templates")
      .select("id")
      .eq("programme_id", prog.id)
      .limit(1);

    if (!wts || wts.length === 0) continue;

    const { data: wtes } = await supabase
      .from("workout_template_exercises")
      .select("exercise_id, sort_order, exercises(name)")
      .eq("workout_template_id", wts[0].id)
      .order("sort_order");

    templates.push({
      id: prog.id,
      title: prog.title,
      exerciseNames: (wtes ?? []).map((e: any) => e.exercises?.name ?? "Exercise"),
      exerciseIds: (wtes ?? []).map((e: any) => e.exercise_id),
    });
  }

  return templates;
}

export async function saveAsTemplate(clientId: string, title: string, exerciseIds: string[]): Promise<void> {
  // Step 1: Create programme
  const { data: prog, error: progError } = await supabase
    .from("programmes")
    .insert({ coach_id: clientId, title, is_template: true })
    .select("id")
    .single();

  if (progError) {
    console.error("Failed to create programme:", progError);
    throw progError;
  }

  // Step 2: Create workout template
  const { data: wt, error: wtError } = await supabase
    .from("workout_templates")
    .insert({ programme_id: prog.id, title, day_order: 0 })
    .select("id")
    .single();

  if (wtError) {
    console.error("Failed to create workout template:", wtError);
    // Clean up the programme we just created
    await supabase.from("programmes").delete().eq("id", prog.id);
    throw wtError;
  }

  // Step 3: Add exercises
  const rows = exerciseIds.map((eid, i) => ({
    workout_template_id: wt.id,
    exercise_id: eid,
    sort_order: i,
    target_sets: 3,
    target_reps: "8-12",
  }));

  const { error: exError } = await supabase
    .from("workout_template_exercises")
    .insert(rows);

  if (exError) {
    console.error("Failed to add template exercises:", exError);
    // Clean up
    await supabase.from("programmes").delete().eq("id", prog.id);
    throw exError;
  }
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const { error } = await supabase.from("programmes").delete().eq("id", templateId);
  if (error) throw error;
}
