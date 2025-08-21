import { Menu } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  onPress: () => void;
};

export function FAB({ onPress }: Props) {
  return (
    <View pointerEvents="box-none" style={styles.container}>
      <Pressable onPress={onPress} style={styles.button} android_ripple={{ color: 'rgba(255,255,255,0.2)' }}>
        <Text style={styles.label}><Menu size={28} color="white"/></Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  button: {
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    color: 'white',
    fontWeight: '700',
    fontSize: 20,
    marginTop: -2,
  },
});


