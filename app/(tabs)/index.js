import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, Stack } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');
const SPACING = 16;
const CARD_WIDTH = (width - (SPACING * 3)) / 2;

const colorsByType = {
  grass: "#48D0B0", fire: "#FB6C6C", water: "#76BDFE", electric: "#FFD86F",
  poison: "#A040A0", normal: "#A8A878", bug: "#A8B820", flying: "#A890F0",
  ground: "#E0C068", fairy: "#EE99AC", fighting: "#C03028", psychic: "#F85888",
  rock: "#B8A038", ghost: "#705898", ice: "#98D8D8", dragon: "#7038F8",
  dark: "#705848", steel: "#B8B8D0",
};

// Cache Keys
const MASTER_LIST_KEY = 'POKEMON_MASTER_LIST';
const DETAILS_CACHE_KEY = 'POKEMON_DETAILS_CACHE';

export default function Index() {
  // 1. Master List (All 1300+ names/urls)
  const [masterList, setMasterList] = useState([]);

  // 2. Display Data (The full details for the Grid)
  const [displayedPokemon, setDisplayedPokemon] = useState([]);

  // 3. Search & Pagination State
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // 4. In-Memory Cache for details (to speed up searching locally)
  const detailsCache = useRef({});

  useEffect(() => {
    initializeData();
  }, []);

  // --- Search Effect ---
  // Debounce search to avoid freezing UI while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, masterList]);

  // --- 1. Initialize: Load Master List (Cache First -> API) ---
  async function initializeData() {
    try {
      setLoading(true);

      // Load Metadata Cache
      const cachedMaster = await AsyncStorage.getItem(MASTER_LIST_KEY);
      const cachedDetails = await AsyncStorage.getItem(DETAILS_CACHE_KEY);

      if (cachedDetails) {
        detailsCache.current = JSON.parse(cachedDetails);
      }

      if (cachedMaster) {
        const parsedList = JSON.parse(cachedMaster);
        setMasterList(parsedList);
        loadBatchDetails(parsedList.slice(0, 20)); // Load first 20 instantly
      } else {
        // First time fetch: Get ALL pokemon names (lightweight)
        const response = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=2000");
        const data = await response.json();
        setMasterList(data.results);
        AsyncStorage.setItem(MASTER_LIST_KEY, JSON.stringify(data.results));

        loadBatchDetails(data.results.slice(0, 20));
      }
    } catch (error) {
      console.error("Init Error:", error);
    } finally {
      setLoading(false);
    }
  }

  // --- 2. Helper: Fetch Details for a list of simple Pokemon objects ---
  async function loadBatchDetails(batch, isPagination = false) {
    const resolvedData = [];
    let newCacheEntries = false;

    // Use Promise.all to fetch concurrently
    await Promise.all(batch.map(async (item) => {
      // Check Cache
      if (detailsCache.current[item.name]) {
        resolvedData.push(detailsCache.current[item.name]);
        return;
      }

      // Fetch Network
      try {
        const res = await fetch(item.url);
        const details = await res.json();

        const refinedDetail = {
          name: item.name,
          image: details.sprites.other['official-artwork'].front_default || details.sprites.front_default,
          types: details.types,
          id: details.id,
        };

        // Update Cache
        detailsCache.current[item.name] = refinedDetail;
        resolvedData.push(refinedDetail);
        newCacheEntries = true;
      } catch (err) {
        console.error(`Error loading ${item.name}`);
      }
    }));

    // Sort by ID to keep order consistent (Promise.all can shuffle order)
    resolvedData.sort((a, b) => a.id - b.id);

    // Save Cache to Disk if we fetched new stuff
    if (newCacheEntries) {
      AsyncStorage.setItem(DETAILS_CACHE_KEY, JSON.stringify(detailsCache.current));
    }

    if (isPagination) {
      setDisplayedPokemon(prev => [...prev, ...resolvedData]);
    } else {
      setDisplayedPokemon(resolvedData);
    }
    setLoadingMore(false);
  }

  // --- 3. Handle Search ---
  function handleSearch(text) {
    if (!text) {
      // Reset to original pagination view
      if (masterList.length > 0) {
        // If we cleared search, just show the data we already have loaded or reset to first 20
        // To keep it simple, we reset to first 20 + offset
        const currentSlice = masterList.slice(0, offset + 20);
        // We reuse logic but don't re-fetch if cached
        loadBatchDetails(currentSlice, false);
      }
      return;
    }

    // Filter Master List (Global Search)
    const filtered = masterList.filter(p => p.name.includes(text.toLowerCase()));

    // Take top 20 results only to avoid massive fetch
    const topResults = filtered.slice(0, 20);

    // Load details for these specific search results
    loadBatchDetails(topResults, false);
  }

  // --- 4. Pagination (Infinite Scroll) ---
  const loadMore = () => {
    // Disable pagination during search
    if (search.length > 0) return;
    if (loadingMore || loading) return;

    setLoadingMore(true);
    const nextOffset = offset + 20;
    const nextBatch = masterList.slice(nextOffset, nextOffset + 20);

    if (nextBatch.length === 0) {
      setLoadingMore(false);
      return;
    }

    setOffset(nextOffset);
    loadBatchDetails(nextBatch, true);
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Render Card
  const renderCard = useCallback(({ item: pokemon }) => {
    const mainType = pokemon.types[0]?.type.name || 'normal';
    const cardColor = colorsByType[mainType] || "#A8A878";

    return (
      <Link href={{ pathname: `/details`, params: { name: pokemon.name } }} asChild>
        <TouchableOpacity activeOpacity={0.8} style={{ marginBottom: SPACING }}>
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <View style={styles.cardBgCircle} />
            <View style={styles.cardContent}>
              <Text style={styles.pokemonName}>{capitalize(pokemon.name)}</Text>
              <View style={styles.typeContainer}>
                {pokemon.types.map((t, i) => (
                  <View key={i} style={styles.typeBadge}>
                    <Text style={styles.typeText}>{capitalize(t.type.name)}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Image
              source={{ uri: pokemon.image }}
              style={styles.pokemonImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </Link>
    );
  }, []);

  return (
    <SafeAreaView edges={['top']}  style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pokédex</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search Pokémon..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#48D0B0" style={{ marginTop: 50 }} />
        ) : displayedPokemon.length === 0 ? (
          <View style={styles.centerMessage}>
            <Text style={{ color: '#888' }}>No Pokémon found.</Text>
          </View>
        ) : (
          <FlatList
            data={displayedPokemon}
            renderItem={renderCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={{ padding: 20 }}>
                  <ActivityIndicator size="small" color="#888" />
                </View>
              ) : <View style={{ height: 20 }} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: SPACING, paddingTop: 10, paddingBottom: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#303943', marginBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, fontSize: 16, color: '#333', height: '100%' },  
  centerMessage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: SPACING, paddingBottom: 40 },
  card: { width: CARD_WIDTH, height: 110, borderRadius: 15, padding: 12, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardBgCircle: { position: 'absolute', right: -15, bottom: -15, width: 90, height: 90, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)' },
  cardContent: { zIndex: 1 },
  pokemonName: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  typeContainer: { alignItems: 'flex-start', gap: 4 },
  typeBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  typeText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  pokemonImage: { width: 75, height: 75, position: 'absolute', bottom: 5, right: 5, zIndex: 2 },
});