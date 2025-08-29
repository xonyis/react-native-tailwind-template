import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
    BodyText,
    BoldCaption,
    BoldHeading1,
    BoldHeading2,
    BoldText,
    CustomText
} from './CustomText';

export function TextExamples() {
  return (
    <View style={styles.container}>
      {/* Méthode 1: Utiliser la prop bold */}
      <CustomText variant="body" bold={true} style={styles.example}>
        Texte en gras avec la prop bold
      </CustomText>
      
      {/* Méthode 2: Utiliser les composants spécialisés */}
      <BoldText style={styles.example}>
        Texte en gras avec BoldText
      </BoldText>
      
      {/* Méthode 3: Titres en gras */}
      <BoldHeading1 style={styles.example}>
        Titre H1 en gras
      </BoldHeading1>
      
      <BoldHeading2 style={styles.example}>
        Titre H2 en gras
      </BoldHeading2>
      
      {/* Méthode 4: Mélanger texte normal et gras */}
      <BodyText style={styles.example}>
        Texte normal avec <BoldText>partie en gras</BoldText> intégrée
      </BodyText>
      
      {/* Méthode 5: Caption en gras */}
      <BoldCaption style={styles.example}>
        Légende en gras
      </BoldCaption>
      
      {/* Méthode 6: Style inline (ancienne méthode) */}
      <BodyText style={styles.example}>
        Texte avec <CustomText style={{fontWeight: 'bold'}}>style inline</CustomText>
      </BodyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  example: {
    marginBottom: 8,
  },
});
