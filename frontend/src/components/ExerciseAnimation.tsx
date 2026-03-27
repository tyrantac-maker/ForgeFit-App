import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle, Line, Ellipse, Rect } from 'react-native-svg';

interface ExerciseAnimationProps {
  exerciseName: string;
  position: 'start' | 'end';
  size?: number;
}

// Simplified mesh-style human figure poses for different exercises
const EXERCISE_POSES: { [key: string]: { start: any; end: any } } = {
  // Push movements
  'push-ups': {
    start: { arms: 'extended', torso: 'plank', legs: 'straight' },
    end: { arms: 'bent', torso: 'lowered', legs: 'straight' },
  },
  'bench press': {
    start: { arms: 'extended', torso: 'lying', legs: 'bent' },
    end: { arms: 'bent', torso: 'lying', legs: 'bent' },
  },
  'dumbbell bench press': {
    start: { arms: 'extended', torso: 'lying', legs: 'bent' },
    end: { arms: 'bent', torso: 'lying', legs: 'bent' },
  },
  'incline dumbbell press': {
    start: { arms: 'extended', torso: 'inclined', legs: 'bent' },
    end: { arms: 'bent', torso: 'inclined', legs: 'bent' },
  },
  'overhead press': {
    start: { arms: 'at-shoulders', torso: 'standing', legs: 'straight' },
    end: { arms: 'overhead', torso: 'standing', legs: 'straight' },
  },
  'dumbbell shoulder press': {
    start: { arms: 'at-shoulders', torso: 'standing', legs: 'straight' },
    end: { arms: 'overhead', torso: 'standing', legs: 'straight' },
  },
  // Pull movements
  'pull-ups': {
    start: { arms: 'extended-up', torso: 'hanging', legs: 'straight' },
    end: { arms: 'bent-up', torso: 'raised', legs: 'straight' },
  },
  'lat pulldown': {
    start: { arms: 'extended-up', torso: 'sitting', legs: 'bent' },
    end: { arms: 'at-shoulders', torso: 'sitting', legs: 'bent' },
  },
  'barbell rows': {
    start: { arms: 'extended-down', torso: 'bent-over', legs: 'bent' },
    end: { arms: 'bent-row', torso: 'bent-over', legs: 'bent' },
  },
  'dumbbell rows': {
    start: { arms: 'extended-down', torso: 'bent-over', legs: 'bent' },
    end: { arms: 'bent-row', torso: 'bent-over', legs: 'bent' },
  },
  // Leg movements
  'squats': {
    start: { arms: 'forward', torso: 'standing', legs: 'straight' },
    end: { arms: 'forward', torso: 'squatting', legs: 'deep-bent' },
  },
  'goblet squats': {
    start: { arms: 'at-chest', torso: 'standing', legs: 'straight' },
    end: { arms: 'at-chest', torso: 'squatting', legs: 'deep-bent' },
  },
  'lunges': {
    start: { arms: 'at-sides', torso: 'standing', legs: 'straight' },
    end: { arms: 'at-sides', torso: 'lowered', legs: 'lunge' },
  },
  'leg press': {
    start: { arms: 'at-sides', torso: 'reclined', legs: 'bent' },
    end: { arms: 'at-sides', torso: 'reclined', legs: 'extended' },
  },
  'deadlift': {
    start: { arms: 'extended-down', torso: 'bent-over', legs: 'bent' },
    end: { arms: 'at-sides', torso: 'standing', legs: 'straight' },
  },
  'romanian deadlift': {
    start: { arms: 'extended-down', torso: 'standing', legs: 'straight' },
    end: { arms: 'extended-down', torso: 'hinged', legs: 'slight-bent' },
  },
  // Arm movements
  'bicep curls': {
    start: { arms: 'extended-down', torso: 'standing', legs: 'straight' },
    end: { arms: 'curled', torso: 'standing', legs: 'straight' },
  },
  'hammer curls': {
    start: { arms: 'extended-down', torso: 'standing', legs: 'straight' },
    end: { arms: 'curled', torso: 'standing', legs: 'straight' },
  },
  'tricep pushdowns': {
    start: { arms: 'bent-at-chest', torso: 'standing', legs: 'straight' },
    end: { arms: 'extended-down', torso: 'standing', legs: 'straight' },
  },
  // Core
  'plank': {
    start: { arms: 'plank', torso: 'plank', legs: 'straight' },
    end: { arms: 'plank', torso: 'plank', legs: 'straight' },
  },
  'crunches': {
    start: { arms: 'behind-head', torso: 'lying', legs: 'bent' },
    end: { arms: 'behind-head', torso: 'crunched', legs: 'bent' },
  },
  'leg raises': {
    start: { arms: 'at-sides', torso: 'lying', legs: 'straight-down' },
    end: { arms: 'at-sides', torso: 'lying', legs: 'raised' },
  },
  // Default for unknown exercises
  'default': {
    start: { arms: 'at-sides', torso: 'standing', legs: 'straight' },
    end: { arms: 'at-sides', torso: 'standing', legs: 'straight' },
  },
};

