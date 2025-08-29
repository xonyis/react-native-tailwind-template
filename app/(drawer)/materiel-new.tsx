import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { useClientsList } from "@/hooks/useClientsList";
import { materielsApi } from "@/services/materielsApi";
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Package, Save } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

export default function MaterielNewScreen() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  const { clients, loading: clientsLoading } = useClientsList();
  
  const [saving, setSaving] = useState(false);
  const [showAchatDatePicker, setShowAchatDatePicker] = useState(false);
  const [selectedAchatDate, setSelectedAchatDate] = useState(new Date());
  const [tempSelectedAchatDate, setTempSelectedAchatDate] = useState(new Date());
  
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    reference: '',
    type_materiel: '',
    etat: '',
    date_achat: '',
    quantite_total: '1',
    client_id: null as number | null,
  });

  // Trouver le client sélectionné
  const selectedClient = clients.find(client => client.id === formData.client_id);

  // Options pour les sélecteurs
  const typeMaterielOptions = [
    'PC PORTABLE',
    'ORDINATEUR DE BUREAU',
    'ONDULEUR',
    'SWITCH',
    'BARETTE DE RAM',
    'TAMBOUR IMPRIMANTE',
    'TONER IMPRIMANTE',
    'CARTOUCHE',
    'IMPRIMANTE',
    'SCANNER',
    'SOURIS SANS FIL',
    'CLAVIER SANS FIL',
    'CLAVIER + SOURIS SANS FIL',
    'STOCKAGE SAN/NAS',
    'NAS',
    'HDD',
    'LECTEUR DVD',
    'SOLUTION DE SECURITE',
    'BARRE DE SON',
    'ENSEMBLE CLAVIER ET SOURIS',
    'ECRAN LED',
    'ECRAN LCD',
    'SSD',
    'CHANGEMENT DE DALLE',
    'SUPPORT ECRAN PC',
    'WEBCAM',
    'TV',
    'CABLE',
    'ADAPTEUR',
    'BRAS ECRAN',
    'TABLET A STYLET',
    'COMUTATEUR',
    'BORNE WIFI',
    'CASQUE AUDIO',
    'ACCESSOIRES'
  ];
  const etatOptions = ['Neuf', 'Excellent', 'Bon', 'Moyen', 'Mauvais', 'Défectueux'];

  const handleGoBack = () => {
    router.push("/(drawer)/materiel");
  };

  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatDateForAPI = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };

  const handleSave = async () => {
    if (!token) return;

    // Validation simple
    if (!formData.nom.trim() || !formData.reference.trim() || !formData.type_materiel.trim()) {
      Alert.alert("Erreur", "Le nom, la référence et le type sont obligatoires");
      return;
    }

    if (!formData.client_id) {
      Alert.alert("Erreur", "Veuillez sélectionner un client");
      return;
    }

    const quantite = parseInt(formData.quantite_total);
    if (isNaN(quantite) || quantite < 1) {
      Alert.alert("Erreur", "La quantité doit être un nombre positif");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const createData = {
        nom: formData.nom.trim(),
        reference: formData.reference.trim(),
        type_materiel: formData.type_materiel.trim(),
        etat: formData.etat.trim(),
        date_achat: formatDateForAPI(formData.date_achat),
        quantite_total: quantite,
        client_id: formData.client_id,
      } as any; // Type assertion pour contourner le problème de type

      console.log('Données envoyées à l\'API:', createData);
      
      const newMateriel = await materielsApi.createMateriel(createData, token);
      
      Alert.alert(
        "Succès", 
        "Matériel créé avec succès",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/(drawer)/materiel-detail?id=${newMateriel.id}`)
          }
        ]
      );
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      const message = err instanceof Error ? err.message : "Erreur lors de la création";
      Alert.alert("Erreur", message);
    } finally {
      setSaving(false);
    }
  };

  const handleAchatDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowAchatDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedAchatDate(selectedDate);
      } else {
        setSelectedAchatDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          date_achat: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleConfirmAchatDate = () => {
    setSelectedAchatDate(tempSelectedAchatDate);
    setFormData(prev => ({
      ...prev,
      date_achat: tempSelectedAchatDate.toISOString().split('T')[0]
    }));
    setShowAchatDatePicker(false);
  };

  const handleCancelAchatDate = () => {
    setTempSelectedAchatDate(selectedAchatDate);
    setShowAchatDatePicker(false);
  };

  const handleSelectClient = () => {
    if (clientsLoading) {
      Alert.alert('Chargement', 'Veuillez attendre le chargement des clients');
      return;
    }

    if (clients.length === 0) {
      Alert.alert('Aucun client', 'Aucun client disponible');
      return;
    }

    Alert.alert(
      'Sélectionner un client',
      'Choisissez un client dans la liste',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        ...clients.map(client => ({
          text: client.nom,
          onPress: () => {
            setFormData(prev => ({
              ...prev,
              client_id: client.id
            }));
          },
        }))
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Nouveau matériel</Heading2>
        <Pressable onPress={handleSave} style={styles.saveButton} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Save size={20} color="#fff" />
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Informations du matériel */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Informations du matériel</Heading2>
            
            {/* Client */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Client *</Caption>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={styles.pickerButton}
                  onPress={handleSelectClient}
                  disabled={clientsLoading}
                >
                  <BodyText style={styles.pickerText}>
                    {clientsLoading 
                      ? 'Chargement des clients...' 
                      : selectedClient 
                        ? selectedClient.nom
                        : 'Sélectionner un client'
                    }
                  </BodyText>
                </Pressable>
              </View>
            </View>

            {/* Nom */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Nom *</Caption>
              <View style={styles.inputContainer}>
                <Package size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.nom}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, nom: text }))}
                  placeholder="Saisir le nom"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Référence */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Référence *</Caption>
              <View style={styles.inputContainer}>
                <Package size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.reference}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, reference: text }))}
                  placeholder="Saisir la référence"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Type de matériel */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Type de matériel *</Caption>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={styles.pickerButton}
                  onPress={() => {
                    Alert.alert(
                      'Type de matériel',
                      'Sélectionnez le type de matériel',
                      typeMaterielOptions.map(option => ({
                        text: option,
                        onPress: () => setFormData(prev => ({ ...prev, type_materiel: option }))
                      }))
                    );
                  }}
                >
                  <BodyText style={styles.pickerText}>
                    {formData.type_materiel || 'Sélectionner un type'}
                  </BodyText>
                </Pressable>
              </View>
            </View>

            {/* État */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>État</Caption>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={styles.pickerButton}
                  onPress={() => {
                    Alert.alert(
                      'État',
                      'Sélectionnez l\'état du matériel',
                      [
                        {
                          text: 'Annuler',
                          style: 'cancel',
                        },
                        ...etatOptions.map(option => ({
                          text: option,
                          onPress: () => setFormData(prev => ({ ...prev, etat: option }))
                        })),
                        {
                          text: 'Effacer',
                          style: 'destructive',
                          onPress: () => setFormData(prev => ({ ...prev, etat: '' }))
                        }
                      ]
                    );
                  }}
                >
                  <BodyText style={styles.pickerText}>
                    {formData.etat || 'Sélectionner un état'}
                  </BodyText>
                </Pressable>
              </View>
            </View>

            {/* Date d'achat */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date d'achat</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedAchatDate(selectedAchatDate);
                  setShowAchatDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.date_achat ? formatDateForDisplay(formData.date_achat) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Quantité totale */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Quantité totale</Caption>
              <View style={styles.inputContainer}>
                <Package size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.quantite_total}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, quantite_total: text }))}
                  placeholder="1"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Espace en bas */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal pour le sélecteur de date d'achat */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showAchatDatePicker}
          onRequestClose={() => setShowAchatDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelAchatDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date d'achat</BodyText>
                <Pressable 
                  onPress={handleConfirmAchatDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedAchatDate}
                  mode="date"
                  display="spinner"
                  onChange={handleAchatDateChange}
                  maximumDate={new Date(2100, 11, 31)}
                  minimumDate={new Date(1900, 0, 1)}
                  themeVariant="light"
                  textColor="#000"  
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        showAchatDatePicker && (
          <DateTimePicker
            value={selectedAchatDate}
            mode="date"
            display="default"
            onChange={handleAchatDateChange}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}

      <FAB onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#1f2937",
  },
  saveButton: {
    backgroundColor: "#2563eb",
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionTitle: {
    color: "#374151",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#6b7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
    gap: 12,
  },
  textInput: {
    color: "#374151",
    fontSize: 16,
    flex: 1,
    padding: 0,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  pickerButton: {
    padding: 12,
  },
  pickerText: {
    color: "#374151",
    fontSize: 16,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
    gap: 12,
  },
  dateText: {
    color: "#374151",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalButtonContainer: {
    minWidth: 60,
  },
  modalButton: {
    color: '#2563eb',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalTitle: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
});
