import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
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

export default function TypeDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const typeName = params.name || "";
  const typeColor = params.color || "#48D0B0";

  const [typeList, setTypeList] = useState([]);
  const [displayedPokemon, setDisplayedPokemon] = useState([]);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const detailsCache = useRef({});

  useEffect(() => {
    if (typeName) {
      fetchTypePokemon();
    }
  }, [typeName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, typeList]);

  async function fetchTypePokemon() {
    try {
      setLoading(true);
      
      const cachedDetails = await AsyncStorage.getItem('POKEMON_DETAILS_CACHE');
      if (cachedDetails) detailsCache.current = JSON.parse(cachedDetails);

      const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName.toLowerCase()}`);
      const data = await response.json();
      
      // The Type API returns a nested structure: data.pokemon = [{ pokemon: { name, url } }]
      // We map it to be a flat array of { name, url } to match our existing logic
      const flattenedList = data.pokemon.map(p => p.pokemon);
      
      setTypeList(flattenedList);
      loadBatchDetails(flattenedList.slice(0, 20)); 
    } catch (error) {
      console.error("Type Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadBatchDetails(batch, isPagination = false) {
    const resolvedData = [];
    let newCacheEntries = false;

    await Promise.all(batch.map(async (item) => {
      if (detailsCache.current[item.name]) {
        resolvedData.push(detailsCache.current[item.name]);
        return;
      }

      try {
        const res = await fetch(item.url);
        const details = await res.json();

        const refinedDetail = {
          name: item.name,
          image: details.sprites.other['official-artwork'].front_default || details.sprites.front_default,
          types: details.types,
          id: details.id,
        };

        detailsCache.current[item.name] = refinedDetail;
        resolvedData.push(refinedDetail);
        newCacheEntries = true;
      } catch (err) {
        console.error(`Error loading ${item.name}`);
      }
    }));

    resolvedData.sort((a, b) => a.id - b.id);

    if (newCacheEntries) {
      AsyncStorage.setItem('POKEMON_DETAILS_CACHE', JSON.stringify(detailsCache.current));
    }

    if (isPagination) {
      setDisplayedPokemon(prev => [...prev, ...resolvedData]);
    } else {
      setDisplayedPokemon(resolvedData);
    }
    setLoadingMore(false);
  }

  function handleSearch(text) {
    if (!text) {
      if (typeList.length > 0) {
        const currentSlice = typeList.slice(0, offset + 20);
        loadBatchDetails(currentSlice, false);
      }
      return;
    }

    const filtered = typeList.filter(p => p.name.includes(text.toLowerCase()));
    const topResults = filtered.slice(0, 20);
    loadBatchDetails(topResults, false);
  }

  const loadMore = () => {
    if (search.length > 0) return;
    if (loadingMore || loading) return;

    setLoadingMore(true);
    const nextOffset = offset + 20;
    const nextBatch = typeList.slice(nextOffset, nextOffset + 20);

    if (nextBatch.length === 0) {
      setLoadingMore(false);
      return;
    }

    setOffset(nextOffset);
    loadBatchDetails(nextBatch, true);
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const formatId = (id) => `#${id.toString().padStart(3, '0')}`;

  const renderCard = useCallback(({ item: pokemon }) => {
    const mainType = pokemon.types[0]?.type.name || 'normal';
    const cardColor = colorsByType[mainType] || "#A8A878";

    return (
      <Link href={{ pathname: `/details`, params: { name: pokemon.name } }} asChild>
        <TouchableOpacity activeOpacity={0.8} style={{ marginBottom: SPACING }}>
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <Text style={styles.bgIdText}>{formatId(pokemon.id)}</Text>
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
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={[styles.header, { backgroundColor: typeColor }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{capitalize(typeName)} Type</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            placeholder={`Search ${capitalize(typeName)} Pokémon...`}
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color={typeColor} style={{ marginTop: 50 }} />
        ) : displayedPokemon.length === 0 ? (
          <View style={styles.centerMessage}>
            <Text style={{ color: '#888' }}>No Pokémon found for this type.</Text>
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
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { 
    paddingHorizontal: SPACING, 
    paddingTop: 10, 
    paddingBottom: 25, 
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, height: 45, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  searchInput: { flex: 1, fontSize: 16, color: '#333', height: '100%' },
  centerMessage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: SPACING, paddingBottom: 40 },
  card: { width: CARD_WIDTH, height: 110, borderRadius: 15, padding: 12, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardBgCircle: { position: 'absolute', right: -15, bottom: -15, width: 90, height: 90, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)' },
  bgIdText: { position: 'absolute', right: 10, top: 5, fontSize: 28, fontWeight: 'bold', color: 'rgba(255,255,255,0.25)', zIndex: 0 },
  cardContent: { zIndex: 1 },
  pokemonName: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  typeContainer: { alignItems: 'flex-start', gap: 4 },
  typeBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  typeText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  pokemonImage: { width: 75, height: 75, position: 'absolute', bottom: 5, right: 5, zIndex: 2 },
});