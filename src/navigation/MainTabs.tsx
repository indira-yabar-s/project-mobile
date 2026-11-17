import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import type { MainTabsParamList } from '../types/navigation';
import {
  AssistantStackNavigator,
  ClientsStackNavigator,
  DashboardStackNavigator,
  ProductsStackNavigator,
  SalesStackNavigator,
} from './stacks';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const Tab = createBottomTabNavigator<MainTabsParamList>();

const TAB_ICONS: Record<keyof MainTabsParamList, IconName> = {
  DashboardTab: 'home-variant-outline',
  SalesTab: 'cart-outline',
  ProductsTab: 'package-variant-closed',
  ClientsTab: 'account-group-outline',
  AssistantTab: 'robot-outline',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={TAB_ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStackNavigator} options={{ title: 'Inicio' }} />
      <Tab.Screen name="SalesTab" component={SalesStackNavigator} options={{ title: 'Ventas' }} />
      <Tab.Screen name="ProductsTab" component={ProductsStackNavigator} options={{ title: 'Productos' }} />
      <Tab.Screen name="ClientsTab" component={ClientsStackNavigator} options={{ title: 'Clientes' }} />
      <Tab.Screen name="AssistantTab" component={AssistantStackNavigator} options={{ title: 'Asistente' }} />
    </Tab.Navigator>
  );
}
