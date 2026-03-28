import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LiveClockProps {
  countryCode?: string;
  style?: object;
}

function formatTime(date: Date, use24h: boolean): string {
  if (use24h) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }
  let h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function formatDate(date: Date, countryCode: string): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const usCountries = ['US'];
  const isoCountries = ['CN', 'JP', 'KR', 'TW'];

  if (isoCountries.includes(countryCode)) {
    return `${date.getFullYear()}/${month}/${day}`;
  }
  if (usCountries.includes(countryCode)) {
    return `${month}/${day}`;
  }
  return `${day}/${month}`;
}

const US_FORMAT_COUNTRIES = ['US'];
const ISO_FORMAT_COUNTRIES = ['CN', 'JP', 'KR', 'TW'];

function use24Hour(countryCode: string): boolean {
  return !US_FORMAT_COUNTRIES.includes(countryCode);
}

export function LiveClock({ countryCode = 'GB', style }: LiveClockProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = formatTime(now, use24Hour(countryCode));
  const dateStr = formatDate(now, countryCode);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.time}>{timeStr}</Text>
      <Text style={styles.date}>{dateStr}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  time: {
    color: '#76FF00',
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  date: {
    color: '#666',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
});
