import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClientFormScreen } from '../screens/ClientFormScreen';
import { ClientsScreen } from '../screens/ClientsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProductFormScreen } from '../screens/ProductFormScreen';
import { ProductScannerScreen } from '../screens/ProductScannerScreen';
import { ProductVariantsScreen } from '../screens/ProductVariantsScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { SaleDetailScreen } from '../screens/SaleDetailScreen';
import { SaleScannerScreen } from '../screens/SaleScannerScreen';
import { SaleFormScreen } from '../screens/SaleFormScreen';
import { SalesScreen } from '../screens/SalesScreen';
import type {
  AssistantStackParamList,
  CategoriesStackParamList,
  ClientsStackParamList,
  DashboardStackParamList,
  ProductsStackParamList,
  PurchasesStackParamList,
  SalesStackParamList,
  SuppliersStackParamList,
  TeamStackParamList,
} from '../types/navigation';
import { DrawerMenuButton } from './DrawerMenuButton';

const rootScreenOptions = (title: string) => ({
  title,
  headerLeft: () => <DrawerMenuButton />,
});

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const SalesStack = createNativeStackNavigator<SalesStackParamList>();
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const ClientsStack = createNativeStackNavigator<ClientsStackParamList>();
const AssistantStack = createNativeStackNavigator<AssistantStackParamList>();
const PurchasesStack = createNativeStackNavigator<PurchasesStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();
const SuppliersStack = createNativeStackNavigator<SuppliersStackParamList>();
const TeamStack = createNativeStackNavigator<TeamStackParamList>();

export function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator>
      <DashboardStack.Screen name="Dashboard" component={DashboardScreen} options={rootScreenOptions('Dashboard')} />
    </DashboardStack.Navigator>
  );
}

export function SalesStackNavigator() {
  return (
    <SalesStack.Navigator>
      <SalesStack.Screen name="SalesList" component={SalesScreen} options={rootScreenOptions('Ventas')} />
      <SalesStack.Screen name="SaleDetail" component={SaleDetailScreen} options={{ title: 'Detalle de venta' }} />
      <SalesStack.Screen name="SaleForm" component={SaleFormScreen} options={{ title: 'Nueva venta' }} />
      <SalesStack.Screen name="SaleScanner" component={SaleScannerScreen} options={{ title: 'Escanear producto' }} />
    </SalesStack.Navigator>
  );
}

export function ProductsStackNavigator() {
  return (
    <ProductsStack.Navigator>
      <ProductsStack.Screen name="ProductsList" component={ProductsScreen} options={rootScreenOptions('Productos')} />
      <ProductsStack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={({ route }) => ({ title: route.params?.id !== undefined ? 'Editar producto' : 'Nuevo producto' })}
      />
      <ProductsStack.Screen name="ProductScanner" component={ProductScannerScreen} options={{ title: 'Escanear producto' }} />
      <ProductsStack.Screen
        name="ProductVariants"
        component={ProductVariantsScreen}
        options={{ title: 'Variantes y stock' }}
      />
    </ProductsStack.Navigator>
  );
}

export function ClientsStackNavigator() {
  return (
    <ClientsStack.Navigator>
      <ClientsStack.Screen name="ClientsList" component={ClientsScreen} options={rootScreenOptions('Clientes')} />
      <ClientsStack.Screen
        name="ClientForm"
        component={ClientFormScreen}
        options={({ route }) => ({ title: route.params?.id !== undefined ? 'Editar cliente' : 'Nuevo cliente' })}
      />
    </ClientsStack.Navigator>
  );
}

export function AssistantStackNavigator() {
  return (
    <AssistantStack.Navigator>
      <AssistantStack.Screen name="Assistant" component={PlaceholderScreen} options={rootScreenOptions('Asistente')} />
    </AssistantStack.Navigator>
  );
}

export function PurchasesStackNavigator() {
  return (
    <PurchasesStack.Navigator>
      <PurchasesStack.Screen name="PurchasesList" component={PlaceholderScreen} options={rootScreenOptions('Compras')} />
      <PurchasesStack.Screen
        name="PurchaseDetail"
        component={PlaceholderScreen}
        options={{ title: 'Detalle de compra' }}
      />
      <PurchasesStack.Screen name="PurchaseForm" component={PlaceholderScreen} options={{ title: 'Nueva compra' }} />
    </PurchasesStack.Navigator>
  );
}

export function CategoriesStackNavigator() {
  return (
    <CategoriesStack.Navigator>
      <CategoriesStack.Screen
        name="CategoriesList"
        component={PlaceholderScreen}
        options={rootScreenOptions('Categorías')}
      />
      <CategoriesStack.Screen name="CategoryForm" component={PlaceholderScreen} options={{ title: 'Categoría' }} />
    </CategoriesStack.Navigator>
  );
}

export function SuppliersStackNavigator() {
  return (
    <SuppliersStack.Navigator>
      <SuppliersStack.Screen
        name="SuppliersList"
        component={PlaceholderScreen}
        options={rootScreenOptions('Proveedores')}
      />
      <SuppliersStack.Screen name="SupplierForm" component={PlaceholderScreen} options={{ title: 'Proveedor' }} />
    </SuppliersStack.Navigator>
  );
}

export function TeamStackNavigator() {
  return (
    <TeamStack.Navigator>
      <TeamStack.Screen name="Team" component={PlaceholderScreen} options={rootScreenOptions('Equipo')} />
    </TeamStack.Navigator>
  );
}
