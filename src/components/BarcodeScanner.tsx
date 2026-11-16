import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { ScreenContainer } from './ScreenContainer';

interface BarcodeScannerProps {
  onScanned: (code: string) => void;
  hint?: string;
}

const BARCODE_TYPES = ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e'] as const;

export function BarcodeScanner({ onScanned, hint = 'Apunta la cámara al código del producto.' }: BarcodeScannerProps) {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [isLocked, setIsLocked] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const handleScanned = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed || isLocked) return;
    setIsLocked(true);
    onScanned(trimmed);
  };

  const renderCamera = () => {
    if (!permission) {
      return <View style={styles.cameraPlaceholder} />;
    }

    if (!permission.granted) {
      return (
        <View style={[styles.cameraPlaceholder, styles.permission]}>
          <Text variant="titleMedium" style={styles.centered}>
            Necesitamos acceso a la cámara
          </Text>
          <Text variant="bodyMedium" style={[styles.centered, { color: theme.colors.onSurfaceVariant }]}>
            Sirve para leer el código de tus productos. También puedes escribirlo a mano abajo.
          </Text>
          {permission.canAskAgain ? (
            <Button mode="contained" onPress={() => requestPermission()}>
              Permitir cámara
            </Button>
          ) : (
            <Button mode="contained" onPress={() => Linking.openSettings()}>
              Abrir ajustes
            </Button>
          )}
        </View>
      );
    }

    if (!isFocused) {
      return <View style={styles.cameraPlaceholder} />;
    }

    return (
      <View style={styles.cameraPlaceholder}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={isTorchOn}
          barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
          onBarcodeScanned={isLocked ? undefined : (result) => handleScanned(result.data)}
        />
        <View style={styles.frameWrapper} pointerEvents="none">
          <View style={[styles.frame, { borderColor: theme.colors.primary }]} />
        </View>
        <IconButton
          icon={isTorchOn ? 'flashlight' : 'flashlight-off'}
          mode="contained"
          accessibilityLabel={isTorchOn ? 'Apagar linterna' : 'Encender linterna'}
          onPress={() => setIsTorchOn((current) => !current)}
          style={styles.torch}
        />
      </View>
    );
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {renderCamera()}
        <View style={styles.manual}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {hint}
          </Text>
          <TextInput
            mode="outlined"
            label="Ingresar código manualmente"
            value={manualCode}
            onChangeText={setManualCode}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => handleScanned(manualCode)}
          />
          <Button mode="contained" onPress={() => handleScanned(manualCode)} disabled={!manualCode.trim() || isLocked}>
            Usar este código
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cameraPlaceholder: { backgroundColor: '#000', flex: 1, overflow: 'hidden' },
  permission: { alignItems: 'center', backgroundColor: 'transparent', gap: 12, justifyContent: 'center', padding: 24 },
  centered: { textAlign: 'center' },
  frameWrapper: { alignItems: 'center', bottom: 0, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0 },
  frame: { borderRadius: 16, borderWidth: 3, height: 160, width: '75%' },
  torch: { position: 'absolute', right: 12, top: 12 },
  manual: { gap: 12, padding: 16 },
});
