import { DrawerActions, useNavigation } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';

export function DrawerMenuButton() {
  const navigation = useNavigation();

  return <IconButton icon="menu" onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} />;
}
