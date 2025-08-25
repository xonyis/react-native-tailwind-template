import { BodyText } from '@/components/CustomText';
import { Search, X } from 'lucide-react-native';
import React from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  resultCount?: number;
  showResultCount?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Rechercher un client...',
  containerStyle,
  resultCount,
  showResultCount = false,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={onClear} style={styles.clearButton}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {showResultCount && value.length > 0 && (
        <View style={styles.resultContainer}>
          <BodyText style={styles.resultText}>
            {resultCount === 0 
              ? 'Aucun résultat trouvé' 
              : `${resultCount} client${resultCount > 1 ? 's' : ''} trouvé${resultCount > 1 ? 's' : ''}`
            }
          </BodyText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontFamily: 'DMSans_400Regular', // Utilise votre police personnalisée
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  resultContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});