const MeshFigure: React.FC<{ pose: string; position: 'start' | 'end'; size: number }> = ({ pose, position, size }) => {
  const strokeColor = '#76FF00';
  const strokeWidth = 2;
  const dotColor = '#76FF00';
  const scale = size / 100;
  
  // Get pose data
  const normalizedPose = pose.toLowerCase();
  const poseData = EXERCISE_POSES[normalizedPose] || EXERCISE_POSES['default'];
  const currentPose = poseData[position];
  
  // Calculate positions based on pose
  const getHeadY = () => {
    if (currentPose.torso === 'squatting' || currentPose.torso === 'lowered') return 35;
    if (currentPose.torso === 'bent-over' || currentPose.torso === 'hinged') return 45;
    if (currentPose.torso === 'lying' || currentPose.torso === 'reclined') return 50;
    if (currentPose.torso === 'hanging' || currentPose.torso === 'raised') return 15;
    if (currentPose.torso === 'crunched') return 45;
    return 20;
  };
  
  const getTorsoAngle = () => {
    if (currentPose.torso === 'bent-over' || currentPose.torso === 'hinged') return 45;
    if (currentPose.torso === 'lying' || currentPose.torso === 'reclined') return 90;
    if (currentPose.torso === 'plank' || currentPose.torso === 'lowered') return 10;
    if (currentPose.torso === 'squatting') return 15;
    if (currentPose.torso === 'inclined') return 30;
    return 0;
  };
  
  const headY = getHeadY() * scale;
  const torsoAngle = getTorsoAngle();
  
  // Dynamic arm positions based on pose
  const getArmPath = (side: 'left' | 'right') => {
    const baseX = 50 * scale;
    const shoulderY = (headY + 15);
    const sideOffset = side === 'left' ? -20 : 20;
    
    if (currentPose.arms === 'extended') {
      return `M ${baseX} ${shoulderY} L ${baseX + sideOffset * 1.5} ${shoulderY}`;
    }
    if (currentPose.arms === 'bent') {
      return `M ${baseX} ${shoulderY} L ${baseX + sideOffset} ${shoulderY + 10} L ${baseX + sideOffset * 0.5} ${shoulderY - 5}`;
    }
    if (currentPose.arms === 'overhead' || currentPose.arms === 'extended-up') {
      return `M ${baseX} ${shoulderY} L ${baseX + sideOffset * 0.5} ${shoulderY - 25}`;
    }
    if (currentPose.arms === 'at-shoulders' || currentPose.arms === 'bent-up') {
      return `M ${baseX} ${shoulderY} L ${baseX + sideOffset} ${shoulderY - 5} L ${baseX + sideOffset * 0.5} ${shoulderY - 15}`;
    }
    if (currentPose.arms === 'curled') {
      return `M ${baseX} ${shoulderY} L ${baseX + sideOffset * 0.8} ${shoulderY + 5} L ${baseX + sideOffset * 0.3} ${shoulderY - 5}`;
    }
    if (currentPose.arms === 'extended-down') {
      return `M ${baseX} ${shoulderY} L ${baseX + sideOffset * 0.3} ${shoulderY + 25}`;
    }
    if (currentPose.arms === 'bent-row') {
      return `M ${baseX} ${shoulderY} L ${baseX + sideOffset} ${shoulderY + 5} L ${baseX + sideOffset * 1.2} ${shoulderY - 10}`;
    }
    if (currentPose.arms === 'plank') {
      return `M ${baseX} ${shoulderY} L ${baseX + sideOffset * 0.8} ${shoulderY + 20}`;
    }
    if (currentPose.arms === 'forward') {
      return `M ${baseX} ${shoulderY} L ${baseX + sideOffset * 0.3} ${shoulderY + 15}`;
    }
    if (currentPose.arms === 'at-chest') {
      return `M ${baseX} ${shoulderY} L ${baseX + sideOffset * 0.5} ${shoulderY + 5} L ${baseX} ${shoulderY + 10}`;
    }
    // Default: at sides
    return `M ${baseX} ${shoulderY} L ${baseX + sideOffset * 0.5} ${shoulderY + 20}`;
  };
  
  const getLegPath = (side: 'left' | 'right') => {
    const baseX = 50 * scale;
    const hipY = headY + 35;
    const sideOffset = side === 'left' ? -8 : 8;
    
    if (currentPose.legs === 'deep-bent' || currentPose.legs === 'squatting') {
      return `M ${baseX + sideOffset} ${hipY} L ${baseX + sideOffset * 2} ${hipY + 10} L ${baseX + sideOffset * 0.5} ${hipY + 25}`;
    }
    if (currentPose.legs === 'bent') {
      return `M ${baseX + sideOffset} ${hipY} L ${baseX + sideOffset * 1.5} ${hipY + 15} L ${baseX + sideOffset} ${hipY + 25}`;
    }
    if (currentPose.legs === 'lunge') {
      if (side === 'left') {
        return `M ${baseX + sideOffset} ${hipY} L ${baseX - 15} ${hipY + 15} L ${baseX - 20} ${hipY + 25}`;
      }
      return `M ${baseX + sideOffset} ${hipY} L ${baseX + 20} ${hipY + 10} L ${baseX + 25} ${hipY + 25}`;
    }
    if (currentPose.legs === 'raised') {
      return `M ${baseX + sideOffset} ${hipY} L ${baseX + sideOffset} ${hipY - 15}`;
    }
    if (currentPose.legs === 'slight-bent') {
      return `M ${baseX + sideOffset} ${hipY} L ${baseX + sideOffset * 1.2} ${hipY + 12} L ${baseX + sideOffset} ${hipY + 25}`;
    }
    // Default: straight
    return `M ${baseX + sideOffset} ${hipY} L ${baseX + sideOffset} ${hipY + 25}`;
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${100 * scale} ${100 * scale}`}>
      {/* Background grid lines for mesh effect */}
      <G opacity={0.2}>
        {[...Array(10)].map((_, i) => (
          <Line
            key={`h-${i}`}
            x1={0}
            y1={i * 10 * scale}
            x2={100 * scale}
            y2={i * 10 * scale}
            stroke={strokeColor}
            strokeWidth={0.5}
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <Line
            key={`v-${i}`}
            x1={i * 10 * scale}
            y1={0}
            x2={i * 10 * scale}
            y2={100 * scale}
            stroke={strokeColor}
            strokeWidth={0.5}
          />
        ))}
      </G>
      
      {/* Head */}
      <Circle
        cx={50 * scale}
        cy={headY}
        r={8 * scale}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      
      {/* Torso */}
      <Line
        x1={50 * scale}
        y1={headY + 8 * scale}
        x2={50 * scale + (torsoAngle > 45 ? 20 * scale : 0)}
        y2={headY + 35 * scale}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      
      {/* Arms */}
      <Path
        d={getArmPath('left')}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Path
        d={getArmPath('right')}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      
      {/* Legs */}
      <Path
        d={getLegPath('left')}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Path
        d={getLegPath('right')}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      
      {/* Joint dots */}
      <Circle cx={50 * scale} cy={headY + 8 * scale} r={3} fill={dotColor} />
      <Circle cx={50 * scale} cy={headY + 35 * scale} r={3} fill={dotColor} />
      
      {/* Outline glow effect */}
      <Circle
        cx={50 * scale}
        cy={headY}
        r={10 * scale}
        stroke={strokeColor}
        strokeWidth={1}
        fill="transparent"
        opacity={0.3}
      />
    </Svg>
  );
};

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  exerciseName,
  position,
  size = 80,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <MeshFigure pose={exerciseName} position={position} size={size} />
      <View style={styles.labelContainer}>
        <View style={[styles.label, position === 'start' ? styles.startLabel : styles.endLabel]}>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  label: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  startLabel: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  endLabel: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  labelText: {
    fontSize: 8,
    fontWeight: '600',
  },
});

export default ExerciseAnimation;
