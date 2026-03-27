import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';

// Muscle groups with their SVG path definitions for front and back views
const MUSCLE_PATHS = {
  // Front view muscles
  front: {
    chest: {
      path: 'M35,45 Q50,42 65,45 Q68,55 65,65 Q50,68 35,65 Q32,55 35,45 Z',
      label: 'Chest',
    },
    shoulders: {
      path: 'M25,40 Q30,35 35,40 L35,50 Q30,52 25,50 Z M65,40 Q70,35 75,40 L75,50 Q70,52 65,50 Z',
      label: 'Shoulders',
    },
    biceps: {
      path: 'M20,52 Q25,50 28,55 L26,72 Q22,74 18,72 L20,52 Z M72,55 Q75,50 80,52 L82,72 Q78,74 74,72 L72,55 Z',
      label: 'Biceps',
    },
    forearms: {
      path: 'M18,74 Q22,72 26,74 L24,92 Q20,94 16,92 L18,74 Z M74,74 Q78,72 82,74 L84,92 Q80,94 76,92 L74,74 Z',
      label: 'Forearms',
    },
    abs: {
      path: 'M42,68 L58,68 L58,100 L42,100 Z',
      label: 'Abs',
    },
    obliques: {
      path: 'M35,70 L42,68 L42,95 L35,90 Z M58,68 L65,70 L65,90 L58,95 Z',
      label: 'Obliques',
    },
    quads: {
      path: 'M38,105 Q45,102 50,105 Q50,130 45,145 L38,145 Q35,130 38,105 Z M50,105 Q55,102 62,105 Q65,130 62,145 L55,145 Q50,130 50,105 Z',
      label: 'Quads',
    },
    calves: {
      path: 'M40,150 Q45,148 48,150 L46,175 Q43,177 40,175 Z M52,150 Q55,148 60,150 L60,175 Q57,177 54,175 L52,150 Z',
      label: 'Calves',
    },
  },
  // Back view muscles
  back: {
    traps: {
      path: 'M40,30 Q50,25 60,30 L58,45 Q50,48 42,45 Z',
      label: 'Traps',
    },
    lats: {
      path: 'M30,50 Q35,45 40,50 L38,80 Q32,85 28,80 Z M60,50 Q65,45 70,50 L72,80 Q68,85 62,80 Z',
      label: 'Lats',
    },
    upper_back: {
      path: 'M40,45 Q50,42 60,45 L60,60 Q50,62 40,60 Z',
      label: 'Upper Back',
    },
    lower_back: {
      path: 'M42,65 Q50,63 58,65 L58,85 Q50,88 42,85 Z',
      label: 'Lower Back',
    },
    triceps: {
      path: 'M22,52 Q27,50 30,55 L28,72 Q24,74 20,72 Z M70,55 Q73,50 78,52 L80,72 Q76,74 72,72 L70,55 Z',
      label: 'Triceps',
    },
    glutes: {
      path: 'M38,90 Q50,85 62,90 L62,110 Q50,115 38,110 Z',
      label: 'Glutes',
    },
    hamstrings: {
      path: 'M40,112 Q45,110 50,112 L48,145 Q44,147 40,145 Z M50,112 Q55,110 60,112 L60,145 Q56,147 52,145 L50,112 Z',
      label: 'Hamstrings',
    },
    calves_back: {
      path: 'M42,148 Q46,146 50,148 L48,175 Q45,177 42,175 Z M50,148 Q54,146 58,148 L58,175 Q55,177 52,175 L50,148 Z',
      label: 'Calves',
    },
  },
};

// Body outline paths
const BODY_OUTLINE = {
  front: 'M50,10 Q65,10 68,25 L70,35 Q75,38 78,45 L82,55 Q85,60 84,70 L86,90 Q85,95 82,95 L78,92 Q75,95 72,92 L68,75 Q70,65 68,55 L65,48 Q68,60 66,75 L68,95 Q70,105 68,115 L70,145 Q72,160 70,175 Q68,185 60,185 L55,180 Q52,185 50,185 Q48,185 45,180 L40,185 Q32,185 30,175 Q28,160 30,145 L32,115 Q30,105 32,95 L34,75 Q32,60 35,48 L32,55 Q30,65 32,75 L28,92 Q25,95 22,92 L18,95 Q15,95 14,90 L16,70 Q15,60 18,55 L22,45 Q25,38 30,35 L32,25 Q35,10 50,10 Z',
  back: 'M50,10 Q65,10 68,25 L70,35 Q75,38 78,45 L82,55 Q85,60 84,70 L86,90 Q85,95 82,95 L78,92 Q75,95 72,92 L68,75 Q70,65 68,55 L65,48 Q68,60 66,75 L68,95 Q70,105 68,115 L70,145 Q72,160 70,175 Q68,185 60,185 L55,180 Q52,185 50,185 Q48,185 45,180 L40,185 Q32,185 30,175 Q28,160 30,145 L32,115 Q30,105 32,95 L34,75 Q32,60 35,48 L32,55 Q30,65 32,75 L28,92 Q25,95 22,92 L18,95 Q15,95 14,90 L16,70 Q15,60 18,55 L22,45 Q25,38 30,35 L32,25 Q35,10 50,10 Z',
};

