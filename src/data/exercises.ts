/** The preloaded exercise library. Plain-English descriptions aimed at a beginner. */
import type { Exercise } from './types';

type Seed = Pick<Exercise, 'id' | 'name' | 'kind' | 'category' | 'description' | 'emoji'> &
  Partial<Pick<Exercise, 'repMin' | 'repMax' | 'sets' | 'weightStep' | 'cardioFocus'>>;

const SEEDS: Seed[] = [
  // ── Strength (weights) ──
  { id: 'goblet-squat', name: 'Goblet Squat', kind: 'weight', category: 'strength', emoji: '🏋️', weightStep: 5,
    description: 'Hold one dumbbell at your chest. Sit back like into a chair, then stand up tall.' },
  { id: 'db-curl', name: 'Bicep Curl', kind: 'weight', category: 'strength', emoji: '💪', weightStep: 2.5,
    description: 'Hold a dumbbell in each hand, palms up. Bend your elbows to lift, then lower slowly.' },
  { id: 'db-press', name: 'Shoulder Press', kind: 'weight', category: 'strength', emoji: '🙌', weightStep: 2.5,
    description: 'Sitting tall, push dumbbells from your shoulders up overhead, then lower with control.' },
  { id: 'db-row', name: 'One-Arm Row', kind: 'weight', category: 'strength', emoji: '🚣', weightStep: 2.5,
    description: 'Lean on a bench with one hand. Pull the dumbbell up toward your hip, then lower.' },
  { id: 'chest-press', name: 'Chest Press (Machine)', kind: 'weight', category: 'strength', emoji: '🫸', weightStep: 5,
    description: 'Sit with your back against the pad. Push the handles forward until arms are straight.' },
  { id: 'leg-press', name: 'Leg Press (Machine)', kind: 'weight', category: 'strength', emoji: '🦵', weightStep: 10,
    description: 'Feet flat on the platform. Push it away until legs are almost straight, then bend back.' },
  { id: 'lat-pulldown', name: 'Lat Pulldown (Machine)', kind: 'weight', category: 'strength', emoji: '⬇️', weightStep: 5,
    description: 'Hold the bar wide. Pull it down to your upper chest, then let it rise slowly.' },
  { id: 'rdl', name: 'Dumbbell Deadlift', kind: 'weight', category: 'strength', emoji: '🧺', weightStep: 5,
    description: 'Hold dumbbells in front. Push your hips back with a flat back, then stand up tall.' },
  { id: 'lateral-raise', name: 'Side Arm Raise', kind: 'weight', category: 'strength', emoji: '🕊️', weightStep: 2.5,
    description: 'Light dumbbells at your sides. Lift your arms out to shoulder height, then lower.' },
  { id: 'calf-raise', name: 'Calf Raise', kind: 'weight', category: 'strength', emoji: '👠', weightStep: 5, repMin: 10, repMax: 15,
    description: 'Hold a dumbbell (and a wall for balance). Rise up onto your toes, then lower slowly.' },

  // ── Bodyweight ──
  { id: 'sit-to-stand', name: 'Sit-to-Stand', kind: 'reps', category: 'bodyweight', emoji: '🪑',
    description: 'Sit near the edge of a sturdy chair. Stand up without using your hands, then sit back down.' },
  { id: 'wall-pushup', name: 'Wall Push-Up', kind: 'reps', category: 'bodyweight', emoji: '🧱',
    description: 'Hands on a wall at shoulder height. Bend your elbows to lean in, then push back.' },
  { id: 'counter-pushup', name: 'Counter Push-Up', kind: 'reps', category: 'bodyweight', emoji: '🍳',
    description: 'Like a wall push-up, but with hands on a kitchen counter. A step harder.' },
  { id: 'glute-bridge', name: 'Glute Bridge', kind: 'reps', category: 'bodyweight', emoji: '🌉',
    description: 'Lie on your back, knees bent. Squeeze your bottom and lift your hips, then lower.' },
  { id: 'step-up', name: 'Step-Up', kind: 'reps', category: 'bodyweight', emoji: '🪜',
    description: 'Step up onto a low, sturdy step with one foot, then the other. Step down. Hold a rail.' },
  { id: 'bird-dog', name: 'Bird Dog', kind: 'reps', category: 'bodyweight', emoji: '🐦',
    description: 'On hands and knees, reach one arm forward and the opposite leg back. Switch sides.' },
  { id: 'heel-raise', name: 'Heel Raise', kind: 'reps', category: 'bodyweight', emoji: '🦶', repMin: 10, repMax: 20,
    description: 'Hold a counter. Rise up onto your toes, then lower slowly. Great for balance.' },
  { id: 'plank', name: 'Plank (Knees)', kind: 'cardio', category: 'bodyweight', emoji: '🪵', cardioFocus: 'time',
    description: 'On forearms and knees, hold your body in a straight line. Breathe! Count the seconds.' },

  // ── Cardio ──
  { id: 'walk', name: 'Walk', kind: 'cardio', category: 'cardio', emoji: '🚶‍♀️', cardioFocus: 'distance',
    description: 'A good old walk. Outside, at the mall, or on a treadmill — it all counts.' },
  { id: 'bike', name: 'Stationary Bike', kind: 'cardio', category: 'cardio', emoji: '🚲', cardioFocus: 'time',
    description: 'Pedal at a pace where you can still chat. Adjust the seat so your knee is slightly bent.' },
  { id: 'elliptical', name: 'Elliptical', kind: 'cardio', category: 'cardio', emoji: '🌀', cardioFocus: 'time',
    description: 'Smooth, low-impact striding. Hold the handles and keep a comfy pace.' },
  { id: 'swim', name: 'Swim', kind: 'cardio', category: 'cardio', emoji: '🏊‍♀️', cardioFocus: 'time',
    description: 'Laps, water walking, or water aerobics — gentle on the joints.' },
  { id: 'dance', name: 'Dance', kind: 'cardio', category: 'cardio', emoji: '💃', cardioFocus: 'time',
    description: 'Put on a favourite song and move! Every song is about 3 minutes.' },
  { id: 'stretch', name: 'Stretching', kind: 'cardio', category: 'cardio', emoji: '🧘‍♀️', cardioFocus: 'time',
    description: 'Gentle stretches for neck, shoulders, hips and legs. Never stretch into pain.' },
];

export function seedExercises(): Exercise[] {
  const now = Date.now();
  return SEEDS.map((s) => ({
    repMin: s.kind === 'reps' ? 8 : 8,
    repMax: s.kind === 'reps' ? 15 : 12,
    sets: s.kind === 'cardio' ? 1 : 2,
    weightStep: 0,
    favorite: false,
    custom: false,
    archived: false,
    createdAt: now,
    ...s,
  }));
}

/** Sensible defaults for a brand-new custom exercise. */
export function blankExercise(kind: Exercise['kind']): Omit<Exercise, 'id' | 'name'> {
  return {
    kind,
    category: kind === 'cardio' ? 'cardio' : kind === 'reps' ? 'bodyweight' : 'strength',
    description: '',
    emoji: kind === 'cardio' ? '🌼' : kind === 'reps' ? '🤸‍♀️' : '🏋️',
    repMin: 8,
    repMax: kind === 'reps' ? 15 : 12,
    sets: kind === 'cardio' ? 1 : 2,
    weightStep: kind === 'weight' ? 2.5 : 0,
    cardioFocus: kind === 'cardio' ? 'time' : undefined,
    favorite: true,
    custom: true,
    archived: false,
    createdAt: Date.now(),
  };
}
