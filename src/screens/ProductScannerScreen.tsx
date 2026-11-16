import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BarcodeScanner } from '../components/BarcodeScanner';
import type { ProductsStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductScanner'>;

export function ProductScannerScreen({ navigation }: Props) {
  return (
    <BarcodeScanner
      hint="Escanea el código de un producto para buscarlo en tu inventario."
      onScanned={(code) => navigation.popTo('ProductsList', { scannedCode: code, scannedAt: Date.now() })}
    />
  );
}
