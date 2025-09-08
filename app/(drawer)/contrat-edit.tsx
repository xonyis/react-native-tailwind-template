import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { useContratDetail } from "@/hooks/useContratDetail";
import { contratsApi } from "@/services/contratsApi";
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
    View
} from "react-native";

export default function ContratEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const contratId = id ? parseInt(id) : null;
  const { contrat, loading, error } = useContratDetail(contratId);
  
  const [saving, setSaving] = useState(false);
  const [showSignatureDatePicker, setShowSignatureDatePicker] = useState(false);
  const [showExpirationDatePicker, setShowExpirationDatePicker] = useState(false);
  const [selectedSignatureDate, setSelectedSignatureDate] = useState(new Date());
  const [selectedExpirationDate, setSelectedExpirationDate] = useState(new Date());
  const [tempSelectedSignatureDate, setTempSelectedSignatureDate] = useState(new Date());
  const [tempSelectedExpirationDate, setTempSelectedExpirationDate] = useState(new Date());
  
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    type_contrat: '',
    statut: '',
    date_signature: '',
    date_expiration: '',
    commentaire: '',
    nombreServPhysique: 0,
    nombreServVirtuel: 0,
    nombrePcFixe: 0,
    nombrePcPortable: 0,
    nombreUtilisateurClientLeger: 0,
    nombreRouter: 0,
    nombreTelemaintenanceAssistance: 0,
    securiteFirewall: 0,
    pointAccesWifiIndoor: 0,
    retentionSauvegarde: 0,
    forfaitSauvegardePoste: 0,
    cryptoprotect: false,
    nombrePostesCryptoprotect: 0,
    antispamProtectionGold: 0,
  });

  // Options pour les sélecteurs
  const typeContratOptions = [
    { label: 'VIP', value: 'VIP' },
    { label: 'BLUE', value: 'BLUE' },
    { label: 'HEBERGEMENT EVOLUCLOUD', value: 'HEBERGEMENT EVOLUCLOUD' },
    { label: 'OFFICE 365', value: 'OFFICE 365' },
    { label: 'SAGE', value: 'SAGE' },
    { label: 'SAUVEGARDE', value: 'SAUVEGARDE' },
    { label: 'PRINT', value: 'PRINT' },
    { label: 'AUTRE', value: 'AUTRE' },
  ];

  const statutOptions = [
    { label: 'En cours', value: 'En cours' },
    { label: 'Terminé', value: 'Termine' },
  ];

  const firewallOptions = [
    { label: 'Aucun', value: 0 },
    { label: 'Boîtier firewall avec 5 utilisateurs', value: 5 },
    { label: 'Boîtier firewall avec 15 utilisateurs', value: 15 },
  ];

  const retentionOptions = [
    { label: 'Aucune sauvegarde', value: 0 },
    { label: '150 Go', value: 150 },
    { label: '300 Go', value: 300 },
    { label: '600 Go', value: 600 },
    { label: '1 To', value: 1000 },
    { label: '1.5 To', value: 1500 },
    { label: '2 To', value: 2000 },
  ];

  useEffect(() => {
    if (contrat) {
      // Initialiser le formulaire avec les données du contrat
      setFormData({
        type_contrat: contrat.type_contrat || '',
        statut: contrat.statut || '',
        date_signature: contrat.date_signature || '',
        date_expiration: contrat.date_expiration || '',
        commentaire: contrat.commentaire || '',
        nombreServPhysique: contrat.nombreServPhysique || 0,
        nombreServVirtuel: contrat.nombreServVirtuel || 0,
        nombrePcFixe: contrat.nombrePcFixe || 0,
        nombrePcPortable: contrat.nombrePcPortable || 0,
        nombreUtilisateurClientLeger: contrat.nombreUtilisateurClientLeger || 0,
        nombreRouter: contrat.nombreRouter || 0,
        nombreTelemaintenanceAssistance: contrat.nombreTelemaintenanceAssistance || 0,
        securiteFirewall: contrat.securiteFirewall || 0,
        pointAccesWifiIndoor: contrat.pointAccesWifiIndoor || 0,
        retentionSauvegarde: contrat.retentionSauvegarde || 0,
        forfaitSauvegardePoste: contrat.forfaitSauvegardePoste || 0,
        cryptoprotect: contrat.cryptoprotect || false,
        nombrePostesCryptoprotect: contrat.nombrePostesCryptoprotect || 0,
        antispamProtectionGold: contrat.antispamProtectionGold || 0,
      });

      // Initialiser les dates sélectionnées
      if (contrat.date_signature) {
        setSelectedSignatureDate(new Date(contrat.date_signature));
      }
      if (contrat.date_expiration) {
        setSelectedExpirationDate(new Date(contrat.date_expiration));
      }
    }
  }, [contrat]);

  const handleGoBack = () => {
    router.push("/(drawer)/contrats");
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
    if (!contrat || !token) return;

    // Validation simple
    if (!formData.type_contrat.trim() || !formData.statut.trim()) {
      Alert.alert("Erreur", "Le type de contrat et le statut sont obligatoires");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const updateData = {
        type_contrat: formData.type_contrat.trim(),
        statut: formData.statut.trim(),
        date_signature: formatDateForAPI(formData.date_signature),
        date_expiration: formatDateForAPI(formData.date_expiration),
        commentaire: formData.commentaire.trim() || null,
        nombreServPhysique: formData.nombreServPhysique,
        nombreServVirtuel: formData.nombreServVirtuel,
        nombrePcFixe: formData.nombrePcFixe,
        nombrePcPortable: formData.nombrePcPortable,
        nombreUtilisateurClientLeger: formData.nombreUtilisateurClientLeger,
        nombreRouter: formData.nombreRouter,
        nombreTelemaintenanceAssistance: formData.nombreTelemaintenanceAssistance,
        securiteFirewall: formData.securiteFirewall,
        pointAccesWifiIndoor: formData.pointAccesWifiIndoor,
        retentionSauvegarde: formData.retentionSauvegarde,
        forfaitSauvegardePoste: formData.forfaitSauvegardePoste,
        cryptoprotect: formData.cryptoprotect,
        nombrePostesCryptoprotect: formData.nombrePostesCryptoprotect,
        antispamProtectionGold: formData.antispamProtectionGold,
      } as any;

      console.log('Données envoyées à l\'API:', updateData);
      
      await contratsApi.updateContrat(contrat.id, updateData, token);
      
      Alert.alert(
        "Succès", 
        "Contrat mis à jour avec succès",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/(drawer)/contrat-detail?id=${contrat.id}`)
          }
        ]
      );
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour";
      Alert.alert("Erreur", message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignatureDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowSignatureDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedSignatureDate(selectedDate);
      } else {
        setSelectedSignatureDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          date_signature: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleExpirationDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowExpirationDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedExpirationDate(selectedDate);
      } else {
        setSelectedExpirationDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          date_expiration: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleConfirmSignatureDate = () => {
    setSelectedSignatureDate(tempSelectedSignatureDate);
    setFormData(prev => ({
      ...prev,
      date_signature: tempSelectedSignatureDate.toISOString().split('T')[0]
    }));
    setShowSignatureDatePicker(false);
  };

  const handleConfirmExpirationDate = () => {
    setSelectedExpirationDate(tempSelectedExpirationDate);
    setFormData(prev => ({
      ...prev,
      date_expiration: tempSelectedExpirationDate.toISOString().split('T')[0]
    }));
    setShowExpirationDatePicker(false);
  };

  const handleCancelSignatureDate = () => {
    setTempSelectedSignatureDate(selectedSignatureDate);
    setShowSignatureDatePicker(false);
  };

  const handleCancelExpirationDate = () => {
    setTempSelectedExpirationDate(selectedExpirationDate);
    setShowExpirationDatePicker(false);
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

  const renderNumberInput = (label: string, field: keyof typeof formData, placeholder: string, help?: string) => (
    <View style={styles.inputGroup}>
      <Caption style={styles.label}>{label}</Caption>
      <TextInput
        style={styles.numberInput}
        value={formData[field].toString()}
        onChangeText={(value) => updateFormField(field, parseInt(value) || 0)}
        placeholder={placeholder}
        keyboardType="numeric"
      />
      {help && <Caption style={styles.helpText}>{help}</Caption>}
    </View>
  );

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <BodyText style={styles.loadingText}>Chargement...</BodyText>
      </View>
    );
  }

  if (error || !contrat) {
    return (
      <View style={styles.errorContainer}>
        <BodyText style={styles.errorText}>
          {error || "Contrat non trouvé"}
        </BodyText>
        <Pressable style={styles.button} onPress={handleGoBack}>
          <BodyText style={styles.buttonText}>Retour</BodyText>
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
        <Heading2 style={styles.headerTitle}>Modifier contrat</Heading2>
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
          {/* Informations du contrat */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Informations du contrat</Heading2>
            
            {/* Client (lecture seule) */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Client</Caption>
              <View style={[styles.pickerButton, styles.readOnlyField]}>
                <BodyText style={styles.pickerText}>
                  {contrat.client?.nom || 'Client non trouvé'}
                </BodyText>
              </View>
            </View>

            {/* Type de contrat */}
            {renderPicker('Type de contrat *', 'type_contrat', typeContratOptions, formData.type_contrat)}

            {/* Statut */}
            {renderPicker('Statut *', 'statut', statutOptions, formData.statut)}

            {/* Date de signature */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date de signature</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedSignatureDate(selectedSignatureDate);
                  setShowSignatureDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.date_signature ? formatDateForDisplay(formData.date_signature) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Date d'expiration */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date d&apos;expiration</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedExpirationDate(selectedExpirationDate);
                  setShowExpirationDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.date_expiration ? formatDateForDisplay(formData.date_expiration) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Commentaire */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Commentaire</Caption>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.commentaire}
                onChangeText={(value) => updateFormField('commentaire', value)}
                placeholder="Ajoutez un commentaire sur ce contrat..."
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Matériel et systèmes */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Matériel et systèmes</Heading2>
            
            {renderNumberInput(
              'Nombre de serveurs physiques et supervision',
              'nombreServPhysique',
              '0 = aucun serveur physique',
              '0 = aucun serveur physique, ≥1 = nombre de serveurs physiques inclus'
            )}

            {renderNumberInput(
              'Nombre de serveurs virtuels et supervision',
              'nombreServVirtuel',
              '0 = aucun serveur virtuel',
              '0 = aucun serveur virtuel, ≥1 = nombre de serveurs virtuels inclus'
            )}

            {renderNumberInput(
              "Nombre de PC fixe avec écran jusqu'à 27''",
              'nombrePcFixe',
              '0 = aucun PC fixe',
              '0 = aucun PC fixe, ≥1 = nombre de PC fixe inclus'
            )}

            {renderNumberInput(
              'Nombre de PC portables',
              'nombrePcPortable',
              '0 = aucun PC portable',
              '0 = aucun PC portable, ≥1 = nombre de PC portables inclus'
            )}

            {renderNumberInput(
              "Nombre d'utilisateurs client léger",
              'nombreUtilisateurClientLeger',
              '0 = aucun utilisateur client léger',
              "0 = aucun utilisateur client léger, ≥1 = nombre d'utilisateurs client léger inclus"
            )}

            {renderNumberInput(
              'Nombre de routeurs',
              'nombreRouter',
              '0 = aucun routeur',
              '0 = aucun routeur, ≥1 = nombre de routeurs inclus'
            )}

            {renderNumberInput(
              'Télémaintenance: assistance',
              'nombreTelemaintenanceAssistance',
              '0 = aucune télémaintenance',
              "0 = aucune télémaintenance, ≥1 = nombre d'assistances télémaintenance incluses"
            )}

          </View>

          {/* Matériel et systèmes */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Sécurité et FireWall</Heading2>

            {renderPicker(
              'Sécurité FireWall',
              'securiteFirewall',
              firewallOptions,
              formData.securiteFirewall
            )}

            {renderNumberInput(
              "Point d'accès WiFi Indoor",
              'pointAccesWifiIndoor',
              '0 = aucun point d\'accès WiFi',
              "0 = aucun point d'accès WiFi, ≥1 = nombre de points d'accès WiFi Indoor inclus"
            )}
          </View>

          {/* Cryptoprotect */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Cryptoprotect et Antispam</Heading2>

            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Cryptoprotect</Caption>
              <View style={styles.switchContainer}>
                <Switch
                  value={formData.cryptoprotect}
                  onValueChange={(value) => updateFormField('cryptoprotect', value)}
                  trackColor={{ false: '#d1d5db', true: '#2563eb' }}
                  thumbColor={formData.cryptoprotect ? '#fff' : '#f4f3f4'}
                />
                <BodyText style={styles.switchLabel}>
                  {formData.cryptoprotect ? 'Activé' : 'Désactivé'}
                </BodyText>
              </View>
              <Caption style={styles.helpText}>Cochez pour activer Cryptoprotect</Caption>
            </View>

            {formData.cryptoprotect && renderNumberInput(
              'Nombre de postes (Cryptoprotect)',
              'nombrePostesCryptoprotect',
              '0 = aucun poste',
              '0 = aucun poste, ≥1 = nombre de postes pour Cryptoprotect'
            )}

            {renderNumberInput(
              'Antispam - Protection Gold (pack de 5 licences)',
              'antispamProtectionGold',
              '0 = aucun pack antispam',
              '0 = aucun pack, ≥1 = nombre de packs de 5 licences Mail in Black'
            )}
          </View>

          {/* Sauvegarde Serveur */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Sauvegarde Serveur</Heading2>
            {renderPicker(
              'Rétention 15 jours + 3 points mensuels',
              'retentionSauvegarde',
              retentionOptions,
              formData.retentionSauvegarde
            )}
          </View>

          {/* Sauvegarde Poste de Travail */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Sauvegarde Poste de Travail</Heading2>
            {renderNumberInput(
              'Forfait Sauvegarde de Poste (Go)',
              'forfaitSauvegardePoste',
              '0 = aucun forfait sauvegarde',
              '0 = aucun forfait sauvegarde, ≥1 = taille en Go pour la sauvegarde de poste'
            )}
          </View>
          

          {/* Espace en bas */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      

      {/* Modal pour le sélecteur de date de signature */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showSignatureDatePicker}
          onRequestClose={() => setShowSignatureDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelSignatureDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date de signature</BodyText>
                <Pressable 
                  onPress={handleConfirmSignatureDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedSignatureDate}
                  mode="date"
                  display="spinner"
                  onChange={handleSignatureDateChange}
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
        showSignatureDatePicker && (
          <DateTimePicker
            value={selectedSignatureDate}
            mode="date"
            display="default"
            onChange={handleSignatureDateChange}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}

      {/* Modal pour le sélecteur de date d'expiration */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showExpirationDatePicker}
          onRequestClose={() => setShowExpirationDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelExpirationDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date d&apos;expiration</BodyText>
                <Pressable 
                  onPress={handleConfirmExpirationDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedExpirationDate}
                  mode="date"
                  display="spinner"
                  onChange={handleExpirationDateChange}
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
        showExpirationDatePicker && (
          <DateTimePicker
            value={selectedExpirationDate}
            mode="date"
            display="default"
            onChange={handleExpirationDateChange}
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
  readOnlyField: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
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
  numberInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helpText: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
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
});