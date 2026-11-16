import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BarcodeScanner } from '../components/BarcodeScanner';
import type { SalesStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<SalesStackParamList, 'SaleScanner'>;

export function SaleScannerScreen({ navigation, route }: Props) {
  const { lineKey } = route.params;

  return (
    <BarcodeScanner
      hint="Escanea el código del producto para agregarlo a la línea de la venta."
      onScanned={(code) => navigation.popTo('SaleForm', { scannedCode: code, lineKey })}
    />
  );
}
