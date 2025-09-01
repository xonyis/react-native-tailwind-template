import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { useHebergementDetail } from "@/hooks/useHebergementDetail";
import { servicesWebApi } from "@/services/servicesWebApi";
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, ChevronDown, Globe, Save } from "lucide-react-native";
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

export default function HebergementEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const hebergementId = id ? parseInt(id) : null;
  const { hebergement, loading, error } = useHebergementDetail(hebergementId);
  
  const [saving, setSaving] = useState(false);
  const [showRenouvellementDatePicker, setShowRenouvellementDatePicker] = useState(false);
  const [showRappelDatePicker, setShowRappelDatePicker] = useState(false);
  const [selectedRenouvellementDate, setSelectedRenouvellementDate] = useState(new Date());
  const [selectedRappelDate, setSelectedRappelDate] = useState(new Date());
  const [tempSelectedRenouvellementDate, setTempSelectedRenouvellementDate] = useState(new Date());
  const [tempSelectedRappelDate, setTempSelectedRappelDate] = useState(new Date());
  const [showTypePicker, setShowTypePicker] = useState(false);

  const typeHebergementOptions = [
    { label: 'OVH', value: 'OVH' },
    { label: 'Server Dédié', value: 'Server Dédié' },
  ];
  
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    typeHebergement: '',
    isNomDomaine: false,
    url: '',
    dateRenouvellement: '',
    dateRappel: '',
    derniereFacture: '',
  });

  useEffect(() => {
    if (hebergement) {
      // Initialiser le formulaire avec les données de l'hébergement
      setFormData({
        typeHebergement: hebergement.typeHebergement || '',
        isNomDomaine: hebergement.isNomDomaine || false,
        url: hebergement.url || '',
        dateRenouvellement: hebergement.dateRenouvellement || '',
        dateRappel: hebergement.dateRappel || '',
        derniereFacture: hebergement.derniereFacture || '',
      });

      // Initialiser les dates sélectionnées
      if (hebergement.dateRenouvellement) {
        setSelectedRenouvellementDate(new Date(hebergement.dateRenouvellement));
      }
      if (hebergement.dateRappel) {
        setSelectedRappelDate(new Date(hebergement.dateRappel));
      }
    }
  }, [hebergement]);

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
    if (!hebergement || !token) return;

    // Validation simple
    if (!formData.typeHebergement.trim()) {
      Alert.alert("Erreur", "Le type d'hébergement est obligatoire");
      return;
    }

    if (formData.isNomDomaine && !formData.url.trim()) {
      Alert.alert("Erreur", "L'URL est obligatoire quand le nom de domaine est inclus");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const updateData = {
        typeHebergement: formData.typeHebergement.trim(),
        isNomDomaine: formData.isNomDomaine,
        url: formData.isNomDomaine ? formData.url.trim() : '',
        dateRenouvellement: formatDateForAPI(formData.dateRenouvellement) || undefined,
        dateRappel: formatDateForAPI(formData.dateRappel) || undefined,
        derniereFacture: formData.derniereFacture.trim() || undefined,
      };

      console.log('Données envoyées à l\'API:', updateData);

      await servicesWebApi.updateHebergement(hebergement.id, updateData, token);
      
      Alert.alert(
        "Succès", 
        "Hébergement mis à jour avec succès",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/(drawer)/hebergement-detail?id=${hebergement.id}`)
          }
        ]
      );
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      const message = err instanceof Error ? err.message : "Erreur lors de la sauvegarde";
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

  const handleCancelRenouvellementDate = () => {
    setTempSelectedRenouvellementDate(selectedRenouvellementDate);
    setShowRenouvellementDatePicker(false);
  };

  const handleCancelRappelDate = () => {
    setTempSelectedRappelDate(selectedRappelDate);
    setShowRappelDatePicker(false);
  };

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <BodyText style={styles.loadingText}>Chargement...</BodyText>
      </View>
    );
  }

  if (error || !hebergement) {
    return (
      <View style={styles.errorContainer}>
        <BodyText style={styles.errorText}>
          {error || 'Hébergement non trouvé'}
        </BodyText>
        <Pressable style={styles.button} onPress={handleGoBack}>
          <BodyText style={styles.buttonText}>Retour aux services web</BodyText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Modifier l&apos;hébergement</Heading2>
        <Pressable onPress={handleSave} style={styles.saveButton} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <Save size={20} color="#2563eb" />
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Informations de base */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Informations de base</Heading2>
            
            {/* Type d'hébergement */}
                            <View style={styles.inputGroup}>
                  <Caption style={styles.label}>Type d&apos;hébergement *</Caption>
                  <View style={styles.inputContainerr}>
                    <Pressable
                      style={styles.selectContainer}
                      onPress={() => setShowTypePicker(true)}
                    >
                      <BodyText style={[styles.selectText, !formData.typeHebergement && styles.placeholderText]}>
                        {formData.typeHebergement || "Sélectionner le type d'hébergement"}
                      </BodyText>
                      <ChevronDown size={20} color="#6b7280" />
                    </Pressable>
                  </View>
                </View>

            {/* Nom de domaine inclus */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Nom de domaine inclus</Caption>
              <View style={styles.switchContainer}>
                
                <Switch
                  value={formData.isNomDomaine}
                  onValueChange={(value) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      isNomDomaine: value,
                      url: value ? prev.url : '' // Effacer l'URL si le switch est désactivé
                    }));
                  }}
                  trackColor={{ false: "#d1d5db", true: "#2563eb" }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* URL (conditionnel) */}
            {formData.isNomDomaine && (
              <View style={styles.inputGroup}>
                <Caption style={styles.label}>URL *</Caption>
                <View style={styles.inputContainer}>
                  <Globe size={20} color="#6b7280" />
                  <TextInput
                    style={styles.textInput}
                    value={formData.url}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, url: text }))}
                    placeholder="Saisir l'URL"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            )}

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

            {/* Dernière facture */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Dernière facture</Caption>
              <View style={styles.inputContainer}>
                <Globe size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.derniereFacture}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, derniereFacture: text }))}
                  placeholder="Saisir la dernière facture"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>

          {/* Informations du client (lecture seule) */}
          {hebergement.client && (
            <View style={styles.section}>
              <Heading2 style={styles.sectionTitle}>Client</Heading2>
              <View style={styles.clientInfo}>
                <BodyText style={styles.clientName}>{hebergement.client.nom}</BodyText>
                {hebergement.client.raisonSocial && (
                  <BodyText style={styles.clientEmail}>{hebergement.client.raisonSocial}</BodyText>
                )}
                {hebergement.client.adresseEmailClient && (
                  <BodyText style={styles.clientEmail}>{hebergement.client.adresseEmailClient}</BodyText>
                )}
                {hebergement.client.numeroTel1 && (
                  <BodyText style={styles.clientPhone}>{hebergement.client.numeroTel1}</BodyText>
                )}
              </View>
            </View>
          )}

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

      {/* Modal pour le sélecteur de type d'hébergement */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showTypePicker}
        onRequestClose={() => setShowTypePicker(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.actionSheetContainer}>
          <View style={styles.actionSheetHeader}>
            <BodyText style={styles.actionSheetTitle}>Type d&apos;hébergement</BodyText>
            <Pressable
              onPress={() => setShowTypePicker(false)}
              style={styles.actionSheetCancelButton}
            >
              <BodyText style={styles.actionSheetCancelText}>Annuler</BodyText>
            </Pressable>
          </View>
          <View style={styles.actionSheetContent}>
            {typeHebergementOptions.map((option) => (
              <Pressable
                key={option.value}
                style={styles.actionSheetOption}
                onPress={() => {
                  setFormData(prev => ({ ...prev, typeHebergement: option.value }));
                  setShowTypePicker(false);
                }}
              >
                <BodyText style={[
                  styles.actionSheetOptionText,
                  formData.typeHebergement === option.value && styles.actionSheetSelectedOption
                ]}>
                  {option.label}
                </BodyText>
                {formData.typeHebergement === option.value && (
                  <BodyText style={styles.actionSheetCheckmark}>✓</BodyText>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

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
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainerr: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
    gap: 12,
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
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,

    borderRadius: 8,
    backgroundColor: "#fff",
  },
  switchLabel: {
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
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
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
  clientInfo: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  clientEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
      clientPhone: {
      fontSize: 14,
      color: "#6b7280",
    },
    selectContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      backgroundColor: '#fff',
      flex: 1,
    },
    selectText: {
      color: '#374151',
      fontSize: 16,
      flex: 1,
    },
    placeholderText: {
      color: '#9ca3af',
    },
    optionsContainer: {
      backgroundColor: 'white',
      paddingVertical: 8,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    optionText: {
      fontSize: 16,
      color: '#374151',
    },
    selectedOptionText: {
      color: '#2563eb',
      fontWeight: '600',
    },
    checkmark: {
      fontSize: 16,
      color: '#2563eb',
      fontWeight: 'bold',
    },
    actionSheetContainer: {
      flex: 1,
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    actionSheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    },
    actionSheetTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1f2937',
    },
    actionSheetCancelButton: {
      paddingVertical: 8,
    },
    actionSheetCancelText: {
      color: '#2563eb',
      fontWeight: '600',
    },
    actionSheetContent: {
      paddingHorizontal: 20,
    },
    actionSheetOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    actionSheetOptionText: {
      fontSize: 16,
      color: '#374151',
    },
    actionSheetSelectedOption: {
      color: '#2563eb',
      fontWeight: '600',
    },
    actionSheetCheckmark: {
      fontSize: 16,
      color: '#2563eb',
      fontWeight: 'bold',
    },
  });

