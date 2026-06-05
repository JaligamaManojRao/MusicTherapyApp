import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchMusic } from '../services/api';

const CATEGORIES = [
  { id: '1', name: 'Calm', query: 'calm meditation' },
  { id: '2', name: 'Deep Sleep', query: 'deep sleep ambient' },
  { id: '3', name: 'Stress Relief', query: 'stress relief music' },
  { id: '4', name: 'Nature', query: 'nature sounds' },
  { id: '5', name: 'Instrumental', query: 'instrumental therapy' },
];

import { useTheme } from '../ThemeContext';

export default function MusicLibraryScreen() {
  const { colors } = useTheme();
  
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('1');

  const performSearch = async (searchQuery, isFeatured = false) => {
    if(!searchQuery) return;
    if (!isFeatured) setLoading(true);
    try {
      const data = await searchMusic(searchQuery, 50);
      setTracks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    console.log("Loading initial music data...");
    try {
      const [res1, res2] = await Promise.all([
        searchMusic('calm', 20),
        searchMusic('relax', 20)
      ]);
      const validRes1 = Array.isArray(res1) ? res1 : [];
      const validRes2 = Array.isArray(res2) ? res2 : [];
      console.log(`Loaded ${validRes1.length} featured and ${validRes2.length} extra tracks`);
      setTracks([...validRes1, ...validRes2]);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleCategoryPress = (category) => {
    setSelectedCategory(category.id);
    performSearch(category.query);
  };

  const renderTrackItem = ({ item }) => (
    <View style={[styles.trackCard, { backgroundColor: colors.card }]}>
      <Image source={{ uri: item.album_art_url || 'https://via.placeholder.com/100' }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.cardArtist, { color: colors.textSecondary }]} numberOfLines={1}>{item.artist}</Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.cardDuration, { color: colors.textSecondary }]}>{Math.floor(item.duration/60)}:{(item.duration%60).toString().padStart(2, '0')}</Text>
          <Ionicons name="play-circle" size={24} color={colors.primary} />
        </View>
      </View>
    </View>
  );



  const renderHeader = () => (
    <View>
      {/* Categories */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.categoryBtn, 
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedCategory === cat.id && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleCategoryPress(cat)}
            >
              <Text style={[
                styles.categoryText, 
                { color: colors.textSecondary },
                selectedCategory === cat.id && { color: '#fff' }
              ]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Explore Library Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore Library ({tracks.length} tracks)</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput 
          style={[styles.searchInput, { color: colors.text }]} 
          placeholder="Search therapeutic music..." 
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => performSearch(query)}
        />
      </View>

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.spotify_track_id}
        renderItem={renderTrackItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tracks found or connection error.</Text>
              <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={loadInitialData}>
                <Text style={styles.retryText}>Retry Loading Music</Text>
              </TouchableOpacity>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { flexDirection: 'row', margin: 15, borderRadius: 10, alignItems: 'center', paddingHorizontal: 15, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  
  categoryContainer: { marginBottom: 20 },
  categoryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1 },
  categoryText: { fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginBottom: 15, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAll: { fontSize: 14, fontWeight: '600' },

  featuredCard: { width: 140, marginRight: 15, borderRadius: 12, padding: 8, elevation: 1 },
  featuredImage: { width: '100%', height: 120, borderRadius: 10 },
  featuredTitle: { fontSize: 13, fontWeight: '600', marginTop: 8, textAlign: 'center' },

  row: { justifyContent: 'space-between', paddingHorizontal: 5 },
  trackCard: { width: '48%', borderRadius: 12, marginBottom: 15, elevation: 2, overflow: 'hidden' },
  cardImage: { width: '100%', height: 120 },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: 'bold' },
  cardArtist: { fontSize: 12, marginTop: 2, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDuration: { fontSize: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 50, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, marginTop: 15, textAlign: 'center' },
  retryBtn: { marginTop: 20, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25 },
  retryText: { color: '#fff', fontWeight: 'bold' }
});
