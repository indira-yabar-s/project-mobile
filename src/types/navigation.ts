import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
};

export type SalesStackParamList = {
  SalesList: undefined;
  SaleDetail: { id: number };
  SaleForm: undefined;
};

export type ProductsStackParamList = {
  ProductsList: undefined;
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
  PurchaseForm: undefined;
};

export type CategoriesStackParamList = {
  CategoriesList: undefined;
  CategoryForm: { id?: number } | undefined;
};

export type SuppliersStackParamList = {
  SuppliersList: undefined;
  SupplierForm: undefined;
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
  TeamDrawer: NavigatorScreenParams<TeamStackParamList>;
  Profile: undefined;
};
