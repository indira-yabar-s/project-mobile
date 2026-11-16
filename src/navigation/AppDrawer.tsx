import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import type { ComponentProps } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { AppDrawerParamList } from '../types/navigation';
import { AppDrawerContent } from './AppDrawerContent';
import { MainTabs } from './MainTabs';
import {
  CategoriesStackNavigator,
  PurchasesStackNavigator,
  SuppliersStackNavigator,
  TeamStackNavigator,
} from './stacks';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const Drawer = createDrawerNavigator<AppDrawerParamList>();

const drawerIcon =
  (name: IconName) =>
  ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name={name} color={color} size={size} />;

export function AppDrawer() {
  const { isAdmin } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabs} options={{ title: 'Inicio', drawerIcon: drawerIcon('home-outline') }} />
      <Drawer.Screen
        name="PurchasesDrawer"
        component={PurchasesStackNavigator}
        options={{ title: 'Compras', drawerIcon: drawerIcon('clipboard-list-outline') }}
      />
      <Drawer.Screen
        name="CategoriesDrawer"
        component={CategoriesStackNavigator}
        options={{ title: 'Categorías', drawerIcon: drawerIcon('tag-multiple-outline') }}
      />
      <Drawer.Screen
        name="SuppliersDrawer"
        component={SuppliersStackNavigator}
        options={{ title: 'Proveedores', drawerIcon: drawerIcon('truck-outline') }}
      />
      {isAdmin && (
        <Drawer.Screen
          name="TeamDrawer"
          component={TeamStackNavigator}
          options={{ title: 'Equipo', drawerIcon: drawerIcon('account-cog-outline') }}
        />
      )}
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil', headerShown: true, drawerIcon: drawerIcon('account-circle-outline') }}
      />
    </Drawer.Navigator>
  );
}
