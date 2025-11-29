import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { usePlusDrawerStore } from "@/utils/usePlusDrawerStore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = Math.min(300, SCREEN_WIDTH * 0.8);

export default function CustomDrawer({ children, drawerContent }) {
  const { isOpen, close, open } = usePlusDrawerStore();
  const translateX = useSharedValue(-DRAWER_WIDTH);

  useEffect(() => {
    // If open, animate to 0. If closed, animate to -DRAWER_WIDTH
    translateX.value = withSpring(isOpen ? 0 : -DRAWER_WIDTH, {
      damping: 20,
      stiffness: 90,
      overshootClamping: true,
    });
  }, [isOpen]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isOpen) {
        // Allow dragging left to close
        // event.translationX is negative when dragging left
        if (event.translationX < 0) {
          translateX.value = Math.max(-DRAWER_WIDTH, event.translationX);
        }
      } else {
        // Allow dragging right to open (optional, maybe harder to detect from edge without overlay)
        // skipping edge swipe for now to keep it simple and avoid conflicts with back gestures
      }
    })
    .onEnd((event) => {
      if (isOpen) {
        // If dragged significantly left or high velocity, close
        if (event.translationX < -50 || event.velocityX < -500) {
          runOnJS(close)();
        } else {
          // Spring back to open
          translateX.value = withSpring(0);
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-DRAWER_WIDTH, 0],
      [0, 0.5],
      Extrapolation.CLAMP,
    );
    // Hide backdrop when closed to prevent intercepting touches
    const zIndex = translateX.value > -DRAWER_WIDTH + 1 ? 1 : -1;
    return {
      opacity,
      zIndex,
    };
  });

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>{children}</View>

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={close}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Drawer */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.drawer, animatedStyle, { width: DRAWER_WIDTH }]}
        >
          {drawerContent}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Ensure the drawer sits on top of everything
    zIndex: 9999,
  },
  content: {
    flex: 1,
    zIndex: 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
  },
  backdropTouchable: {
    flex: 1,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2,
    // Padding top handled by content usually, but safe to have background
  },
});
