import { Stack, useRouter } from "expo-router";
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import specific icons from Lucide
import {
  Brain,
  Bug,
  Circle,
  Crown,
  Droplet,
  Feather,
  Flame,
  Ghost,
  Hexagon,
  Leaf,
  Moon,
  Mountain,
  Shield,
  Skull,
  Snowflake,
  Sparkles,
  Swords,
  Zap
} from "lucide-react-native";

const { width } = Dimensions.get('window');
const SPACING = 16;
const CARD_WIDTH = (width - (SPACING * 3)) / 2;

// Map each type to its specific Lucide icon component
const TYPES_DATA = [
  { id: '1', name: 'grass', color: '#48D0B0', Icon: Leaf },
  { id: '2', name: 'fire', color: '#FB6C6C', Icon: Flame },
  { id: '3', name: 'water', color: '#76BDFE', Icon: Droplet },
  { id: '4', name: 'electric', color: '#FFD86F', Icon: Zap },
  { id: '5', name: 'poison', color: '#A040A0', Icon: Skull },
  { id: '6', name: 'bug', color: '#A8B820', Icon: Bug },
  { id: '7', name: 'normal', color: '#A8A878', Icon: Circle },
  { id: '8', name: 'flying', color: '#A890F0', Icon: Feather },
  { id: '9', name: 'ground', color: '#E0C068', Icon: Mountain },
  { id: '10', name: 'fairy', color: '#EE99AC', Icon: Sparkles },
  { id: '11', name: 'fighting', color: '#C03028', Icon: Swords },
  { id: '12', name: 'psychic', color: '#F85888', Icon: Brain },
  { id: '13', name: 'rock', color: '#B8A038', Icon: Hexagon },
  { id: '14', name: 'ghost', color: '#705898', Icon: Ghost },
  { id: '15', name: 'ice', color: '#98D8D8', Icon: Snowflake },
  { id: '16', name: 'dragon', color: '#7038F8', Icon: Crown },
  { id: '17', name: 'dark', color: '#705848', Icon: Moon },
  { id: '18', name: 'steel', color: '#B8B8D0', Icon: Shield },
];

export default function Types() {
  const router = useRouter();
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const renderTypeCard = ({ item }) => {
    // Extract the Icon component from the item
    const { Icon } = item;
    
    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        style={{ marginBottom: SPACING }}
        onPress={() => router.push({
          pathname: `/type/${item.name}`,
          params: { color: item.color }
        })}
      >
        <View style={[styles.card, { backgroundColor: item.color }]}>
          <View style={styles.cardBgCircle} />
          {/* Render the dynamic Lucide icon here */}
          <Icon size={44} color="rgba(255,255,255,0.3)" style={styles.bgIcon} />
          <Text style={styles.typeName}>{capitalize(item.name)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Types</Text>
        <Text style={styles.headerSubtitle}>Find Pokémon by element</Text>
      </View>

      <FlatList
        data={TYPES_DATA}
        renderItem={renderTypeCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: SPACING, paddingTop: 10, paddingBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#303943', marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: '#888', fontWeight: '500' },
  listContent: { paddingHorizontal: SPACING, paddingBottom: 20 },
  card: { width: CARD_WIDTH, height: 100, borderRadius: 15, padding: 15, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, justifyContent: 'center', alignItems: 'center' },
  cardBgCircle: { position: 'absolute', right: -20, bottom: -20, width: 90, height: 90, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)' },
  bgIcon: { position: 'absolute', left: 10, top: 10 },
  typeName: { fontSize: 20, fontWeight: 'bold', color: '#fff', zIndex: 1 },
});