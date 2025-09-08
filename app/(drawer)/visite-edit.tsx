import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { useAuth } from "@/context/AuthContext";
import { useVisiteDetail } from "@/hooks/useVisiteDetail";
import { servicesWebApi } from "@/services/servicesWebApi";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clipboard, MessageSquare, Save, Tag, User } from "lucide-react-native";
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
  TextInput,
  View
} from "react-native";

export default function VisiteEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const visiteId = id ? parseInt(id) : null;
  const { visite, loading, error } = useVisiteDetail(visiteId);

  const [formData, setFormData] = useState({
    date_visite: '',
    date_programmee: '',
    statut: 'programmee',
    type_visite: '',
    technicien: '',
    commentaires: '',
  });

  const [saving, setSaving] = useState(false);

  // Date picker states
  const [showVisiteDatePicker, setShowVisiteDatePicker] = useState(false);
  const [showProgrammeeDatePicker, setShowProgrammeeDatePicker] = useState(false);
  const [selectedVisiteDate, setSelectedVisiteDate] = useState(new Date());
  const [selectedProgrammeeDate, setSelectedProgrammeeDate] = useState(new Date());
  const [tempSelectedVisiteDate, setTempSelectedVisiteDate] = useState(new Date());
  const [tempSelectedProgrammeeDate, setTempSelectedProgrammeeDate] = useState(new Date());

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

  // Fonctions de sélection avec Alert Apple
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
        onPress: () => setFormData(prev => ({ ...prev, type_visite: '' }))
      },
      ...typeVisiteOptions.map(option => ({
        text: option.label,
        onPress: () => setFormData(prev => ({ ...prev, type_visite: option.value }))
      }))
    ];

    typeButtons.push({
      text: "Annuler",
      style: "cancel"
    });

    Alert.alert("Type de visite", "", typeButtons);
  };

  // Initialize form data when visite is loaded
  useEffect(() => {
    if (visite) {
      setFormData({
        date_visite: visite.date_visite || visite.dateVisite || '',
        date_programmee: visite.date_programmee || visite.dateProgrammee || '',
        statut: visite.statut || 'programmee',
        type_visite: visite.type_visite || visite.typeVisite || '',
        technicien: visite.technicien || '',
        commentaires: visite.commentaires || '',
      });
      
      // Initialize date pickers
      const visiteDate = visite.date_visite || visite.dateVisite;
      if (visiteDate) {
        setSelectedVisiteDate(new Date(visiteDate));
        setTempSelectedVisiteDate(new Date(visiteDate));
      }
      const programmeeDate = visite.date_programmee || visite.dateProgrammee;
      if (programmeeDate) {
        setSelectedProgrammeeDate(new Date(programmeeDate));
        setTempSelectedProgrammeeDate(new Date(programmeeDate));
      }
    }
  }, [visite]);

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
          date_visite: selectedDate.toISOString().split('T')[0]
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
          date_programmee: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleConfirmVisiteDate = () => {
    setSelectedVisiteDate(tempSelectedVisiteDate);
    setFormData(prev => ({
      ...prev,
      date_visite: tempSelectedVisiteDate.toISOString().split('T')[0]
    }));
    setShowVisiteDatePicker(false);
  };

  const handleConfirmProgrammeeDate = () => {
    setSelectedProgrammeeDate(tempSelectedProgrammeeDate);
    setFormData(prev => ({
      ...prev,
      date_programmee: tempSelectedProgrammeeDate.toISOString().split('T')[0]
    }));
    setShowProgrammeeDatePicker(false);
  };

  const handleSave = async () => {
    if (!visite || !token) return;

    if (!formData.date_visite.trim() || !formData.statut.trim()) {
      Alert.alert("Erreur", "La date de visite et le statut sont obligatoires");
      return;
    }

    try {
      setSaving(true);
      const updateData: any = {
        date_visite: formData.date_visite,
        date_programmee: formData.date_programmee || formData.date_visite,
        statut: formData.statut.trim(),
        type_visite: formData.type_visite.trim() || 'ponctuelle',
        technicien: formData.technicien.trim(),
        commentaires: formData.commentaires.trim(),
      };

      await servicesWebApi.updateVisite(visite.id, updateData, token);
      Alert.alert(
        "Succès",
        "Visite mise à jour avec succès",
        [{ text: "OK", onPress: () => router.replace(`/(drawer)/visite-detail?id=${visite.id}`) }]
      );
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      const message = err instanceof Error ? err.message : "Erreur lors de la sauvegarde";
      Alert.alert("Erreur", message);
    } finally {
      setSaving(false);
    }
  };

  const renderPicker = (label: string, field: string, options: any[], value: string, icon: React.ReactNode) => (
    <View style={styles.inputGroup}>
      <Caption style={styles.label}>{label}</Caption>
      <Pressable
        style={styles.pickerButton}
        onPress={() => {
          if (field === 'statut') showStatutPicker();
          else if (field === 'type_visite') showTypeVisitePicker();
        }}
      >
        <View style={styles.pickerContent}>
          {icon}
          <BodyText style={styles.pickerText}>
            {options.find(opt => opt.value === value)?.label || 'Sélectionner...'}
          </BodyText>
        </View>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <BodyText style={styles.loadingText}>Chargement de la visite...</BodyText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <BodyText style={styles.errorText}>{error}</BodyText>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <BodyText style={styles.buttonText}>Retour</BodyText>
        </Pressable>
      </View>
    );
  }

  if (!visite) {
    return (
      <View style={styles.errorContainer}>
        <BodyText style={styles.errorText}>Visite non trouvée</BodyText>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <BodyText style={styles.buttonText}>Retour</BodyText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Modifier la visite</Heading2>
        <Pressable onPress={handleSave} style={styles.saveButton} disabled={saving}>
        {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Save size={20} color="#fff" />
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Informations de la visite */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Informations de la visite</Heading2>
            
            {/* Client (read-only) */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Client</Caption>
              <View style={[styles.inputContainer, { backgroundColor: '#f9fafb' }]}>
                <User size={20} color="#6b7280" />
                <BodyText style={[styles.textInput, { color: '#6b7280' }]}>
                  {visite?.client?.nom || 'Client non défini'}
                </BodyText>
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
                  {formData.date_visite ? formatDateForDisplay(formData.date_visite) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Date programmée */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date programmée</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedProgrammeeDate(selectedProgrammeeDate);
                  setShowProgrammeeDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.date_programmee ? formatDateForDisplay(formData.date_programmee) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {renderPicker('Statut *', 'statut', statutOptions, formData.statut, <Clipboard size={20} color="#6b7280" />)}
            {renderPicker('Type de visite', 'type_visite', typeVisiteOptions, formData.type_visite, <Tag size={20} color="#6b7280" />)}

            {/* Technicien */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Technicien</Caption>
              <View style={styles.inputContainer}>
                <User size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.technicien}
                  onChangeText={(text) => setFormData({ ...formData, technicien: text })}
                  placeholder="Nom du technicien"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>


          {/* Commentaires */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Commentaires</Heading2>
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Commentaires</Caption>
              <View style={styles.textAreaContainer}>
                <MessageSquare size={20} color="#6b7280" style={styles.textAreaIcon} />
                <TextInput
                  style={styles.textArea}
                  value={formData.commentaires}
                  onChangeText={(text) => setFormData({ ...formData, commentaires: text })}
                  placeholder="Ajouter des commentaires..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Espace en bas */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

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
                <BodyText style={styles.modalTitle}>Sélectionner une date de visite</BodyText>
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
                <BodyText style={styles.modalTitle}>Sélectionner une date programmée</BodyText>
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
    backgroundColor: "#3b82f6",
    padding: 8,
    borderRadius: 8,
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
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#6b7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  pickerButton: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  pickerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  textAreaContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  textAreaIcon: {
    marginTop: 4,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    minHeight: 80,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
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
  modalTitle: {
    flex: 1,
    textAlign: "center",
    color: "#1f2937",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemText: {
    fontSize: 16,
    color: "#374151",
  },
  datePickerContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  modalConfirmButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  modalConfirmText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
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
