import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
};

export type SalesStackParamList = {
  SalesList: undefined;
  SaleDetail: { id: number };
  SaleForm: { scannedCode?: string; lineKey?: string } | undefined;
  SaleScanner: { lineKey: string };
};

export type ProductsStackParamList = {
  ProductsList: { scannedCode?: string; scannedAt?: number } | undefined;
  ProductScanner: undefined;
  ProductForm: { id?: number } | undefined;
  ProductVariants: { id: number };
};

export type ClientsStackParamList = {
  ClientsList: undefined;
  ClientForm: { id?: number } | undefined;
};

export type AssistantStackParamList = {
  Assistant: undefined;
};

export type PurchasesStackParamList = {
  PurchasesList: undefined;
  PurchaseDetail: { id: number };
  PurchaseForm:
    | {
        proveedorId?: number;
        lineas?: { productoId: number; varianteId: number; cantidad: number; precioUnitario: number }[];
      }
    | undefined;
  Restock: undefined;
};

export type CategoriesStackParamList = {
  CategoriesList: undefined;
  CategoryForm: { id?: number } | undefined;
};

export type SuppliersStackParamList = {
  SuppliersList: undefined;
  SupplierForm: undefined;
};

export type AnalyticsStackParamList = {
  Analytics: undefined;
};

export type TeamStackParamList = {
  Team: undefined;
};

export type MainTabsParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  SalesTab: NavigatorScreenParams<SalesStackParamList>;
  ProductsTab: NavigatorScreenParams<ProductsStackParamList>;
  ClientsTab: NavigatorScreenParams<ClientsStackParamList>;
  AssistantTab: NavigatorScreenParams<AssistantStackParamList>;
};

export type AppDrawerParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  PurchasesDrawer: NavigatorScreenParams<PurchasesStackParamList>;
  CategoriesDrawer: NavigatorScreenParams<CategoriesStackParamList>;
  SuppliersDrawer: NavigatorScreenParams<SuppliersStackParamList>;
  AnalyticsDrawer: NavigatorScreenParams<AnalyticsStackParamList>;
  TeamDrawer: NavigatorScreenParams<TeamStackParamList>;
  Profile: undefined;
};