type BodyAnatomyProps = {
  selectedMuscles: string[];
  view: 'front' | 'back';
  size?: number;
};

export const BodyAnatomy: React.FC<BodyAnatomyProps> = ({
  selectedMuscles,
  view,
  size = 180,
}) => {
  const muscles = MUSCLE_PATHS[view];
  
  const isSelected = (muscleKey: string) => {
    // Map muscle keys to selectable muscle names
    const muscleMapping: { [key: string]: string[] } = {
      chest: ['chest'],
      shoulders: ['shoulders'],
      biceps: ['biceps'],
      forearms: ['forearms', 'wrists', 'grip'],
      abs: ['abs'],
      obliques: ['obliques'],
      quads: ['quads'],
      calves: ['calves'],
      traps: ['traps'],
      lats: ['lats'],
      upper_back: ['upper_back'],
      lower_back: ['lower_back'],
      triceps: ['triceps'],
      glutes: ['glutes'],
      hamstrings: ['hamstrings'],
      calves_back: ['calves'],
    };
    
    const mappedMuscles = muscleMapping[muscleKey] || [muscleKey];
    return mappedMuscles.some(m => selectedMuscles.includes(m));
  };

  return (
    <View style={[styles.container, { width: size, height: size * 1.1 }]}>
      <Svg
        width={size}
        height={size * 1.1}
        viewBox="0 0 100 200"
      >
        <Defs>
          {/* Green mesh gradient for highlighted muscles */}
          <LinearGradient id="greenMesh" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#76FF00" stopOpacity="0.9" />
            <Stop offset="50%" stopColor="#00CC66" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#76FF00" stopOpacity="0.9" />
          </LinearGradient>
          
          {/* Default muscle gradient */}
          <LinearGradient id="defaultMuscle" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2A2A2A" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#1A1A1A" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        
        {/* Body outline with mesh effect */}
        <Path
          d={BODY_OUTLINE[view]}
          fill="none"
          stroke="#333"
          strokeWidth="0.8"
        />
        
        {/* Mesh grid lines for wireframe effect */}
        <G opacity={0.3}>
          {[...Array(20)].map((_, i) => (
            <Path
              key={`h-${i}`}
              d={`M10,${10 + i * 9} L90,${10 + i * 9}`}
              stroke="#444"
              strokeWidth="0.3"
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <Path
              key={`v-${i}`}
              d={`M${10 + i * 9},10 L${10 + i * 9},190`}
              stroke="#444"
              strokeWidth="0.3"
            />
          ))}
        </G>
        
        {/* Render muscle groups */}
        {Object.entries(muscles).map(([key, muscle]) => (
          <G key={key}>
            <Path
              d={muscle.path}
              fill={isSelected(key) ? 'url(#greenMesh)' : 'url(#defaultMuscle)'}
              stroke={isSelected(key) ? '#76FF00' : '#444'}
              strokeWidth={isSelected(key) ? 1.5 : 0.5}
              opacity={isSelected(key) ? 1 : 0.5}
            />
            {/* Add mesh effect on selected muscles */}
            {isSelected(key) && (
              <G opacity={0.4}>
                {[...Array(5)].map((_, i) => (
                  <Path
                    key={`mesh-${key}-${i}`}
                    d={muscle.path}
                    fill="none"
                    stroke="#76FF00"
                    strokeWidth="0.3"
                    strokeDasharray="2,2"
                    transform={`scale(${0.85 + i * 0.03})`}
                    translateX={50 * (1 - (0.85 + i * 0.03))}
                    translateY={100 * (1 - (0.85 + i * 0.03))}
                  />
                ))}
              </G>
            )}
          </G>
        ))}
        
        {/* Body outline on top */}
        <Path
          d={BODY_OUTLINE[view]}
          fill="none"
          stroke="#555"
          strokeWidth="1"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BodyAnatomy;
