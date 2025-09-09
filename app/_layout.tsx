import { View, Text } from 'react-native';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 20 }}>Test minimal - App fonctionne</Text>
    </View>
  );
}
