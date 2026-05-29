import { useEffect, useRef, useState, useCallback } from 'react';
import { Keyboard, Platform, Dimensions, StatusBar } from 'react-native';

// Tracks keyboard visibility and height.
// On Android with adjustResize mode (Expo Go default), keyboard events may report
// height 0 because the window already resized. We detect this via dimension changes.
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);
  const lastWindowHeight = useRef(Dimensions.get('window').height);
  const fullScreenHeight = useRef(Dimensions.get('screen').height);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e) => {
      const h = e?.endCoordinates?.height ?? 0;
      if (h > 0) {
        setHeight(h);
      } else if (Platform.OS === 'android') {
        // Fallback: estimate from screen vs window height difference
        const screen = Dimensions.get('screen').height;
        const window = Dimensions.get('window').height;
        const statusBar = StatusBar.currentHeight || 0;
        const diff = screen - window - statusBar;
        if (diff > 100) {
          setHeight(diff);
        }
      }
    };

    const onHide = () => setHeight(0);

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    // Android fallback: listen for dimension changes
    let dimensionSub;
    if (Platform.OS === 'android') {
      dimensionSub = Dimensions.addEventListener('change', ({ window, screen }) => {
        const prevHeight = lastWindowHeight.current;
        const currentHeight = window.height;
        const diff = prevHeight - currentHeight;

        // If window shrunk significantly, keyboard likely opened
        if (diff > 100) {
          setHeight(diff);
        } else if (diff < -100) {
          // Window grew, keyboard likely closed
          setHeight(0);
        }

        lastWindowHeight.current = currentHeight;
      });
    }

    return () => {
      showSub.remove();
      hideSub.remove();
      dimensionSub?.remove();
    };
  }, []);

  return height;
}

// Hook that returns both visibility state and the raw height.
export function useKeyboard() {
  const height = useKeyboardHeight();
  return {
    keyboardHeight: height,
    keyboardVisible: height > 0,
  };
}
