import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16 },
    medium: { paddingVertical: 14, paddingHorizontal: 24 },
    large: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const textSizes = {
    small: 14,
    medium: 16,
    large: 18,
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.buttonBase, style, disabled && styles.disabled]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={disabled ? ['#555', '#444'] : ['#FF6B35', '#FF8F5C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, sizeStyles[size]]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              {icon}
              <Text style={[styles.primaryText, { fontSize: textSizes[size] }, textStyle]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: { backgroundColor: '#2A2A2A', borderWidth: 0 },
    outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#FF6B35' },
    danger: { backgroundColor: '#DC3545', borderWidth: 0 },
  };

  const variantTextStyles = {
    secondary: { color: '#fff' },
    outline: { color: '#FF6B35' },
    danger: { color: '#fff' },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.buttonBase,
        sizeStyles[size],
        variantStyles[variant],
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#FF6B35' : '#fff'} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { fontSize: textSizes[size] },
              variantTextStyles[variant],
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  gradient: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  text: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
