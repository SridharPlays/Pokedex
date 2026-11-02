import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colorsByType = {
  normal: "#A8A878", fire: "#FB6C6C", water: "#76BDFE", electric: "#FFD86F",
  grass: "#48D0B0", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC"
};

export default function Details() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Data State
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolutions, setEvolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState('About');

  useEffect(() => {
    if (params.name) loadFullProfile(params.name);
  }, [params.name]);

  async function loadFullProfile(name) {
    setLoading(true);
    try {
      const pRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const pData = await pRes.json();
      setPokemon(pData);

      const sRes = await fetch(pData.species.url);
      const sData = await sRes.json();
      setSpecies(sData);

      if (sData.evolution_chain?.url) {
        const eRes = await fetch(sData.evolution_chain.url);
        const eData = await eRes.json();
        const chain = parseEvolutionChain(eData.chain);
        setEvolutions(chain);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }

  function parseEvolutionChain(chain) {
    const evoChain = [];
    let currentData = chain;

    while (currentData && currentData.hasOwnProperty('species')) {
      const id = currentData.species.url.split('/')[6];
      evoChain.push({
        species_name: currentData.species.name,
        min_level: currentData.evolution_details?.[0]?.min_level || null,
        image_url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
      });

      currentData = currentData.evolves_to[0];
    }
    return evoChain;
  }

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const formatId = (id) => `#${id.toString().padStart(3, '0')}`;

  const cleanFlavorText = (text) => text.replace(/\f/g, ' ').replace(/\n/g, ' ');

  if (loading || !pokemon) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  const mainType = pokemon.types[0].type.name;
  const color = colorsByType[mainType] || "#A8A878";
  const imageUri = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={color} />

      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={20}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="heart-outline" size={28} color="#fff" />
        </View>

        {/* Info Header */}
        <View style={styles.headerInfo}>
          <View>
            <Text style={styles.pokemonName}>{capitalize(pokemon.name)}</Text>
            <View style={styles.typeRow}>
              {pokemon.types.map((t) => (
                <View key={t.type.name} style={styles.typeBadge}>
                  <Text style={styles.typeText}>{capitalize(t.type.name)}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={styles.pokemonId}>{formatId(pokemon.id)}</Text>
        </View>

        {/* Floating Image */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUri }} style={styles.pokemonImage} contentFit="contain" />
        </View>
      </SafeAreaView>

      {/* White Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Tabs */}
        <View style={styles.tabRow}>
          {['About', 'Stats', 'Evolution'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={styles.tabButton}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentArea}>

          {activeTab === 'About' && (
            <View style={styles.aboutContainer}>
              {/* Flavor Text (Description) */}
              {species?.flavor_text_entries && (
                <Text style={styles.flavorText}>
                  {cleanFlavorText(
                    species.flavor_text_entries.find((entry) => entry.language.name === 'en')?.flavor_text || ""
                  )}
                </Text>
              )}

              {/* Height / Weight Card */}
              <View style={styles.measurementsCard}>
                <View style={styles.measureItem}>
                  <Text style={styles.measureLabel}>Height</Text>
                  <Text style={styles.measureValue}>{(pokemon.height / 10).toFixed(1)} m</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.measureItem}>
                  <Text style={styles.measureLabel}>Weight</Text>
                  <Text style={styles.measureValue}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
                </View>
              </View>

              <Text style={styles.sectionHeader}>Abilities</Text>
              <View style={styles.abilitiesRow}>
                {pokemon.abilities.map((a) => (
                  <View key={a.ability.name} style={styles.abilityBadge}>
                    <Text style={styles.abilityText}>{capitalize(a.ability.name)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'Stats' && (
            <View>
              {pokemon.stats.map((stat) => {
                const progress = stat.base_stat / 100;
                const statColor = stat.base_stat >= 50 ? "#4CAF50" : "#FB6C6C";
                const label = stat.stat.name === 'special-attack' ? 'Sp. Atk' :
                  stat.stat.name === 'special-defense' ? 'Sp. Def' :
                    stat.stat.name === 'hp' ? 'HP' : capitalize(stat.stat.name);

                return (
                  <View key={stat.stat.name} style={styles.statRow}>
                    <Text style={styles.statLabel}>{label}</Text>
                    <Text style={styles.statValue}>{stat.base_stat}</Text>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: statColor }]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {activeTab === 'Evolution' && (
            <View style={styles.evolutionContainer}>
              {evolutions.length > 0 ? (
                evolutions.map((evo, index) => (
                  <View key={index} style={styles.evoRow}>
                    {/* Current Stage */}
                    <View style={styles.evoNode}>
                      <Image source={{ uri: evo.image_url }} style={styles.evoImage} />
                      <Text style={styles.evoName}>{capitalize(evo.species_name)}</Text>
                    </View>

                    {index < evolutions.length - 1 && (
                      <View style={styles.evoArrowContainer}>
                        <Ionicons name="arrow-forward" size={24} color="#ddd" />
                        {evolutions[index + 1].min_level && (
                          <Text style={styles.evoLevelText}>Lvl {evolutions[index + 1].min_level}</Text>
                        )}
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Evolution data not available.</Text>
              )}
            </View>
          )}

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  safeArea: { zIndex: 2 },

  headerBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 24, marginBottom: 24, marginTop: Platform.OS === 'android' ? 10 : 0
  },
  headerInfo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24
  },
  pokemonName: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  pokemonId: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
  },
  typeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  imageWrapper: {
    alignItems: 'center', zIndex: 10, marginBottom: -50,
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 10,
  },
  pokemonImage: { width: 220, height: 220 },

  bottomSheet: {
    flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingTop: 60, paddingHorizontal: 24,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row', justifyContent: 'space-around', marginBottom: 25,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  tabButton: { paddingBottom: 14, paddingHorizontal: 10 },
  tabText: { fontSize: 15, color: '#aaa', fontWeight: '600' },
  activeTabText: { color: '#333' },
  activeTabIndicator: {
    position: 'absolute', bottom: -1, left: 0, right: 0,
    height: 2, backgroundColor: '#6C79DB'
  },

  contentArea: { paddingBottom: 40 },

  // Stats Styles
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  statLabel: { width: 60, fontSize: 14, color: '#888', fontWeight: '600' },
  statValue: { width: 35, fontSize: 14, color: '#333', fontWeight: 'bold', textAlign: 'right', marginRight: 15 },
  progressBarBackground: { flex: 1, height: 4, backgroundColor: '#f0f0f0', borderRadius: 2 },
  progressBarFill: { height: 4, borderRadius: 2 },

  // About Styles
  aboutContainer: { gap: 20 },
  flavorText: { fontSize: 15, color: '#666', lineHeight: 22 },
  measurementsCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 20,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    marginBottom: 10
  },
  measureItem: { flex: 1, alignItems: 'center', gap: 5 },
  divider: { width: 1, backgroundColor: '#ddd', marginHorizontal: 10 },
  measureLabel: { color: '#aaa', fontSize: 12 },
  measureValue: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  abilitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  abilityBadge: { backgroundColor: '#f5f5f5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  abilityText: { color: '#555', fontSize: 14 },

  // Evolution Styles
  evolutionContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
  evoRow: { flexDirection: 'row', alignItems: 'center' },
  evoNode: { alignItems: 'center', gap: 5 },
  evoImage: { width: 80, height: 80 },
  evoName: { fontSize: 14, fontWeight: '600', color: '#555' },
  evoArrowContainer: { paddingHorizontal: 10, alignItems: 'center', gap: 2 },
  evoLevelText: { fontSize: 10, color: '#aaa', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 20 },
});