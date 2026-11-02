# ⚡ PokeDex - React Native & Expo Mobile App

[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Expo Router](https://img.shields.io/badge/Router-Expo_Router_v6-4630EB)](https://docs.expo.dev/router/introduction/)
[![PokéAPI](https://img.shields.io/badge/API-PokéAPI_v2-EF5350?logo=pokemon&logoColor=white)](https://pokeapi.co/)

A sleek, responsive, and feature-rich Pokédex mobile application built with **React Native** and **Expo**. 

> 💡 **Project Background:**  
> This project was developed as a hands-on side project to learn and master modern **React Native** development, file-based routing with **Expo Router**, asynchronous data management, offline caching strategies, and fluid mobile UI/UX design.

---

## 📱 Features

- **🔴 Complete Pokédex Explorer**
  - Browse 1,300+ Pokémon from Generation I through Generation IX.
  - Smooth infinite scroll pagination loading 20 Pokémon per batch.
  - High-resolution official artwork sprites.
  - Dynamic type-based color themes for every card.

- **⚡ Instant Real-Time Search**
  - Debounced search input (300ms) for snappy, stutter-free filtering.
  - Search seamlessly by Pokémon name or Pokédex number (`#ID`).

- **📊 Comprehensive Pokémon Detail Pages**
  - **About:** Pokédex flavor text, height, weight, abilities, and base experience.
  - **Base Stats:** Clean animated-style stat progress meters (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed) with total stat calculation.
  - **Evolution Chain:** Recursive evolution tree parser showing species stages, level requirements, and sprites.

- **🗺️ Regions & Generations Browser**
  - Filter by region across all 9 generations:
    - **Kanto** (Gen I) · **Johto** (Gen II) · **Hoenn** (Gen III) · **Sinnoh** (Gen IV)
    - **Unova** (Gen V) · **Kalos** (Gen VI) · **Alola** (Gen VII) · **Galar** (Gen VIII) · **Paldea** (Gen IX)
  - Region card previews featuring iconic starter trio sprites.
  - Dedicated region screens with localized search and pagination.

- **🔥 Elemental Type Directory**
  - Browse all 18 Pokémon types (Grass, Fire, Water, Electric, Dragon, Fairy, Ghost, etc.).
  - Customized typography and icons powered by `lucide-react-native`.
  - Type-specific Pokémon listings with infinite scroll.

- **💾 Dual-Layer Caching (Fast & Offline Friendly)**
  - **In-Memory Cache (`useRef`):** Near-instantaneous lookups during the active session.
  - **Persistent Cache (`AsyncStorage`):** Stores master lists and loaded profiles locally to minimize network round-trips and optimize performance on mobile data.

---

## 🛠️ Tech Stack & Libraries

| Category | Technology |
|---|---|
| **Core Framework** | [React Native](https://reactnative.dev/) (v0.81.5), [React](https://react.dev/) (v19) |
| **Tooling & Platform** | [Expo](https://expo.dev/) (SDK 54, New Architecture enabled) |
| **Navigation** | [Expo Router](https://docs.expo.dev/router/introduction/) v6 (File-based navigation & tab layout) |
| **Icons & Media** | [@expo/vector-icons](https://icons.expo.fyi/) (Ionicons), [lucide-react-native](https://lucide.dev/), [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) |
| **Storage & Persistence** | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) |
| **UI & Layout** | `react-native-safe-area-context`, `react-native-screens`, `react-native-reanimated` |
| **API** | [PokéAPI v2](https://pokeapi.co/) REST API |

---

## 📂 Project Structure

```text
PokemonApp/
├── app/
│   ├── _layout.js             # Root stack navigator configuration
│   ├── details.js             # Full Pokémon profile (About, Stats, Evolution)
│   ├── (tabs)/                # Bottom tab bar navigation
│   │   ├── _layout.js         # Tab bar layout & styling
│   │   ├── index.js           # Main Pokédex grid & search view
│   │   ├── regions.js         # Region selection view (Gen 1-9)
│   │   └── types.js           # Elemental types directory
│   ├── region/
│   │   └── [id].js            # Dynamic route for regional Pokémon list
│   └── type/
│       └── [name].js          # Dynamic route for type-filtered Pokémon list
├── assets/                    # App icons, splash screens, and images
├── app.json                   # Expo application manifest
├── package.json               # Dependencies and npm scripts
└── README.md
```

---

## 🧠 Key Learnings from this Project

Building this project helped cement essential React Native concepts:

1. **Modern Routing with Expo Router:**
   - Utilizing directory-based routing (`(tabs)` group, nested stacks, dynamic parameters like `[id].js` and `[name].js`).
2. **Handling REST APIs & Nested Data:**
   - Managing asynchronous requests across multiple PokéAPI endpoints (`pokemon`, `pokemon-species`, and `evolution-chain`).
   - Parsing recursive tree structures for evolution stages.
3. **Performance Optimization:**
   - Managing large datasets (1,300+ items) using `FlatList` with `windowSize`, `maxToRenderPerBatch`, and `initialNumToRender`.
   - Applying debounced inputs to prevent re-filtering on every keystroke.
   - Dual-tier caching (`useRef` memory cache + `AsyncStorage`) to avoid redundant API queries.
4. **Mobile Layouts & Cross-Platform UX:**
   - Handling safe area insets on modern notched and edge-to-edge screens (`SafeAreaView`).
   - Platform-specific adjustments (`Platform.OS`) for tab bar heights and status bars.
   - Dynamic design styling based on Pokémon elemental color palettes.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your development machine:
- [Node.js](https://nodejs.org/) (v18.x or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on your iOS or Android device (or an emulator/simulator)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SridharPlays/PokemonApp.git
   cd PokemonApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on your device or emulator:**
   - **Mobile (Physical Device):** Scan the generated QR code using the **Expo Go** app (Android) or the default Camera app (iOS).
   - **Android Emulator:** Press `a` in the terminal.
   - **iOS Simulator:** Press `i` in the terminal (macOS required).
   - **Web:** Press `w` in the terminal.

---

## 🔮 Future Enhancements / Roadmap

- [ ] Add sound effects & official Pokémon cry audio (`cries.latest`).
- [ ] Implement Favorites / Bookmarks saved to `AsyncStorage`.
- [ ] Add shiny sprite toggle in the details view.
- [ ] Add moves, abilities detail modal, and egg group information.
- [ ] Team Builder feature to simulate 6-Pokémon team compositions with type effectiveness analysis.

---

## 📄 License & Usage

This project was created for personal learning and educational purposes. Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and GAME FREAK Inc.

---

## 🙏 Acknowledgements

- Data provided by the incredible [PokéAPI](https://pokeapi.co/).
- Pokémon, Pokémon character names, and trademarks are property of Nintendo, Creatures Inc., and GAME FREAK Inc.

