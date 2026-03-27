import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { Asset } from 'expo-asset';

const VIDEO_MODULE = require('../../assets/forge-bg.mp4');

export default function ForgeVideoBackground() {
  const player = useVideoPlayer(null, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const asset = Asset.fromModule(VIDEO_MODULE);
        await asset.downloadAsync();
        const uri = asset.localUri ?? asset.uri;
        if (mounted && uri) {
          player.replace({ uri });
          player.play();
        }
      } catch (e) {
        console.warn('ForgeVideoBackground load error:', e);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      {/* Video layer — zero elevation so UI renders above it on Android */}
      <View style={styles.videoLayer}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
      </View>

      {/* Dark overlay + bottom gradient */}
      <View style={styles.overlayLayer} pointerEvents="none">
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.92)', '#000']}
          locations={[0, 0.45, 0.78, 1]}
          style={styles.bottomFade}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  videoLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    elevation: 0,
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    elevation: 1,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 280,
  },
});
