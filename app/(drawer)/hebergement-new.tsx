import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { servicesWebApi } from "@/services/servicesWebApi";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Save } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";

export default function HebergementNewScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { token } = useAuth();

  const [saving, setSaving] = useState(false);
  const [showRenouvellementDatePicker, setShowRenouvellementDatePicker] = useState(false);
  const [showRappelDatePicker, setShowRappelDatePicker] = useState(false);
  const [showCreationDatePicker, setShowCreationDatePicker] = useState(false);
  const [selectedRenouvellementDate, setSelectedRenouvellementDate] = useState(new Date());
  const [selectedRappelDate, setSelectedRappelDate] = useState(new Date());
  const [selectedCreationDate, setSelectedCreationDate] = useState(new Date());
  const [tempSelectedRenouvellementDate, setTempSelectedRenouvellementDate] = useState(new Date());
  const [tempSelectedRappelDate, setTempSelectedRappelDate] = useState(new Date());
  const [tempSelectedCreationDate, setTempSelectedCreationDate] = useState(new Date());
  const [loadingClients, setLoadingClients] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  const typeHebergementOptions = [
    { label: 'OVH', value: 'OVH' },
    { label: 'Server Dédié', value: 'Server Dédié' },
  ];

  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    clientId: null as number | null,
    typeHebergement: '',
    isNomDomaine: false,
    url: '',
    dateRenouvellement: '',
    dateRappel: '',
    derniereFacture: '',
    dateCreation: '',
  });

  // Trouver le client sélectionné
  const selectedClient = clients.find(client => client.id === formData.clientId);

  // Charger les clients
  const loadClients = async () => {
    if (!token) return;
    
    try {
      setLoadingClients(true);
      const clientsData = await servicesWebApi.getClients(token);
      setClients(clientsData);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      Alert.alert("Erreur", "Impossible de charger la liste des clients");
    } finally {
      setLoadingClients(false);
    }
  };

  // Charger les clients au montage du composant
  useEffect(() => {
    loadClients();
  }, [token]);

  const handleGoBack = () => {
    router.push("/(drawer)/services-web");
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
    if (!formData.clientId) {
      Alert.alert("Erreur", "Le client est obligatoire");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const createData = {
        clientId: formData.clientId,
        typeHebergement: formData.typeHebergement.trim() || null,
        isNomDomaine: formData.isNomDomaine,
        url: formData.url.trim() || null,
        dateRenouvellement: formatDateForAPI(formData.dateRenouvellement),
        dateRappel: formatDateForAPI(formData.dateRappel),
        derniereFacture: formData.derniereFacture.trim() || null,
        dateCreation: formatDateForAPI(formData.dateCreation),
      } as any;

      console.log('Données envoyées à l\'API:', createData);
      
      const newHebergement = await servicesWebApi.createHebergement(createData, token);
      
      Alert.alert(
        "Succès", 
        "Hébergement créé avec succès",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/(drawer)/hebergement-detail?id=${newHebergement.id}`)
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

  const handleRenouvellementDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowRenouvellementDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedRenouvellementDate(selectedDate);
      } else {
        setSelectedRenouvellementDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          dateRenouvellement: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleRappelDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowRappelDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedRappelDate(selectedDate);
      } else {
        setSelectedRappelDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          dateRappel: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleCreationDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowCreationDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedCreationDate(selectedDate);
      } else {
        setSelectedCreationDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          dateCreation: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleConfirmRenouvellementDate = () => {
    setSelectedRenouvellementDate(tempSelectedRenouvellementDate);
    setFormData(prev => ({
      ...prev,
      dateRenouvellement: tempSelectedRenouvellementDate.toISOString().split('T')[0]
    }));
    setShowRenouvellementDatePicker(false);
  };

  const handleConfirmRappelDate = () => {
    setSelectedRappelDate(tempSelectedRappelDate);
    setFormData(prev => ({
      ...prev,
      dateRappel: tempSelectedRappelDate.toISOString().split('T')[0]
    }));
    setShowRappelDatePicker(false);
  };

  const handleConfirmCreationDate = () => {
    setSelectedCreationDate(tempSelectedCreationDate);
    setFormData(prev => ({
      ...prev,
      dateCreation: tempSelectedCreationDate.toISOString().split('T')[0]
    }));
    setShowCreationDatePicker(false);
  };

  const handleCancelRenouvellementDate = () => {
    setTempSelectedRenouvellementDate(selectedRenouvellementDate);
    setShowRenouvellementDatePicker(false);
  };

  const handleCancelRappelDate = () => {
    setTempSelectedRappelDate(selectedRappelDate);
    setShowRappelDatePicker(false);
  };

  const handleCancelCreationDate = () => {
    setTempSelectedCreationDate(selectedCreationDate);
    setShowCreationDatePicker(false);
  };

  const handleSelectClient = () => {
    if (loadingClients) {
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
          text: `${client.nom} - ${client.ville || 'Ville non spécifiée'}`,
          onPress: () => {
            setFormData(prev => ({
              ...prev,
              clientId: client.id
            }));
          },
        }))
      ]
    );
  };

  const showPicker = (title: string, options: any[], currentValue: any, onSelect: (value: any) => void) => {
    Alert.alert(
      title,
      'Sélectionnez une option',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        ...options.map(option => ({
          text: option.label,
          onPress: () => onSelect(option.value)
        }))
      ]
    );
  };

  const updateFormField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderPicker = (label: string, field: keyof typeof formData, options: any[], currentValue: any) => (
    <View style={styles.inputGroup}>
      <Caption style={styles.label}>{label}</Caption>
      <Pressable
        style={styles.pickerButton}
        onPress={() => showPicker(label, options, currentValue, (value) => updateFormField(field, value))}
      >
        <BodyText style={styles.pickerText}>
          {options.find(opt => opt.value === currentValue)?.label || 'Sélectionner une option'}
        </BodyText>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Nouvel hébergement</Heading2>
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
          {/* Informations de l'hébergement */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Informations de l'hébergement</Heading2>
            
            {/* Client */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Client *</Caption>
              <Pressable
                style={styles.pickerButton}
                onPress={handleSelectClient}
                disabled={loadingClients}
              >
                <BodyText style={styles.pickerText}>
                  {loadingClients 
                    ? 'Chargement des clients...' 
                    : selectedClient 
                      ? `${selectedClient.nom} - ${selectedClient.ville || 'Ville non spécifiée'}`
                      : 'Sélectionner un client'
                  }
                </BodyText> 
              </Pressable>
            </View>

            {/* Type d'hébergement */}
            {renderPicker('Type d\'hébergement', 'typeHebergement', typeHebergementOptions, formData.typeHebergement)}

            {/* Nom de domaine inclus */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Nom de domaine inclus</Caption>
              <View style={styles.switchContainer}>
                <Switch
                  value={formData.isNomDomaine}
                  onValueChange={(value) => updateFormField('isNomDomaine', value)}
                  trackColor={{ false: '#d1d5db', true: '#2563eb' }}
                  thumbColor={formData.isNomDomaine ? '#fff' : '#f4f3f4'}
                />
                <BodyText style={styles.switchLabel}>
                  {formData.isNomDomaine ? 'Inclus' : 'Non inclus'}
                </BodyText>
              </View>
            </View>

            {/* URL - Affiché seulement si nom de domaine inclus */}
            {formData.isNomDomaine && (
              <View style={styles.inputGroup}>
                <Caption style={styles.label}>URL</Caption>
                <TextInput
                  style={styles.textInput}
                  value={formData.url}
                  onChangeText={(value) => updateFormField('url', value)}
                  placeholder="https://exemple.com"
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            )}
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Dates</Heading2>
            
            {/* Date de renouvellement */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date de renouvellement</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedRenouvellementDate(selectedRenouvellementDate);
                  setShowRenouvellementDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.dateRenouvellement ? formatDateForDisplay(formData.dateRenouvellement) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Date de rappel */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date de rappel</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedRappelDate(selectedRappelDate);
                  setShowRappelDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.dateRappel ? formatDateForDisplay(formData.dateRappel) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Date de création */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date de création</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedCreationDate(selectedCreationDate);
                  setShowCreationDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.dateCreation ? formatDateForDisplay(formData.dateCreation) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>
          </View>

          {/* Facturation */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Facturation</Heading2>
            
            {/* Numéro de dernière facture */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Numéro de dernière facture</Caption>
              <TextInput
                style={styles.textInput}
                value={formData.derniereFacture}
                onChangeText={(value) => updateFormField('derniereFacture', value)}
                placeholder="Ex: FACT-2024-001"
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Espace en bas */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal pour le sélecteur de date de renouvellement */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showRenouvellementDatePicker}
          onRequestClose={() => setShowRenouvellementDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelRenouvellementDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date de renouvellement</BodyText>
                <Pressable 
                  onPress={handleConfirmRenouvellementDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedRenouvellementDate}
                  mode="date"
                  display="spinner"
                  onChange={handleRenouvellementDateChange}
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
        showRenouvellementDatePicker && (
          <DateTimePicker
            value={selectedRenouvellementDate}
            mode="date"
            display="default"
            onChange={handleRenouvellementDateChange}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}

      {/* Modal pour le sélecteur de date de rappel */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showRappelDatePicker}
          onRequestClose={() => setShowRappelDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelRappelDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date de rappel</BodyText>
                <Pressable 
                  onPress={handleConfirmRappelDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedRappelDate}
                  mode="date"
                  display="spinner"
                  onChange={handleRappelDateChange}
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
        showRappelDatePicker && (
          <DateTimePicker
            value={selectedRappelDate}
            mode="date"
            display="default"
            onChange={handleRappelDateChange}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}

      {/* Modal pour le sélecteur de date de création */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showCreationDatePicker}
          onRequestClose={() => setShowCreationDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelCreationDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date de création</BodyText>
                <Pressable 
                  onPress={handleConfirmCreationDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedCreationDate}
                  mode="date"
                  display="spinner"
                  onChange={handleCreationDateChange}
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
        showCreationDatePicker && (
          <DateTimePicker
            value={selectedCreationDate}
            mode="date"
            display="default"
            onChange={handleCreationDateChange}
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
  pickerButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
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
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#fff",
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  switchLabel: {
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