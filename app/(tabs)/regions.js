import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Added startId and endId to fetch the exact generation slice
const REGIONS = [
  { id: '1', name: 'Kanto', gen: 'Generation I', color: '#FB6C6C', starters: [1, 4, 7], startId: 1, endId: 151 },
  { id: '2', name: 'Johto', gen: 'Generation II', color: '#FFD86F', starters: [152, 155, 158], startId: 152, endId: 251 },
  { id: '3', name: 'Hoenn', gen: 'Generation III', color: '#48D0B0', starters: [252, 255, 258], startId: 252, endId: 386 },
  { id: '4', name: 'Sinnoh', gen: 'Generation IV', color: '#76BDFE', starters: [387, 390, 393], startId: 387, endId: 493 },
  { id: '5', name: 'Unova', gen: 'Generation V', color: '#A040A0', starters: [495, 498, 501], startId: 494, endId: 649 },
  { id: '6', name: 'Kalos', gen: 'Generation VI', color: '#A890F0', starters: [650, 653, 656], startId: 650, endId: 721 },
  { id: '7', name: 'Alola', gen: 'Generation VII', color: '#E0C068', starters: [722, 725, 728], startId: 722, endId: 809 },
  { id: '8', name: 'Galar', gen: 'Generation VIII', color: '#C03028', starters: [810, 813, 816], startId: 810, endId: 905 },
  { id: '9', name: 'Paldea', gen: 'Generation IX', color: '#EE99AC', starters: [906, 909, 912], startId: 906, endId: 1025 }
];

export default function Regions() {
  const router = useRouter();

  const renderRegionCard = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.cardWrapper}
        onPress={() => router.push({
          pathname: `/region/${item.id}`,
          params: { name: item.name, startId: item.startId, endId: item.endId, color: item.color }
        })}
      >
        <View style={[styles.card, { backgroundColor: item.color }]}>
          <View style={styles.cardBgCircle} />

          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.regionName}>{item.name}</Text>
              <Text style={styles.regionGen}>{item.gen}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
          </View>

          <View style={styles.startersContainer}>
            {item.starters.map((starterId, index) => (
              <View key={starterId} style={[{ zIndex: 3 - index }]}>
                <Image
                  source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${starterId}.png` }}
                  style={styles.starterImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Regions</Text>
        <Text style={styles.headerSubtitle}>Explore the Pokémon world</Text>
      </View>

      <FlatList
        data={REGIONS}
        renderItem={renderRegionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#303943', marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: '#888', fontWeight: '500' },
  listContent: { paddingHorizontal: 24, paddingBottom: 20 },

  cardWrapper: { marginBottom: 20 },
  card: {
    borderRadius: 20,
    padding: 20,
    minHeight: 140,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    justifyContent: 'space-between'
  },
  cardBgCircle: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.15)'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10
  },
  regionName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  regionGen: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 2 },

  startersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10
  },
  starterImage: {
    width: 80,
    height: 80,
  }
});