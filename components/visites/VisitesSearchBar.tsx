import { Search } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

interface VisitesSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export function VisitesSearchBar({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Rechercher..." 
}: VisitesSearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={() => onSearchChange('')}
          >
            <View style={styles.clearIcon}>
              <View style={styles.clearLine1} />
              <View style={styles.clearLine2} />
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',

  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  clearLine1: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: '#9ca3af',
    transform: [{ rotate: '45deg' }],
    top: 7,
  },
  clearLine2: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: '#9ca3af',
    transform: [{ rotate: '-45deg' }],
    top: 7,
  },
});
