/**
 * The preloaded exercise library, set up for an intermediate lifter: mostly barbell, dumbbell,
 * machine and cable lifts, plus a few intermediate bodyweight moves. Descriptions are short form cues.
 *
 * startWeight is a first-time guess in lb (per dumbbell for dumbbell lifts, total for barbells and
 * machines). Once she logs a real weight the app follows her history instead.
 * Changing this list? Existing installs pick it up through the database upgrade in dexieStore.ts.
 */
import type { Exercise } from './types';

type Seed = Pick<Exercise, 'id' | 'name' | 'kind' | 'category' | 'description' | 'emoji'> &
  Partial<Pick<Exercise, 'repMin' | 'repMax' | 'sets' | 'weightStep' | 'cardioFocus' | 'group' | 'startWeight'>>;

/** Rep ranges by lift type. */
const BIG = { repMin: 6, repMax: 10 }; // squat, bench, deadlift-style lifts
const ACC = { repMin: 8, repMax: 12 }; // most accessories
const ISO = { repMin: 10, repMax: 15 }; // small isolation lifts

const SEEDS: Seed[] = [
  // ── Legs & glutes ──
  { id: 'back-squat', name: 'Back Squat', kind: 'weight', category: 'strength', group: 'legs', emoji: '🏋️', weightStep: 5, startWeight: 95, ...BIG,
    description: 'Bar on your upper back, brace your core, sit down between your heels to at least parallel, drive up.' },
  { id: 'deadlift', name: 'Deadlift', kind: 'weight', category: 'strength', group: 'legs', emoji: '🪵', weightStep: 5, startWeight: 115, repMin: 5, repMax: 8,
    description: 'Bar over mid-foot, flat back, push the floor away and lock out with your hips. Lower under control.' },
  { id: 'rdl', name: 'Romanian Deadlift', kind: 'weight', category: 'strength', group: 'legs', emoji: '🧺', weightStep: 5, startWeight: 85, ...ACC,
    description: 'Soft knees, push your hips back until you feel your hamstrings stretch, then squeeze back up.' },
  { id: 'hip-thrust', name: 'Hip Thrust', kind: 'weight', category: 'strength', group: 'legs', emoji: '🌉', weightStep: 10, startWeight: 115, ...ACC,
    description: 'Upper back on a bench, bar over your hips. Drive up until your body is flat, squeeze, lower.' },
  { id: 'leg-press', name: 'Leg Press', kind: 'weight', category: 'strength', group: 'legs', emoji: '🦵', weightStep: 10, startWeight: 180, ...ACC,
    description: 'Feet shoulder-width on the platform. Lower until your knees are near your chest, press back up.' },
  { id: 'goblet-squat', name: 'Goblet Squat', kind: 'weight', category: 'strength', group: 'legs', emoji: '🏺', weightStep: 5, startWeight: 35, ...ACC,
    description: 'One dumbbell at your chest, elbows in. Squat deep with a tall chest, stand up.' },
  { id: 'split-squat', name: 'Bulgarian Split Squat', kind: 'weight', category: 'strength', group: 'legs', emoji: '🪑', weightStep: 5, startWeight: 20, ...ACC,
    description: 'Back foot on a bench, a dumbbell in each hand. Drop your back knee toward the floor, drive up. Each leg.' },
  { id: 'walking-lunge', name: 'Walking Lunge', kind: 'weight', category: 'strength', group: 'legs', emoji: '🚶‍♀️', weightStep: 5, startWeight: 20, ...ACC,
    description: 'A dumbbell in each hand. Long step, back knee just above the floor, step through. Reps per leg.' },
  { id: 'leg-extension', name: 'Leg Extension', kind: 'weight', category: 'strength', group: 'legs', emoji: '🦿', weightStep: 5, startWeight: 60, ...ISO,
    description: 'Straighten your legs fully, pause a beat at the top, lower slowly.' },
  { id: 'leg-curl', name: 'Leg Curl', kind: 'weight', category: 'strength', group: 'legs', emoji: '🔄', weightStep: 5, startWeight: 50, ...ISO,
    description: 'Curl your heels toward your seat, squeeze your hamstrings, control it back.' },
  { id: 'hip-abduction', name: 'Hip Abduction', kind: 'weight', category: 'strength', group: 'legs', emoji: '🦋', weightStep: 5, startWeight: 80, ...ISO,
    description: 'Push your knees out against the pads, hold a second, come back slowly.' },
  { id: 'calf-raise', name: 'Calf Raise', kind: 'weight', category: 'strength', group: 'legs', emoji: '👠', weightStep: 10, startWeight: 70, ...ISO,
    description: 'Full stretch at the bottom, rise as high as you can on your toes, pause, lower.' },

  // ── Chest & shoulders ──
  { id: 'bench-press', name: 'Bench Press', kind: 'weight', category: 'strength', group: 'push', emoji: '🛏️', weightStep: 5, startWeight: 75, ...BIG,
    description: 'Shoulder blades pinched, feet planted. Lower the bar to your mid-chest, press up.' },
  { id: 'incline-db-press', name: 'Incline Dumbbell Press', kind: 'weight', category: 'strength', group: 'push', emoji: '📐', weightStep: 5, startWeight: 25, ...ACC,
    description: 'Bench at about 30°. Lower the dumbbells to your upper chest, press them up and slightly in.' },
  { id: 'ohp', name: 'Overhead Press', kind: 'weight', category: 'strength', group: 'push', emoji: '🙌', weightStep: 5, startWeight: 55, ...BIG,
    description: 'Standing, glutes tight. Press the bar from your collarbone to overhead, head through at the top.' },
  { id: 'db-press', name: 'Dumbbell Shoulder Press', kind: 'weight', category: 'strength', group: 'push', emoji: '🤲', weightStep: 5, startWeight: 20, ...ACC,
    description: 'Seated tall. Press the dumbbells from shoulder height to overhead, lower under control.' },
  { id: 'chest-press', name: 'Chest Press Machine', kind: 'weight', category: 'strength', group: 'push', emoji: '🫸', weightStep: 5, startWeight: 60, ...ACC,
    description: 'Handles at mid-chest. Press out until your arms are straight, return slowly.' },
  { id: 'chest-fly', name: 'Chest Fly (Cable or Machine)', kind: 'weight', category: 'strength', group: 'push', emoji: '🕊️', weightStep: 5, startWeight: 40, ...ISO,
    description: 'Slight bend in the elbows. Hug the handles together in front of your chest, open back up slowly.' },
  { id: 'lateral-raise', name: 'Lateral Raise', kind: 'weight', category: 'strength', group: 'push', emoji: '🪽', weightStep: 2.5, startWeight: 10, ...ISO,
    description: 'Lead with your elbows and raise the dumbbells out to shoulder height. No swinging.' },

  // ── Back ──
  { id: 'lat-pulldown', name: 'Lat Pulldown', kind: 'weight', category: 'strength', group: 'pull', emoji: '⬇️', weightStep: 5, startWeight: 80, ...ACC,
    description: 'Chest up, pull the bar to your upper chest by driving your elbows down. Let it rise slowly.' },
  { id: 'cable-row', name: 'Seated Cable Row', kind: 'weight', category: 'strength', group: 'pull', emoji: '🚣', weightStep: 5, startWeight: 80, ...ACC,
    description: 'Sit tall, pull the handle to your stomach, squeeze your shoulder blades, reach forward again.' },
  { id: 'db-row', name: 'One-Arm Dumbbell Row', kind: 'weight', category: 'strength', group: 'pull', emoji: '🛶', weightStep: 5, startWeight: 30, ...ACC,
    description: 'One hand on a bench, flat back. Row the dumbbell to your hip, lower all the way. Each side.' },
  { id: 'barbell-row', name: 'Barbell Row', kind: 'weight', category: 'strength', group: 'pull', emoji: '🏗️', weightStep: 5, startWeight: 65, ...BIG,
    description: 'Hinge forward with a flat back. Pull the bar to your lower ribs, lower it with control.' },
  { id: 'face-pull', name: 'Face Pull', kind: 'weight', category: 'strength', group: 'pull', emoji: '🪢', weightStep: 5, startWeight: 30, ...ISO,
    description: 'Rope at face height. Pull toward your eyes with elbows high and thumbs back. Great for shoulders.' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', kind: 'weight', category: 'strength', group: 'pull', emoji: '🦅', weightStep: 2.5, startWeight: 10, ...ISO,
    description: 'Bent over or on the machine. Sweep your arms out wide, squeeze the backs of your shoulders.' },

  // ── Arms ──
  { id: 'db-curl', name: 'Dumbbell Curl', kind: 'weight', category: 'strength', group: 'arms', emoji: '💪', weightStep: 5, startWeight: 20, ...ACC,
    description: 'Elbows pinned at your sides. Curl up, squeeze, lower slowly all the way down.' },
  { id: 'hammer-curl', name: 'Hammer Curl', kind: 'weight', category: 'strength', group: 'arms', emoji: '🔨', weightStep: 5, startWeight: 20, ...ACC,
    description: 'Palms facing each other. Curl up without swinging, lower under control.' },
  { id: 'triceps-pushdown', name: 'Triceps Pushdown', kind: 'weight', category: 'strength', group: 'arms', emoji: '👇', weightStep: 5, startWeight: 40, ...ACC,
    description: 'Elbows tucked at your sides. Push the bar or rope down until your arms are straight.' },
  { id: 'overhead-triceps', name: 'Overhead Triceps Extension', kind: 'weight', category: 'strength', group: 'arms', emoji: '☝️', weightStep: 5, startWeight: 25, ...ACC,
    description: 'One dumbbell or a cable overhead. Lower behind your head, extend back up. Elbows stay pointed up.' },

  // ── Bodyweight & core ──
  { id: 'knee-pushup', name: 'Knee Push-Up', kind: 'reps', category: 'bodyweight', emoji: '🧎‍♀️', ...ISO,
    description: 'Straight line from knees to head. Chest to the floor, push up. Ready for full push-ups at 15 easy reps.' },
  { id: 'pushup', name: 'Push-Up', kind: 'reps', category: 'bodyweight', emoji: '🤸‍♀️', repMin: 5, repMax: 12,
    description: 'Body in a straight line, elbows at about 45°. Chest to the floor, push up.' },
  { id: 'chin-up', name: 'Chin-Up / Pull-Up', kind: 'reps', category: 'bodyweight', emoji: '🧗‍♀️', repMin: 3, repMax: 8,
    description: 'Hang with straight arms, pull your chin over the bar, lower all the way. Band-assisted counts too.' },
  { id: 'dip', name: 'Dip', kind: 'reps', category: 'bodyweight', emoji: '⤵️', repMin: 5, repMax: 12,
    description: 'On parallel bars or a bench. Lower until your elbows are at 90°, press back up.' },
  { id: 'hanging-knee-raise', name: 'Hanging Knee Raise', kind: 'reps', category: 'bodyweight', emoji: '🐒', ...ISO,
    description: 'Hang from a bar or use the captain’s chair. Bring your knees up toward your chest without swinging.' },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', kind: 'reps', category: 'bodyweight', emoji: '🛞', repMin: 6, repMax: 12,
    description: 'From your knees, roll out as far as you can with a flat back, then pull back in with your abs.' },
  { id: 'plank', name: 'Plank', kind: 'cardio', category: 'bodyweight', emoji: '🪵', cardioFocus: 'time',
    description: 'On your forearms and toes, body in a straight line, squeeze everything. Count the seconds.' },
  { id: 'side-plank', name: 'Side Plank', kind: 'cardio', category: 'bodyweight', emoji: '📏', cardioFocus: 'time',
    description: 'On one forearm, hips up in a straight line. Time is per side.' },

  // ── Cardio ──
  { id: 'walk', name: 'Walk', kind: 'cardio', category: 'cardio', emoji: '🚶‍♀️', cardioFocus: 'distance',
    description: 'Outside, at the mall, or with the pups. It all counts.' },
  { id: 'incline-walk', name: 'Incline Treadmill Walk', kind: 'cardio', category: 'cardio', emoji: '⛰️', cardioFocus: 'time',
    description: 'Treadmill on an incline at a brisk walk. Hands off the rails if you can.' },
  { id: 'stair-climber', name: 'Stair Climber', kind: 'cardio', category: 'cardio', emoji: '🪜', cardioFocus: 'time',
    description: 'Steady pace, tall posture, light touch on the rails.' },
  { id: 'rower', name: 'Rowing Machine', kind: 'cardio', category: 'cardio', emoji: '🚣‍♀️', cardioFocus: 'time',
    description: 'Push with your legs first, then lean back and pull. Reverse on the way in.' },
  { id: 'bike', name: 'Bike', kind: 'cardio', category: 'cardio', emoji: '🚲', cardioFocus: 'time',
    description: 'Stationary or outdoors. Seat high enough that your knee is slightly bent at the bottom.' },
  { id: 'elliptical', name: 'Elliptical', kind: 'cardio', category: 'cardio', emoji: '🌀', cardioFocus: 'time',
    description: 'Smooth, low-impact striding at a steady pace.' },
  { id: 'swim', name: 'Swim', kind: 'cardio', category: 'cardio', emoji: '🏊‍♀️', cardioFocus: 'time',
    description: 'Laps, water walking or water aerobics.' },
  { id: 'stretch', name: 'Stretching / Mobility', kind: 'cardio', category: 'cardio', emoji: '🧘‍♀️', cardioFocus: 'time',
    description: 'Hips, hamstrings, shoulders and upper back. Ease in and breathe.' },
];

export function seedExercises(): Exercise[] {
  const now = Date.now();
  return SEEDS.map((s) => ({
    repMin: 8,
    repMax: s.kind === 'reps' ? 15 : 12,
    sets: s.kind === 'cardio' ? 1 : 3,
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
    sets: kind === 'cardio' ? 1 : 3,
    weightStep: kind === 'weight' ? 5 : 0,
    cardioFocus: kind === 'cardio' ? 'time' : undefined,
    favorite: true,
    custom: true,
    archived: false,
    createdAt: Date.now(),
  };
}
