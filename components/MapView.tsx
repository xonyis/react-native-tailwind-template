import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { BodyText } from './CustomText';

interface MapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  height?: number;
  zoom?: number;
  clientType?: string | null;
}

// const { width } = Dimensions.get('window');

export const CustomMapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  title = 'Client',
  description = 'Localisation du client',
  height = 200,
  zoom = 15,
  clientType = null,
}) => {
  const [pinDataUri, setPinDataUri] = useState<string>('');
  
  // Détermine l'image du pin selon le type de client
  const isMaintenanceClient = clientType?.toLowerCase() === 'maintenance';
  
  useEffect(() => {
    // Créer un SVG personnalisé qui ressemble à vos pins
    const pinColor = isMaintenanceClient ? '#FF6B6B' : '#3D9FCD';
    const svgPin = `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C11.03 2 7 6.03 7 11c0 5.25 9 19 9 19s9-13.75 9-19c0-4.97-4.03-9-9-9z" 
              fill="${pinColor}" stroke="white" stroke-width="1"/>
        <circle cx="16" cy="11" r="4" fill="white"/>
      </svg>
    `)}`;
    setPinDataUri(svgPin);
  }, [isMaintenanceClient]);
  
  // HTML pour la carte Leaflet
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialiser la carte
        var map = L.map('map').setView([${latitude}, ${longitude}], ${zoom});
        
        // Ajouter les tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Créer l'icône personnalisée avec votre image
        var customIcon = L.icon({
          iconUrl: '${pinDataUri}',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        
        // Ajouter le marqueur
        L.marker([${latitude}, ${longitude}], {icon: customIcon})
          .addTo(map)
          .bindPopup('${title}<br/>${description}');
          
        // Désactiver le zoom par double-clic si nécessaire
        map.doubleClickZoom.disable();
      </script>
    </body>
    </html>
  `;

  // Ne rendre la carte que quand le pin est prêt
  if (!pinDataUri) {
    return (
      <View style={[styles.container, styles.loadingContainer, { height }]}>
        <BodyText style={styles.loadingText}>Chargement de la carte...</BodyText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        style={styles.map}
        originWhitelist={['*']}
        source={{ html: leafletHTML }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Overlay avec les coordonnées */}
      <View style={styles.coordsOverlay}>
        <BodyText style={styles.coordsText}>
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </BodyText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  map: {
    flex: 1,
  },
  coordsOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coordsText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
