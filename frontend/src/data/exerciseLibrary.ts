// Comprehensive Exercise Library Database
// Organized by muscle group with equipment requirements

export type MuscleGroup = 
  | 'chest' | 'shoulders' | 'triceps' | 'biceps' | 'forearms' 
  | 'lats' | 'traps' | 'upper_back' | 'lower_back'
  | 'abs' | 'obliques'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves'
  | 'full_body' | 'cardio';

export type EquipmentType = 
  | 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight'
  | 'kettlebell' | 'resistance_band' | 'ez_bar' | 'smith_machine'
  | 'pull_up_bar' | 'dip_station' | 'bench' | 'leg_press'
  | 'hack_squat' | 'leg_curl' | 'leg_extension' | 'cable_crossover'
  | 'lat_pulldown' | 'rowing_machine' | 'preacher_curl' | 'pec_deck'
  | 'shoulder_press_machine' | 'chest_press_machine' | 'seated_row'
  | 'treadmill' | 'bike' | 'elliptical' | 'none';

export type Exercise = {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  primaryMuscle: MuscleGroup;
  equipment: EquipmentType[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
  instructions?: string;
  tips?: string[];
  isCompound: boolean;
};

// ============================================
// CHEST EXERCISES
// ============================================
const CHEST_EXERCISES: Exercise[] = [
  // Barbell
  { id: 'barbell_bench_press', name: 'Barbell Bench Press', muscleGroups: ['chest', 'shoulders', 'triceps'], primaryMuscle: 'chest', equipment: ['barbell', 'bench'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'incline_barbell_press', name: 'Incline Barbell Press', muscleGroups: ['chest', 'shoulders', 'triceps'], primaryMuscle: 'chest', equipment: ['barbell', 'bench'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'decline_barbell_press', name: 'Decline Barbell Press', muscleGroups: ['chest', 'triceps'], primaryMuscle: 'chest', equipment: ['barbell', 'bench'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'close_grip_bench_press', name: 'Close Grip Bench Press', muscleGroups: ['chest', 'triceps'], primaryMuscle: 'chest', equipment: ['barbell', 'bench'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'floor_press', name: 'Floor Press', muscleGroups: ['chest', 'triceps'], primaryMuscle: 'chest', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  
  // Dumbbell
  { id: 'dumbbell_bench_press', name: 'Dumbbell Bench Press', muscleGroups: ['chest', 'shoulders', 'triceps'], primaryMuscle: 'chest', equipment: ['dumbbell', 'bench'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 75, isCompound: true },
  { id: 'incline_dumbbell_press', name: 'Incline Dumbbell Press', muscleGroups: ['chest', 'shoulders', 'triceps'], primaryMuscle: 'chest', equipment: ['dumbbell', 'bench'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 75, isCompound: true },
  { id: 'decline_dumbbell_press', name: 'Decline Dumbbell Press', muscleGroups: ['chest', 'triceps'], primaryMuscle: 'chest', equipment: ['dumbbell', 'bench'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 75, isCompound: true },
  { id: 'dumbbell_flyes', name: 'Dumbbell Flyes', muscleGroups: ['chest'], primaryMuscle: 'chest', equipment: ['dumbbell', 'bench'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'incline_dumbbell_flyes', name: 'Incline Dumbbell Flyes', muscleGroups: ['chest'], primaryMuscle: 'chest', equipment: ['dumbbell', 'bench'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'dumbbell_pullover', name: 'Dumbbell Pullover', muscleGroups: ['chest', 'lats'], primaryMuscle: 'chest', equipment: ['dumbbell', 'bench'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'svend_press', name: 'Svend Press', muscleGroups: ['chest'], primaryMuscle: 'chest', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  
  // Cable
  { id: 'cable_crossover', name: 'Cable Crossover', muscleGroups: ['chest'], primaryMuscle: 'chest', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'low_cable_crossover', name: 'Low to High Cable Crossover', muscleGroups: ['chest'], primaryMuscle: 'chest', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'high_cable_crossover', name: 'High to Low Cable Crossover', muscleGroups: ['chest'], primaryMuscle: 'chest', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'cable_chest_press', name: 'Cable Chest Press', muscleGroups: ['chest', 'triceps'], primaryMuscle: 'chest', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: true },
  
  // Machine
  { id: 'machine_chest_press', name: 'Machine Chest Press', muscleGroups: ['chest', 'triceps'], primaryMuscle: 'chest', equipment: ['chest_press_machine'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  { id: 'pec_deck', name: 'Pec Deck Machine', muscleGroups: ['chest'], primaryMuscle: 'chest', equipment: ['pec_deck'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'smith_bench_press', name: 'Smith Machine Bench Press', muscleGroups: ['chest', 'triceps'], primaryMuscle: 'chest', equipment: ['smith_machine'], difficulty: 'beginner', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'smith_incline_press', name: 'Smith Machine Incline Press', muscleGroups: ['chest', 'shoulders'], primaryMuscle: 'chest', equipment: ['smith_machine'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 75, isCompound: true },
  
  // Bodyweight
  { id: 'push_ups', name: 'Push-Ups', muscleGroups: ['chest', 'shoulders', 'triceps'], primaryMuscle: 'chest', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 60, isCompound: true },
  { id: 'wide_push_ups', name: 'Wide Push-Ups', muscleGroups: ['chest'], primaryMuscle: 'chest', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: true },
  { id: 'diamond_push_ups', name: 'Diamond Push-Ups', muscleGroups: ['chest', 'triceps'], primaryMuscle: 'chest', equipment: ['bodyweight'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-15', defaultRestSeconds: 60, isCompound: true },
  { id: 'decline_push_ups', name: 'Decline Push-Ups', muscleGroups: ['chest', 'shoulders'], primaryMuscle: 'chest', equipment: ['bodyweight'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: true },
  { id: 'incline_push_ups', name: 'Incline Push-Ups', muscleGroups: ['chest'], primaryMuscle: 'chest', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: true },
  { id: 'dips_chest', name: 'Chest Dips', muscleGroups: ['chest', 'triceps', 'shoulders'], primaryMuscle: 'chest', equipment: ['dip_station'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  
  // Resistance Band
  { id: 'band_chest_press', name: 'Resistance Band Chest Press', muscleGroups: ['chest', 'triceps'], primaryMuscle: 'chest', equipment: ['resistance_band'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: true },
  { id: 'band_chest_fly', name: 'Resistance Band Chest Fly', muscleGroups: ['chest'], primaryMuscle: 'chest', equipment: ['resistance_band'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
];

// ============================================
// SHOULDER EXERCISES
// ============================================
const SHOULDER_EXERCISES: Exercise[] = [
  // Barbell
  { id: 'overhead_press', name: 'Overhead Press (OHP)', muscleGroups: ['shoulders', 'triceps'], primaryMuscle: 'shoulders', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '6-10', defaultRestSeconds: 90, isCompound: true },
  { id: 'push_press', name: 'Push Press', muscleGroups: ['shoulders', 'triceps', 'quads'], primaryMuscle: 'shoulders', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '6-8', defaultRestSeconds: 120, isCompound: true },
  { id: 'behind_neck_press', name: 'Behind Neck Press', muscleGroups: ['shoulders'], primaryMuscle: 'shoulders', equipment: ['barbell'], difficulty: 'advanced', defaultSets: 3, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'barbell_front_raise', name: 'Barbell Front Raise', muscleGroups: ['shoulders'], primaryMuscle: 'shoulders', equipment: ['barbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'barbell_upright_row', name: 'Barbell Upright Row', muscleGroups: ['shoulders', 'traps'], primaryMuscle: 'shoulders', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  
  // Dumbbell
  { id: 'dumbbell_shoulder_press', name: 'Dumbbell Shoulder Press', muscleGroups: ['shoulders', 'triceps'], primaryMuscle: 'shoulders', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 75, isCompound: true },
  { id: 'seated_dumbbell_press', name: 'Seated Dumbbell Press', muscleGroups: ['shoulders', 'triceps'], primaryMuscle: 'shoulders', equipment: ['dumbbell', 'bench'], difficulty: 'beginner', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 75, isCompound: true },
  { id: 'arnold_press', name: 'Arnold Press', muscleGroups: ['shoulders', 'triceps'], primaryMuscle: 'shoulders', equipment: ['dumbbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 75, isCompound: true },
  { id: 'lateral_raises', name: 'Lateral Raises', muscleGroups: ['shoulders'], primaryMuscle: 'shoulders', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 4, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'front_raises', name: 'Front Raises', muscleGroups: ['shoulders'], primaryMuscle: 'shoulders', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'rear_delt_flyes', name: 'Rear Delt Flyes', muscleGroups: ['shoulders', 'upper_back'], primaryMuscle: 'shoulders', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 4, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'dumbbell_shrugs', name: 'Dumbbell Shrugs', muscleGroups: ['traps', 'shoulders'], primaryMuscle: 'shoulders', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 4, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'dumbbell_upright_row', name: 'Dumbbell Upright Row', muscleGroups: ['shoulders', 'traps'], primaryMuscle: 'shoulders', equipment: ['dumbbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  { id: 'lu_raises', name: 'Lu Raises', muscleGroups: ['shoulders'], primaryMuscle: 'shoulders', equipment: ['dumbbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: false },
  
  // Cable
  { id: 'cable_lateral_raise', name: 'Cable Lateral Raise', muscleGroups: ['shoulders'], primaryMuscle: 'shoulders', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'cable_front_raise', name: 'Cable Front Raise', muscleGroups: ['shoulders'], primaryMuscle: 'shoulders', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'cable_rear_delt_fly', name: 'Cable Rear Delt Fly', muscleGroups: ['shoulders', 'upper_back'], primaryMuscle: 'shoulders', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'face_pulls', name: 'Face Pulls', muscleGroups: ['shoulders', 'upper_back', 'traps'], primaryMuscle: 'shoulders', equipment: ['cable'], difficulty: 'beginner', defaultSets: 4, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'cable_upright_row', name: 'Cable Upright Row', muscleGroups: ['shoulders', 'traps'], primaryMuscle: 'shoulders', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: true },
  
  // Machine
  { id: 'machine_shoulder_press', name: 'Machine Shoulder Press', muscleGroups: ['shoulders', 'triceps'], primaryMuscle: 'shoulders', equipment: ['shoulder_press_machine'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 75, isCompound: true },
  { id: 'smith_shoulder_press', name: 'Smith Machine Shoulder Press', muscleGroups: ['shoulders', 'triceps'], primaryMuscle: 'shoulders', equipment: ['smith_machine'], difficulty: 'beginner', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 75, isCompound: true },
  { id: 'reverse_pec_deck', name: 'Reverse Pec Deck', muscleGroups: ['shoulders', 'upper_back'], primaryMuscle: 'shoulders', equipment: ['pec_deck'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'machine_lateral_raise', name: 'Machine Lateral Raise', muscleGroups: ['shoulders'], primaryMuscle: 'shoulders', equipment: ['machine'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  
  // Bodyweight
  { id: 'pike_push_ups', name: 'Pike Push-Ups', muscleGroups: ['shoulders', 'triceps'], primaryMuscle: 'shoulders', equipment: ['bodyweight'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-15', defaultRestSeconds: 60, isCompound: true },
  { id: 'handstand_push_ups', name: 'Handstand Push-Ups', muscleGroups: ['shoulders', 'triceps'], primaryMuscle: 'shoulders', equipment: ['bodyweight'], difficulty: 'advanced', defaultSets: 3, defaultReps: '5-10', defaultRestSeconds: 90, isCompound: true },
  
  // Resistance Band
  { id: 'band_shoulder_press', name: 'Band Shoulder Press', muscleGroups: ['shoulders', 'triceps'], primaryMuscle: 'shoulders', equipment: ['resistance_band'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: true },
  { id: 'band_lateral_raise', name: 'Band Lateral Raise', muscleGroups: ['shoulders'], primaryMuscle: 'shoulders', equipment: ['resistance_band'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'band_pull_apart', name: 'Band Pull Apart', muscleGroups: ['shoulders', 'upper_back'], primaryMuscle: 'shoulders', equipment: ['resistance_band'], difficulty: 'beginner', defaultSets: 3, defaultReps: '20-25', defaultRestSeconds: 30, isCompound: false },
];

// ============================================
// BACK EXERCISES (Lats, Traps, Upper Back, Lower Back)
// ============================================
const BACK_EXERCISES: Exercise[] = [
  // Barbell
  { id: 'deadlift', name: 'Conventional Deadlift', muscleGroups: ['lower_back', 'hamstrings', 'glutes', 'traps', 'lats'], primaryMuscle: 'lower_back', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '5-8', defaultRestSeconds: 180, isCompound: true },
  { id: 'sumo_deadlift', name: 'Sumo Deadlift', muscleGroups: ['lower_back', 'hamstrings', 'glutes', 'quads'], primaryMuscle: 'lower_back', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '5-8', defaultRestSeconds: 180, isCompound: true },
  { id: 'romanian_deadlift', name: 'Romanian Deadlift (RDL)', muscleGroups: ['hamstrings', 'lower_back', 'glutes'], primaryMuscle: 'lower_back', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'barbell_row', name: 'Barbell Row', muscleGroups: ['lats', 'upper_back', 'biceps', 'traps'], primaryMuscle: 'lats', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'pendlay_row', name: 'Pendlay Row', muscleGroups: ['lats', 'upper_back', 'biceps'], primaryMuscle: 'lats', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '6-8', defaultRestSeconds: 90, isCompound: true },
  { id: 'yates_row', name: 'Yates Row', muscleGroups: ['lats', 'upper_back', 'biceps'], primaryMuscle: 'lats', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '8-10', defaultRestSeconds: 90, isCompound: true },
  { id: 't_bar_row', name: 'T-Bar Row', muscleGroups: ['lats', 'upper_back', 'biceps'], primaryMuscle: 'lats', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'barbell_shrugs', name: 'Barbell Shrugs', muscleGroups: ['traps'], primaryMuscle: 'traps', equipment: ['barbell'], difficulty: 'beginner', defaultSets: 4, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'rack_pulls', name: 'Rack Pulls', muscleGroups: ['lower_back', 'traps', 'glutes'], primaryMuscle: 'lower_back', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '6-8', defaultRestSeconds: 120, isCompound: true },
  { id: 'good_mornings', name: 'Good Mornings', muscleGroups: ['lower_back', 'hamstrings'], primaryMuscle: 'lower_back', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 90, isCompound: true },
  
  // Dumbbell
  { id: 'dumbbell_row', name: 'Dumbbell Row', muscleGroups: ['lats', 'upper_back', 'biceps'], primaryMuscle: 'lats', equipment: ['dumbbell', 'bench'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  { id: 'chest_supported_row', name: 'Chest Supported Row', muscleGroups: ['lats', 'upper_back', 'biceps'], primaryMuscle: 'lats', equipment: ['dumbbell', 'bench'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  { id: 'kroc_row', name: 'Kroc Row', muscleGroups: ['lats', 'upper_back', 'biceps'], primaryMuscle: 'lats', equipment: ['dumbbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 90, isCompound: true },
  { id: 'dumbbell_rdl', name: 'Dumbbell Romanian Deadlift', muscleGroups: ['hamstrings', 'lower_back', 'glutes'], primaryMuscle: 'lower_back', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 75, isCompound: true },
  { id: 'dumbbell_deadlift', name: 'Dumbbell Deadlift', muscleGroups: ['lower_back', 'hamstrings', 'glutes'], primaryMuscle: 'lower_back', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'renegade_row', name: 'Renegade Row', muscleGroups: ['lats', 'abs', 'shoulders'], primaryMuscle: 'lats', equipment: ['dumbbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '8-10', defaultRestSeconds: 60, isCompound: true },
  
  // Cable
  { id: 'lat_pulldown', name: 'Lat Pulldown', muscleGroups: ['lats', 'biceps', 'upper_back'], primaryMuscle: 'lats', equipment: ['lat_pulldown'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  { id: 'close_grip_pulldown', name: 'Close Grip Lat Pulldown', muscleGroups: ['lats', 'biceps'], primaryMuscle: 'lats', equipment: ['lat_pulldown'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  { id: 'wide_grip_pulldown', name: 'Wide Grip Lat Pulldown', muscleGroups: ['lats', 'upper_back'], primaryMuscle: 'lats', equipment: ['lat_pulldown'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  { id: 'reverse_grip_pulldown', name: 'Reverse Grip Pulldown', muscleGroups: ['lats', 'biceps'], primaryMuscle: 'lats', equipment: ['lat_pulldown'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  { id: 'straight_arm_pulldown', name: 'Straight Arm Pulldown', muscleGroups: ['lats'], primaryMuscle: 'lats', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'cable_row', name: 'Seated Cable Row', muscleGroups: ['lats', 'upper_back', 'biceps'], primaryMuscle: 'lats', equipment: ['seated_row'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  { id: 'single_arm_cable_row', name: 'Single Arm Cable Row', muscleGroups: ['lats', 'upper_back'], primaryMuscle: 'lats', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 45, isCompound: true },
  { id: 'cable_shrugs', name: 'Cable Shrugs', muscleGroups: ['traps'], primaryMuscle: 'traps', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  
  // Machine
  { id: 'machine_row', name: 'Machine Row', muscleGroups: ['lats', 'upper_back', 'biceps'], primaryMuscle: 'lats', equipment: ['machine'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  { id: 'hammer_strength_row', name: 'Hammer Strength Row', muscleGroups: ['lats', 'upper_back'], primaryMuscle: 'lats', equipment: ['machine'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  { id: 'machine_pullover', name: 'Machine Pullover', muscleGroups: ['lats'], primaryMuscle: 'lats', equipment: ['machine'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'hyperextensions', name: 'Hyperextensions', muscleGroups: ['lower_back', 'glutes', 'hamstrings'], primaryMuscle: 'lower_back', equipment: ['machine'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  
  // Bodyweight
  { id: 'pull_ups', name: 'Pull-Ups', muscleGroups: ['lats', 'biceps', 'upper_back'], primaryMuscle: 'lats', equipment: ['pull_up_bar'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '6-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'chin_ups', name: 'Chin-Ups', muscleGroups: ['lats', 'biceps'], primaryMuscle: 'lats', equipment: ['pull_up_bar'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '6-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'wide_grip_pull_ups', name: 'Wide Grip Pull-Ups', muscleGroups: ['lats', 'upper_back'], primaryMuscle: 'lats', equipment: ['pull_up_bar'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '6-10', defaultRestSeconds: 90, isCompound: true },
  { id: 'neutral_grip_pull_ups', name: 'Neutral Grip Pull-Ups', muscleGroups: ['lats', 'biceps'], primaryMuscle: 'lats', equipment: ['pull_up_bar'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '6-10', defaultRestSeconds: 90, isCompound: true },
  { id: 'inverted_rows', name: 'Inverted Rows', muscleGroups: ['lats', 'upper_back', 'biceps'], primaryMuscle: 'lats', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-15', defaultRestSeconds: 60, isCompound: true },
  { id: 'superman', name: 'Superman', muscleGroups: ['lower_back', 'glutes'], primaryMuscle: 'lower_back', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'reverse_snow_angels', name: 'Reverse Snow Angels', muscleGroups: ['upper_back', 'shoulders'], primaryMuscle: 'upper_back', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  
  // Resistance Band
  { id: 'band_lat_pulldown', name: 'Band Lat Pulldown', muscleGroups: ['lats', 'biceps'], primaryMuscle: 'lats', equipment: ['resistance_band'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: true },
  { id: 'band_rows', name: 'Band Rows', muscleGroups: ['lats', 'upper_back'], primaryMuscle: 'lats', equipment: ['resistance_band'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: true },
  
  // Kettlebell
  { id: 'kettlebell_swing', name: 'Kettlebell Swing', muscleGroups: ['lower_back', 'hamstrings', 'glutes', 'shoulders'], primaryMuscle: 'lower_back', equipment: ['kettlebell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '15-20', defaultRestSeconds: 60, isCompound: true },
  { id: 'kettlebell_row', name: 'Kettlebell Row', muscleGroups: ['lats', 'upper_back', 'biceps'], primaryMuscle: 'lats', equipment: ['kettlebell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
];

// ============================================
// ARM EXERCISES (Biceps, Triceps, Forearms)
// ============================================
const ARM_EXERCISES: Exercise[] = [
  // BICEPS - Barbell
  { id: 'barbell_curl', name: 'Barbell Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['barbell'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: false },
  { id: 'ez_bar_curl', name: 'EZ Bar Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['ez_bar'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: false },
  { id: 'preacher_curl', name: 'Preacher Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['ez_bar', 'preacher_curl'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: false },
  { id: 'reverse_barbell_curl', name: 'Reverse Barbell Curl', muscleGroups: ['biceps', 'forearms'], primaryMuscle: 'biceps', equipment: ['barbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'drag_curl', name: 'Drag Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: false },
  { id: 'spider_curl_barbell', name: 'Spider Curl (Barbell)', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['barbell', 'bench'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: false },
  { id: '21s', name: '21s Bicep Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '21', defaultRestSeconds: 90, isCompound: false },
  
  // BICEPS - Dumbbell
  { id: 'dumbbell_curl', name: 'Dumbbell Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 45, isCompound: false },
  { id: 'hammer_curl', name: 'Hammer Curl', muscleGroups: ['biceps', 'forearms'], primaryMuscle: 'biceps', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 45, isCompound: false },
  { id: 'incline_dumbbell_curl', name: 'Incline Dumbbell Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['dumbbell', 'bench'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: false },
  { id: 'concentration_curl', name: 'Concentration Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 45, isCompound: false },
  { id: 'zottman_curl', name: 'Zottman Curl', muscleGroups: ['biceps', 'forearms'], primaryMuscle: 'biceps', equipment: ['dumbbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: false },
  { id: 'cross_body_curl', name: 'Cross Body Hammer Curl', muscleGroups: ['biceps', 'forearms'], primaryMuscle: 'biceps', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 45, isCompound: false },
  { id: 'spider_curl_dumbbell', name: 'Spider Curl (Dumbbell)', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['dumbbell', 'bench'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: false },
  
  // BICEPS - Cable
  { id: 'cable_curl', name: 'Cable Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'cable_hammer_curl', name: 'Cable Hammer Curl', muscleGroups: ['biceps', 'forearms'], primaryMuscle: 'biceps', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'high_cable_curl', name: 'High Cable Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'bayesian_curl', name: 'Bayesian Cable Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['cable'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  
  // BICEPS - Machine
  { id: 'machine_curl', name: 'Machine Bicep Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['machine'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'machine_preacher_curl', name: 'Machine Preacher Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['preacher_curl'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  
  // TRICEPS - Barbell/EZ Bar
  { id: 'skull_crushers', name: 'Skull Crushers', muscleGroups: ['triceps'], primaryMuscle: 'triceps', equipment: ['ez_bar', 'bench'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: false },
  { id: 'close_grip_bench', name: 'Close Grip Bench Press', muscleGroups: ['triceps', 'chest'], primaryMuscle: 'triceps', equipment: ['barbell', 'bench'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'jm_press', name: 'JM Press', muscleGroups: ['triceps'], primaryMuscle: 'triceps', equipment: ['barbell', 'bench'], difficulty: 'advanced', defaultSets: 3, defaultReps: '8-10', defaultRestSeconds: 90, isCompound: false },
  
  // TRICEPS - Dumbbell
  { id: 'overhead_tricep_extension', name: 'Overhead Tricep Extension', muscleGroups: ['triceps'], primaryMuscle: 'triceps', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: false },
  { id: 'dumbbell_kickbacks', name: 'Tricep Kickbacks', muscleGroups: ['triceps'], primaryMuscle: 'triceps', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'dumbbell_skull_crusher', name: 'Dumbbell Skull Crusher', muscleGroups: ['triceps'], primaryMuscle: 'triceps', equipment: ['dumbbell', 'bench'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: false },
  { id: 'tate_press', name: 'Tate Press', muscleGroups: ['triceps'], primaryMuscle: 'triceps', equipment: ['dumbbell', 'bench'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: false },
  
  // TRICEPS - Cable
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', muscleGroups: ['triceps'], primaryMuscle: 'triceps', equipment: ['cable'], difficulty: 'beginner', defaultSets: 4, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'rope_pushdown', name: 'Rope Tricep Pushdown', muscleGroups: ['triceps'], primaryMuscle: 'triceps', equipment: ['cable'], difficulty: 'beginner', defaultSets: 4, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'reverse_grip_pushdown', name: 'Reverse Grip Pushep Pushdown', muscleGroups: ['triceps'], primaryMuscle: 'triceps', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'overhead_cable_extension', name: 'Overhead Cable Extension', muscleGroups: ['triceps'], primaryMuscle: 'triceps', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'single_arm_pushdown', name: 'Single Arm Tricep Pushdown', muscleGroups: ['triceps'], primaryMuscle: 'triceps', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  
  // TRICEPS - Bodyweight
  { id: 'tricep_dips', name: 'Tricep Dips', muscleGroups: ['triceps', 'chest', 'shoulders'], primaryMuscle: 'triceps', equipment: ['dip_station'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'bench_dips', name: 'Bench Dips', muscleGroups: ['triceps'], primaryMuscle: 'triceps', equipment: ['bench'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'diamond_pushups_tricep', name: 'Diamond Push-Ups', muscleGroups: ['triceps', 'chest'], primaryMuscle: 'triceps', equipment: ['bodyweight'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-15', defaultRestSeconds: 60, isCompound: true },
  
  // FOREARMS
  { id: 'wrist_curls', name: 'Wrist Curls', muscleGroups: ['forearms'], primaryMuscle: 'forearms', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'reverse_wrist_curls', name: 'Reverse Wrist Curls', muscleGroups: ['forearms'], primaryMuscle: 'forearms', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'farmers_walk', name: "Farmer's Walk", muscleGroups: ['forearms', 'traps', 'abs'], primaryMuscle: 'forearms', equipment: ['dumbbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '40-60s', defaultRestSeconds: 90, isCompound: true },
  { id: 'plate_pinch', name: 'Plate Pinch Hold', muscleGroups: ['forearms'], primaryMuscle: 'forearms', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '30-60s', defaultRestSeconds: 60, isCompound: false },
  { id: 'dead_hang', name: 'Dead Hang', muscleGroups: ['forearms', 'lats'], primaryMuscle: 'forearms', equipment: ['pull_up_bar'], difficulty: 'beginner', defaultSets: 3, defaultReps: '30-60s', defaultRestSeconds: 60, isCompound: false },
  { id: 'behind_back_wrist_curl', name: 'Behind Back Wrist Curl', muscleGroups: ['forearms'], primaryMuscle: 'forearms', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  
  // Resistance Band Arms
  { id: 'band_bicep_curl', name: 'Band Bicep Curl', muscleGroups: ['biceps'], primaryMuscle: 'biceps', equipment: ['resistance_band'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'band_tricep_extension', name: 'Band Tricep Extension', muscleGroups: ['triceps'], primaryMuscle: 'triceps', equipment: ['resistance_band'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
];

// ============================================
// LEG EXERCISES (Quads, Hamstrings, Glutes, Calves)
// ============================================
const LEG_EXERCISES: Exercise[] = [
  // QUADS - Barbell
  { id: 'back_squat', name: 'Back Squat', muscleGroups: ['quads', 'glutes', 'hamstrings'], primaryMuscle: 'quads', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '6-10', defaultRestSeconds: 180, isCompound: true },
  { id: 'front_squat', name: 'Front Squat', muscleGroups: ['quads', 'abs', 'glutes'], primaryMuscle: 'quads', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '6-10', defaultRestSeconds: 180, isCompound: true },
  { id: 'zercher_squat', name: 'Zercher Squat', muscleGroups: ['quads', 'glutes', 'abs'], primaryMuscle: 'quads', equipment: ['barbell'], difficulty: 'advanced', defaultSets: 3, defaultReps: '6-10', defaultRestSeconds: 180, isCompound: true },
  { id: 'pause_squat', name: 'Pause Squat', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['barbell'], difficulty: 'advanced', defaultSets: 4, defaultReps: '5-8', defaultRestSeconds: 180, isCompound: true },
  { id: 'barbell_lunges', name: 'Barbell Lunges', muscleGroups: ['quads', 'glutes', 'hamstrings'], primaryMuscle: 'quads', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 90, isCompound: true },
  
  // QUADS - Dumbbell
  { id: 'goblet_squat', name: 'Goblet Squat', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: true },
  { id: 'dumbbell_lunges', name: 'Dumbbell Lunges', muscleGroups: ['quads', 'glutes', 'hamstrings'], primaryMuscle: 'quads', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  { id: 'walking_lunges', name: 'Walking Lunges', muscleGroups: ['quads', 'glutes', 'hamstrings'], primaryMuscle: 'quads', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '20 steps', defaultRestSeconds: 60, isCompound: true },
  { id: 'reverse_lunges', name: 'Reverse Lunges', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['dumbbell', 'bench'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'dumbbell_step_ups', name: 'Dumbbell Step-Ups', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['dumbbell', 'bench'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: true },
  { id: 'dumbbell_squat', name: 'Dumbbell Squat', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: true },
  
  // QUADS - Machine
  { id: 'leg_press', name: 'Leg Press', muscleGroups: ['quads', 'glutes', 'hamstrings'], primaryMuscle: 'quads', equipment: ['leg_press'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-15', defaultRestSeconds: 90, isCompound: true },
  { id: 'hack_squat', name: 'Hack Squat', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['hack_squat'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'leg_extension', name: 'Leg Extension', muscleGroups: ['quads'], primaryMuscle: 'quads', equipment: ['leg_extension'], difficulty: 'beginner', defaultSets: 4, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'smith_squat', name: 'Smith Machine Squat', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['smith_machine'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'pendulum_squat', name: 'Pendulum Squat', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['machine'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'belt_squat', name: 'Belt Squat', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['machine'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-15', defaultRestSeconds: 90, isCompound: true },
  { id: 'sissy_squat', name: 'Sissy Squat', muscleGroups: ['quads'], primaryMuscle: 'quads', equipment: ['machine'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  
  // QUADS - Bodyweight
  { id: 'bodyweight_squat', name: 'Bodyweight Squat', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: true },
  { id: 'jump_squats', name: 'Jump Squats', muscleGroups: ['quads', 'glutes', 'calves'], primaryMuscle: 'quads', equipment: ['bodyweight'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: true },
  { id: 'pistol_squat', name: 'Pistol Squat', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['bodyweight'], difficulty: 'advanced', defaultSets: 3, defaultReps: '5-8', defaultRestSeconds: 90, isCompound: true },
  { id: 'wall_sit', name: 'Wall Sit', muscleGroups: ['quads'], primaryMuscle: 'quads', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '30-60s', defaultRestSeconds: 60, isCompound: false },
  
  // HAMSTRINGS
  { id: 'lying_leg_curl', name: 'Lying Leg Curl', muscleGroups: ['hamstrings'], primaryMuscle: 'hamstrings', equipment: ['leg_curl'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'seated_leg_curl', name: 'Seated Leg Curl', muscleGroups: ['hamstrings'], primaryMuscle: 'hamstrings', equipment: ['leg_curl'], difficulty: 'beginner', defaultSets: 4, defaultReps: '10-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'standing_leg_curl', name: 'Standing Leg Curl', muscleGroups: ['hamstrings'], primaryMuscle: 'hamstrings', equipment: ['machine'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'stiff_leg_deadlift', name: 'Stiff Leg Deadlift', muscleGroups: ['hamstrings', 'lower_back', 'glutes'], primaryMuscle: 'hamstrings', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'nordic_curl', name: 'Nordic Hamstring Curl', muscleGroups: ['hamstrings'], primaryMuscle: 'hamstrings', equipment: ['bodyweight'], difficulty: 'advanced', defaultSets: 3, defaultReps: '6-10', defaultRestSeconds: 90, isCompound: false },
  { id: 'glute_ham_raise', name: 'Glute Ham Raise', muscleGroups: ['hamstrings', 'glutes'], primaryMuscle: 'hamstrings', equipment: ['machine'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: false },
  { id: 'single_leg_rdl', name: 'Single Leg RDL', muscleGroups: ['hamstrings', 'glutes'], primaryMuscle: 'hamstrings', equipment: ['dumbbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isCompound: true },
  
  // GLUTES
  { id: 'hip_thrust', name: 'Barbell Hip Thrust', muscleGroups: ['glutes', 'hamstrings'], primaryMuscle: 'glutes', equipment: ['barbell', 'bench'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '10-15', defaultRestSeconds: 90, isCompound: true },
  { id: 'dumbbell_hip_thrust', name: 'Dumbbell Hip Thrust', muscleGroups: ['glutes', 'hamstrings'], primaryMuscle: 'glutes', equipment: ['dumbbell', 'bench'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: true },
  { id: 'glute_bridge', name: 'Glute Bridge', muscleGroups: ['glutes', 'hamstrings'], primaryMuscle: 'glutes', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'single_leg_glute_bridge', name: 'Single Leg Glute Bridge', muscleGroups: ['glutes'], primaryMuscle: 'glutes', equipment: ['bodyweight'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'cable_pull_through', name: 'Cable Pull Through', muscleGroups: ['glutes', 'hamstrings'], primaryMuscle: 'glutes', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: true },
  { id: 'cable_kickback', name: 'Cable Kickback', muscleGroups: ['glutes'], primaryMuscle: 'glutes', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'donkey_kicks', name: 'Donkey Kicks', muscleGroups: ['glutes'], primaryMuscle: 'glutes', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'fire_hydrants', name: 'Fire Hydrants', muscleGroups: ['glutes'], primaryMuscle: 'glutes', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'hip_abduction', name: 'Hip Abduction Machine', muscleGroups: ['glutes'], primaryMuscle: 'glutes', equipment: ['machine'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'sumo_squat', name: 'Sumo Squat', muscleGroups: ['glutes', 'quads'], primaryMuscle: 'glutes', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: true },
  
  // CALVES
  { id: 'standing_calf_raise', name: 'Standing Calf Raise', muscleGroups: ['calves'], primaryMuscle: 'calves', equipment: ['machine'], difficulty: 'beginner', defaultSets: 4, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'seated_calf_raise', name: 'Seated Calf Raise', muscleGroups: ['calves'], primaryMuscle: 'calves', equipment: ['machine'], difficulty: 'beginner', defaultSets: 4, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'leg_press_calf_raise', name: 'Leg Press Calf Raise', muscleGroups: ['calves'], primaryMuscle: 'calves', equipment: ['leg_press'], difficulty: 'beginner', defaultSets: 4, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'smith_calf_raise', name: 'Smith Machine Calf Raise', muscleGroups: ['calves'], primaryMuscle: 'calves', equipment: ['smith_machine'], difficulty: 'beginner', defaultSets: 4, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'donkey_calf_raise', name: 'Donkey Calf Raise', muscleGroups: ['calves'], primaryMuscle: 'calves', equipment: ['machine'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'single_leg_calf_raise', name: 'Single Leg Calf Raise', muscleGroups: ['calves'], primaryMuscle: 'calves', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'bodyweight_calf_raise', name: 'Bodyweight Calf Raise', muscleGroups: ['calves'], primaryMuscle: 'calves', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '20-25', defaultRestSeconds: 45, isCompound: false },
  { id: 'tibialis_raise', name: 'Tibialis Raise', muscleGroups: ['calves'], primaryMuscle: 'calves', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  
  // Kettlebell Legs
  { id: 'kettlebell_goblet_squat', name: 'Kettlebell Goblet Squat', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['kettlebell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: true },
  { id: 'kettlebell_deadlift', name: 'Kettlebell Deadlift', muscleGroups: ['hamstrings', 'glutes', 'lower_back'], primaryMuscle: 'hamstrings', equipment: ['kettlebell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: true },
  
  // Resistance Band Legs
  { id: 'band_squat', name: 'Band Squat', muscleGroups: ['quads', 'glutes'], primaryMuscle: 'quads', equipment: ['resistance_band'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: true },
  { id: 'band_leg_curl', name: 'Band Leg Curl', muscleGroups: ['hamstrings'], primaryMuscle: 'hamstrings', equipment: ['resistance_band'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'band_glute_bridge', name: 'Band Glute Bridge', muscleGroups: ['glutes'], primaryMuscle: 'glutes', equipment: ['resistance_band'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'band_clamshell', name: 'Band Clamshell', muscleGroups: ['glutes'], primaryMuscle: 'glutes', equipment: ['resistance_band'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
];

// ============================================
// CORE EXERCISES (Abs, Obliques)
// ============================================
const CORE_EXERCISES: Exercise[] = [
  // ABS
  { id: 'crunches', name: 'Crunches', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'sit_ups', name: 'Sit-Ups', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'leg_raises', name: 'Leg Raises', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['bodyweight'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'hanging_leg_raises', name: 'Hanging Leg Raises', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['pull_up_bar'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'hanging_knee_raises', name: 'Hanging Knee Raises', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['pull_up_bar'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'plank', name: 'Plank', muscleGroups: ['abs', 'obliques'], primaryMuscle: 'abs', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '30-60s', defaultRestSeconds: 45, isCompound: false },
  { id: 'dead_bug', name: 'Dead Bug', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'hollow_body_hold', name: 'Hollow Body Hold', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['bodyweight'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '20-30s', defaultRestSeconds: 45, isCompound: false },
  { id: 'mountain_climbers', name: 'Mountain Climbers', muscleGroups: ['abs', 'shoulders'], primaryMuscle: 'abs', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '30-40', defaultRestSeconds: 45, isCompound: true },
  { id: 'ab_wheel_rollout', name: 'Ab Wheel Rollout', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['machine'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'cable_crunch', name: 'Cable Crunch', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['cable'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'decline_crunch', name: 'Decline Crunch', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['bench'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'v_ups', name: 'V-Ups', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['bodyweight'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'toe_touches', name: 'Toe Touches', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'reverse_crunch', name: 'Reverse Crunch', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'flutter_kicks', name: 'Flutter Kicks', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '30-40', defaultRestSeconds: 45, isCompound: false },
  { id: 'scissor_kicks', name: 'Scissor Kicks', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '20-30', defaultRestSeconds: 45, isCompound: false },
  { id: 'dragon_flag', name: 'Dragon Flag', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['bench'], difficulty: 'advanced', defaultSets: 3, defaultReps: '5-10', defaultRestSeconds: 90, isCompound: false },
  { id: 'l_sit', name: 'L-Sit', muscleGroups: ['abs'], primaryMuscle: 'abs', equipment: ['bodyweight'], difficulty: 'advanced', defaultSets: 3, defaultReps: '15-30s', defaultRestSeconds: 60, isCompound: false },
  
  // OBLIQUES
  { id: 'russian_twist', name: 'Russian Twist', muscleGroups: ['obliques', 'abs'], primaryMuscle: 'obliques', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '20-30', defaultRestSeconds: 45, isCompound: false },
  { id: 'weighted_russian_twist', name: 'Weighted Russian Twist', muscleGroups: ['obliques', 'abs'], primaryMuscle: 'obliques', equipment: ['dumbbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'bicycle_crunch', name: 'Bicycle Crunch', muscleGroups: ['obliques', 'abs'], primaryMuscle: 'obliques', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '20-30', defaultRestSeconds: 45, isCompound: false },
  { id: 'side_plank', name: 'Side Plank', muscleGroups: ['obliques'], primaryMuscle: 'obliques', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '20-30s', defaultRestSeconds: 45, isCompound: false },
  { id: 'wood_chop', name: 'Cable Wood Chop', muscleGroups: ['obliques', 'abs'], primaryMuscle: 'obliques', equipment: ['cable'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'pallof_press', name: 'Pallof Press', muscleGroups: ['obliques', 'abs'], primaryMuscle: 'obliques', equipment: ['cable'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isCompound: false },
  { id: 'dumbbell_side_bend', name: 'Dumbbell Side Bend', muscleGroups: ['obliques'], primaryMuscle: 'obliques', equipment: ['dumbbell'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'windshield_wipers', name: 'Windshield Wipers', muscleGroups: ['obliques', 'abs'], primaryMuscle: 'obliques', equipment: ['pull_up_bar'], difficulty: 'advanced', defaultSets: 3, defaultReps: '10-15', defaultRestSeconds: 60, isCompound: false },
  { id: 'heel_touches', name: 'Heel Touches', muscleGroups: ['obliques'], primaryMuscle: 'obliques', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '20-30', defaultRestSeconds: 45, isCompound: false },
  { id: 'side_crunch', name: 'Side Crunch', muscleGroups: ['obliques'], primaryMuscle: 'obliques', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isCompound: false },
  { id: 'hanging_oblique_raise', name: 'Hanging Oblique Raise', muscleGroups: ['obliques'], primaryMuscle: 'obliques', equipment: ['pull_up_bar'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-15', defaultRestSeconds: 60, isCompound: false },
];

// ============================================
// FULL BODY / COMPOUND
// ============================================
const FULL_BODY_EXERCISES: Exercise[] = [
  { id: 'burpees', name: 'Burpees', muscleGroups: ['full_body'], primaryMuscle: 'full_body', equipment: ['bodyweight'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-15', defaultRestSeconds: 60, isCompound: true },
  { id: 'clean_and_press', name: 'Clean and Press', muscleGroups: ['full_body', 'shoulders', 'traps'], primaryMuscle: 'full_body', equipment: ['barbell'], difficulty: 'advanced', defaultSets: 4, defaultReps: '5-8', defaultRestSeconds: 120, isCompound: true },
  { id: 'clean_and_jerk', name: 'Clean and Jerk', muscleGroups: ['full_body'], primaryMuscle: 'full_body', equipment: ['barbell'], difficulty: 'advanced', defaultSets: 4, defaultReps: '3-5', defaultRestSeconds: 180, isCompound: true },
  { id: 'snatch', name: 'Snatch', muscleGroups: ['full_body'], primaryMuscle: 'full_body', equipment: ['barbell'], difficulty: 'advanced', defaultSets: 4, defaultReps: '3-5', defaultRestSeconds: 180, isCompound: true },
  { id: 'thrusters', name: 'Thrusters', muscleGroups: ['full_body', 'quads', 'shoulders'], primaryMuscle: 'full_body', equipment: ['barbell'], difficulty: 'intermediate', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 90, isCompound: true },
  { id: 'dumbbell_thrusters', name: 'Dumbbell Thrusters', muscleGroups: ['full_body', 'quads', 'shoulders'], primaryMuscle: 'full_body', equipment: ['dumbbell'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 75, isCompound: true },
  { id: 'man_makers', name: 'Man Makers', muscleGroups: ['full_body'], primaryMuscle: 'full_body', equipment: ['dumbbell'], difficulty: 'advanced', defaultSets: 3, defaultReps: '6-10', defaultRestSeconds: 90, isCompound: true },
  { id: 'turkish_getup', name: 'Turkish Get-Up', muscleGroups: ['full_body', 'abs', 'shoulders'], primaryMuscle: 'full_body', equipment: ['kettlebell'], difficulty: 'advanced', defaultSets: 3, defaultReps: '3-5', defaultRestSeconds: 90, isCompound: true },
  { id: 'battle_ropes', name: 'Battle Ropes', muscleGroups: ['full_body', 'shoulders', 'abs'], primaryMuscle: 'full_body', equipment: ['machine'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '30-45s', defaultRestSeconds: 60, isCompound: true },
  { id: 'sled_push', name: 'Sled Push', muscleGroups: ['full_body', 'quads', 'glutes'], primaryMuscle: 'full_body', equipment: ['machine'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '30-40m', defaultRestSeconds: 90, isCompound: true },
  { id: 'box_jumps', name: 'Box Jumps', muscleGroups: ['full_body', 'quads', 'glutes'], primaryMuscle: 'full_body', equipment: ['machine'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '8-12', defaultRestSeconds: 60, isCompound: true },
];

// ============================================
// CARDIO EXERCISES
// ============================================
const CARDIO_EXERCISES: Exercise[] = [
  { id: 'treadmill_run', name: 'Treadmill Running', muscleGroups: ['cardio'], primaryMuscle: 'cardio', equipment: ['treadmill'], difficulty: 'beginner', defaultSets: 1, defaultReps: '20-30 min', defaultRestSeconds: 0, isCompound: true },
  { id: 'treadmill_walk', name: 'Treadmill Walking (Incline)', muscleGroups: ['cardio', 'glutes'], primaryMuscle: 'cardio', equipment: ['treadmill'], difficulty: 'beginner', defaultSets: 1, defaultReps: '30-45 min', defaultRestSeconds: 0, isCompound: true },
  { id: 'stationary_bike', name: 'Stationary Bike', muscleGroups: ['cardio', 'quads'], primaryMuscle: 'cardio', equipment: ['bike'], difficulty: 'beginner', defaultSets: 1, defaultReps: '20-30 min', defaultRestSeconds: 0, isCompound: true },
  { id: 'elliptical', name: 'Elliptical', muscleGroups: ['cardio'], primaryMuscle: 'cardio', equipment: ['elliptical'], difficulty: 'beginner', defaultSets: 1, defaultReps: '20-30 min', defaultRestSeconds: 0, isCompound: true },
  { id: 'rowing_machine', name: 'Rowing Machine', muscleGroups: ['cardio', 'lats', 'quads'], primaryMuscle: 'cardio', equipment: ['rowing_machine'], difficulty: 'intermediate', defaultSets: 1, defaultReps: '15-20 min', defaultRestSeconds: 0, isCompound: true },
  { id: 'stair_climber', name: 'Stair Climber', muscleGroups: ['cardio', 'quads', 'glutes'], primaryMuscle: 'cardio', equipment: ['machine'], difficulty: 'intermediate', defaultSets: 1, defaultReps: '15-20 min', defaultRestSeconds: 0, isCompound: true },
  { id: 'jump_rope', name: 'Jump Rope', muscleGroups: ['cardio', 'calves'], primaryMuscle: 'cardio', equipment: ['none'], difficulty: 'intermediate', defaultSets: 3, defaultReps: '3-5 min', defaultRestSeconds: 60, isCompound: true },
  { id: 'jumping_jacks', name: 'Jumping Jacks', muscleGroups: ['cardio'], primaryMuscle: 'cardio', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '30-50', defaultRestSeconds: 30, isCompound: true },
  { id: 'high_knees', name: 'High Knees', muscleGroups: ['cardio', 'quads'], primaryMuscle: 'cardio', equipment: ['bodyweight'], difficulty: 'beginner', defaultSets: 3, defaultReps: '30-40', defaultRestSeconds: 30, isCompound: true },
  { id: 'sprints', name: 'Sprints', muscleGroups: ['cardio', 'quads', 'hamstrings'], primaryMuscle: 'cardio', equipment: ['treadmill'], difficulty: 'intermediate', defaultSets: 6, defaultReps: '20-30s', defaultRestSeconds: 60, isCompound: true },
];

// ============================================
// EXPORT COMPLETE LIBRARY
// ============================================
export const EXERCISE_LIBRARY: Exercise[] = [
  ...CHEST_EXERCISES,
  ...SHOULDER_EXERCISES,
  ...BACK_EXERCISES,
  ...ARM_EXERCISES,
  ...LEG_EXERCISES,
  ...CORE_EXERCISES,
  ...FULL_BODY_EXERCISES,
  ...CARDIO_EXERCISES,
];

// Helper functions
export const getExercisesByMuscle = (muscle: MuscleGroup): Exercise[] => {
  return EXERCISE_LIBRARY.filter(ex => ex.muscleGroups.includes(muscle) || ex.primaryMuscle === muscle);
};

export const getExercisesByEquipment = (equipment: EquipmentType[]): Exercise[] => {
  // Always include bodyweight exercises
  const availableEquipment = [...equipment, 'bodyweight', 'none'];
  return EXERCISE_LIBRARY.filter(ex => 
    ex.equipment.some(eq => availableEquipment.includes(eq))
  );
};

export const getExercisesByMuscleAndEquipment = (muscle: MuscleGroup, equipment: EquipmentType[]): Exercise[] => {
  const muscleExercises = getExercisesByMuscle(muscle);
  const availableEquipment = [...equipment, 'bodyweight', 'none'];
  return muscleExercises.filter(ex => 
    ex.equipment.some(eq => availableEquipment.includes(eq))
  );
};

export const searchExercises = (query: string): Exercise[] => {
  const lowerQuery = query.toLowerCase();
  return EXERCISE_LIBRARY.filter(ex => 
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.muscleGroups.some(m => m.toLowerCase().includes(lowerQuery))
  );
};

export const getCompoundExercises = (): Exercise[] => {
  return EXERCISE_LIBRARY.filter(ex => ex.isCompound);
};

export const getIsolationExercises = (): Exercise[] => {
  return EXERCISE_LIBRARY.filter(ex => !ex.isCompound);
};

// Equipment name mapping for display
export const EQUIPMENT_DISPLAY_NAMES: { [key in EquipmentType]: string } = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbells',
  cable: 'Cable Machine',
  machine: 'Machine',
  bodyweight: 'Bodyweight',
  kettlebell: 'Kettlebell',
  resistance_band: 'Resistance Bands',
  ez_bar: 'EZ Curl Bar',
  smith_machine: 'Smith Machine',
  pull_up_bar: 'Pull-Up Bar',
  dip_station: 'Dip Station',
  bench: 'Bench',
  leg_press: 'Leg Press',
  hack_squat: 'Hack Squat',
  leg_curl: 'Leg Curl Machine',
  leg_extension: 'Leg Extension',
  cable_crossover: 'Cable Crossover',
  lat_pulldown: 'Lat Pulldown',
  rowing_machine: 'Rowing Machine',
  preacher_curl: 'Preacher Curl Bench',
  pec_deck: 'Pec Deck',
  shoulder_press_machine: 'Shoulder Press Machine',
  chest_press_machine: 'Chest Press Machine',
  seated_row: 'Seated Row Machine',
  treadmill: 'Treadmill',
  bike: 'Stationary Bike',
  elliptical: 'Elliptical',
  none: 'No Equipment',
};

// Muscle group display names
export const MUSCLE_DISPLAY_NAMES: { [key in MuscleGroup]: string } = {
  chest: 'Chest',
  shoulders: 'Shoulders',
  triceps: 'Triceps',
  biceps: 'Biceps',
  forearms: 'Forearms',
  lats: 'Lats',
  traps: 'Traps',
  upper_back: 'Upper Back',
  lower_back: 'Lower Back',
  abs: 'Abs',
  obliques: 'Obliques',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  full_body: 'Full Body',
  cardio: 'Cardio',
};

export default EXERCISE_LIBRARY;
