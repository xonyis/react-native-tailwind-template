import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { servicesWebApi } from "@/services/servicesWebApi";
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clipboard, MessageSquare, Save, Tag, User } from "lucide-react-native";
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
  View
} from "react-native";

export default function VisiteNewScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { token } = useAuth();

  const [saving, setSaving] = useState(false);

  const [loadingClients, setLoadingClients] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  // États pour les date pickers
  const [showVisiteDatePicker, setShowVisiteDatePicker] = useState(false);
  const [showProgrammeeDatePicker, setShowProgrammeeDatePicker] = useState(false);
  const [selectedVisiteDate, setSelectedVisiteDate] = useState(new Date());
  const [selectedProgrammeeDate, setSelectedProgrammeeDate] = useState(new Date());
  const [tempSelectedVisiteDate, setTempSelectedVisiteDate] = useState(new Date());
  const [tempSelectedProgrammeeDate, setTempSelectedProgrammeeDate] = useState(new Date());

  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    clientId: null as number | null,
    dateVisite: '',
    dateProgrammee: '',
    statut: 'programmee',
    typeVisite: '',
    technicien: '',
    commentaires: '',
  });

  const statutOptions = [
    { value: 'programmee', label: 'Programmée' },
    { value: 'effectuee', label: 'Effectuée' },
    { value: 'annulee', label: 'Annulée' },
  ];

  const typeVisiteOptions = [
    { value: 'annuelle', label: 'Visite annuelle' },
    { value: 'ponctuelle', label: 'Visite ponctuelle' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

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
  React.useEffect(() => {
    loadClients();
  }, [token]);

  const handleGoBack = () => {
    router.push("/(drawer)/visites");
  };

  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const handleVisiteDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowVisiteDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedVisiteDate(selectedDate);
      } else {
        setSelectedVisiteDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          dateVisite: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleProgrammeeDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowProgrammeeDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedProgrammeeDate(selectedDate);
      } else {
        setSelectedProgrammeeDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          dateProgrammee: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleConfirmVisiteDate = () => {
    setSelectedVisiteDate(tempSelectedVisiteDate);
    setFormData(prev => ({
      ...prev,
      dateVisite: tempSelectedVisiteDate.toISOString().split('T')[0]
    }));
    setShowVisiteDatePicker(false);
  };

  const handleConfirmProgrammeeDate = () => {
    setSelectedProgrammeeDate(tempSelectedProgrammeeDate);
    setFormData(prev => ({
      ...prev,
      dateProgrammee: tempSelectedProgrammeeDate.toISOString().split('T')[0]
    }));
    setShowProgrammeeDatePicker(false);
  };

  // Fonctions de sélection avec Alert Apple
  const showClientPicker = () => {
    if (clients.length === 0) {
      Alert.alert("Aucun client", "Aucun client disponible");
      return;
    }

    const clientButtons = clients.map(client => ({
      text: `${client.nom} - ${client.ville || 'Ville non définie'}`,
      onPress: () => setFormData(prev => ({ ...prev, clientId: client.id }))
    }));

    clientButtons.push({
      text: "Annuler",
      style: "cancel"
    });

    Alert.alert("Sélectionner un client", "", clientButtons);
  };

  const showStatutPicker = () => {
    const statutButtons = statutOptions.map(option => ({
      text: option.label,
      onPress: () => setFormData(prev => ({ ...prev, statut: option.value }))
    }));

    statutButtons.push({
      text: "Annuler",
      style: "cancel"
    });

    Alert.alert("Statut de la visite", "", statutButtons);
  };

  const showTypeVisitePicker = () => {
    const typeButtons = [
      {
        text: "Aucun",
        onPress: () => setFormData(prev => ({ ...prev, typeVisite: '' }))
      },
      ...typeVisiteOptions.map(option => ({
        text: option.label,
        onPress: () => setFormData(prev => ({ ...prev, typeVisite: option.value }))
      }))
    ];

    typeButtons.push({
      text: "Annuler",
      style: "cancel"
    });

    Alert.alert("Type de visite", "", typeButtons);
  };

  const handleSave = async () => {
    if (!token) return;

    // Validation simple
    if (!formData.clientId) {
      Alert.alert("Erreur", "Le client est obligatoire");
      return;
    }

    if (!formData.dateVisite.trim()) {
      Alert.alert("Erreur", "La date de visite est obligatoire");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const createData = {
        client_id: formData.clientId,
        date_visite: formData.dateVisite,
        date_programmee: formData.dateProgrammee || undefined,
        statut: formData.statut,
        type_visite: formData.typeVisite.trim() || undefined,
        technicien: formData.technicien.trim() || undefined,
        commentaires: formData.commentaires.trim() || undefined,
      };

      console.log('Données envoyées à l\'API:', createData);

      const newVisite = await servicesWebApi.createVisite(createData, token);
      
      Alert.alert(
        "Succès", 
        "Visite créée avec succès",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/(drawer)/visite-detail?id=${newVisite.id}`)
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Alert.alert(
        "Erreur",
        error instanceof Error ? error.message : "Erreur lors de la création de la visite"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#1f2937" />
        </Pressable>
        <BodyText style={styles.headerTitle}>Nouvelle visite</BodyText>
        <Pressable onPress={handleSave} style={styles.saveButton} disabled={saving}>
        {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Save size={20} color="#fff" />
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Informations de la visite</Heading2>

            {/* Client */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Client *</Caption>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={styles.pickerButton}
                  onPress={showClientPicker}
                >
                  <User size={20} color="#6b7280" />
                  <BodyText style={styles.pickerText}>
                    {(() => {
                      const selectedClient = clients.find(c => c.id === formData.clientId);
                      return selectedClient ? `${selectedClient.nom} - ${selectedClient.ville || ''}` : 'Sélectionner un client';
                    })()}
                  </BodyText>
                </Pressable>
              </View>
            </View>

            {/* Date de visite */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date de visite *</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedVisiteDate(selectedVisiteDate);
                  setShowVisiteDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.dateVisite ? formatDateForDisplay(formData.dateVisite) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Date programmée */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date programmée</Caption>
              <Caption style={styles.helpText}>Si différente de la date de visite (par défaut = date de visite)</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedProgrammeeDate(selectedProgrammeeDate);
                  setShowProgrammeeDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.dateProgrammee ? formatDateForDisplay(formData.dateProgrammee) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Statut */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Statut *</Caption>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={styles.pickerButton}
                  onPress={showStatutPicker}
                >
                  <Tag size={20} color="#6b7280" />
                  <BodyText style={styles.pickerText}>
                    {statutOptions.find(option => option.value === formData.statut)?.label || 'Sélectionner un statut'}
                  </BodyText>
                </Pressable>
              </View>
            </View>

            {/* Type de visite */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Type de visite</Caption>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={styles.pickerButton}
                  onPress={showTypeVisitePicker}
                >
                  <Clipboard size={20} color="#6b7280" />
                  <BodyText style={styles.pickerText}>
                    {typeVisiteOptions.find(option => option.value === formData.typeVisite)?.label || 'Sélectionner un type'}
                  </BodyText>
                </Pressable>
              </View>
            </View>

            {/* Technicien */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Technicien</Caption>
              <View style={styles.inputContainer}>
                <User size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.technicien}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, technicien: text }))}
                  placeholder="Nom du technicien"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Commentaires */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Commentaires</Caption>
              <View style={styles.inputContainer}>
                <MessageSquare size={20} color="#6b7280" style={styles.textareaIcon} />
                <TextInput
                  style={[styles.textInput, styles.textareaInput]}
                  value={formData.commentaires}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, commentaires: text }))}
                  placeholder="Notes sur la visite..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Espace en bas */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <FAB onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />

      {/* Modal pour le sélecteur de date de visite */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showVisiteDatePicker}
          onRequestClose={() => setShowVisiteDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={() => setShowVisiteDatePicker(false)}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date</BodyText>
                <Pressable 
                  onPress={handleConfirmVisiteDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedVisiteDate}
                  mode="date"
                  display="spinner"
                  onChange={handleVisiteDateChange}
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
        showVisiteDatePicker && (
          <DateTimePicker
            value={selectedVisiteDate}
            mode="date"
            display="default"
            onChange={handleVisiteDateChange}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}

      {/* Modal pour le sélecteur de date programmée */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showProgrammeeDatePicker}
          onRequestClose={() => setShowProgrammeeDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={() => setShowProgrammeeDatePicker(false)}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date</BodyText>
                <Pressable 
                  onPress={handleConfirmProgrammeeDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedProgrammeeDate}
                  mode="date"
                  display="spinner"
                  onChange={handleProgrammeeDateChange}
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
        showProgrammeeDatePicker && (
          <DateTimePicker
            value={selectedProgrammeeDate}
            mode="date"
            display="default"
            onChange={handleProgrammeeDateChange}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}
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
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#1f2937",
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    padding: 8,
    borderRadius: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: "#1f2937",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  helpText: {
    color: "#9ca3af",
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#374151",
  },
  textareaInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  textareaIcon: {
    alignSelf: "flex-start",
    marginTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  pickerText: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#374151",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dateText: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#374151",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalButtonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
});
