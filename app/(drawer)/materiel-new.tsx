import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { useClientsList } from "@/hooks/useClientsList";
import { materielsApi } from "@/services/materielsApi";
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Save } from "lucide-react-native";
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
    Switch,
    TextInput,
    View
} from "react-native";

export default function MaterielNewScreen() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  const { clients, loading: clientsLoading } = useClientsList();
  
  const [saving, setSaving] = useState(false);
  const [showAchatDatePicker, setShowAchatDatePicker] = useState(false);
  const [showCommandeDatePicker, setShowCommandeDatePicker] = useState(false);
  const [selectedAchatDate, setSelectedAchatDate] = useState(new Date());
  const [selectedCommandeDate, setSelectedCommandeDate] = useState(new Date());
  const [tempSelectedAchatDate, setTempSelectedAchatDate] = useState(new Date());
  const [tempSelectedCommandeDate, setTempSelectedCommandeDate] = useState(new Date());
  
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    reference: '',
    etat: '',
    type_materiel: '',
    date_achat: '',
    date_commande_fournisseur: '',
    nom_fournisseur: '',
    quantite_total: 1,
    client_id: null as number | null,
    os: '',
    commentaire: '',
    is_obsolete: false,
  });

  // Trouver le client sélectionné
  const selectedClient = clients.find(client => client.id === formData.client_id);

  // Options pour les sélecteurs
  const typeMaterielOptions = [
    { label: 'PC PORTABLE', value: 'PC PORTABLE' },
    { label: 'ORDINATEUR DE BUREAU', value: 'ORDINATEUR DE BUREAU' },
    { label: 'ONDULEUR', value: 'ONDULEUR' },
    { label: 'SWITCH', value: 'SWITCH' },
    { label: 'BARETTE DE RAM', value: 'BARETTE DE RAM' },
    { label: 'TAMBOUR IMPRIMANTE', value: 'TAMBOUR IMPRIMANTE' },
    { label: 'TONER IMPRIMANTE', value: 'TONER IMPRIMANTE' },
    { label: 'CARTOUCHE', value: 'CARTOUCHE' },
    { label: 'IMPRIMANTE', value: 'IMPRIMANTE' },
    { label: 'SCANNER', value: 'SCANNER' },
    { label: 'SOURIS SANS FIL', value: 'SOURIS SANS FIL' },
    { label: 'CLAVIER SANS FIL', value: 'CLAVIER SANS FIL' },
    { label: 'CLAVIER + SOURIS SANS FIL', value: 'CLAVIER + SOURIS SANS FIL' },
    { label: 'STOCKAGE SAN/NAS', value: 'STOCKAGE SAN/NAS' },
    { label: 'NAS', value: 'NAS' },
    { label: 'HDD', value: 'HDD' },
    { label: 'LECTEUR DVD', value: 'LECTEUR DVD' },
    { label: 'SOLUTION DE SECURITE', value: 'SOLUTION DE SECURITE' },
    { label: 'BARRE DE SON', value: 'BARRE DE SON' },
    { label: 'ENSEMBLE CLAVIER ET SOURIS', value: 'ENSEMBLE CLAVIER ET SOURIS' },
    { label: 'ECRAN LED', value: 'ECRAN LED' },
    { label: 'ECRAN LCD', value: 'ECRAN LCD' },
    { label: 'SSD', value: 'SSD' },
    { label: 'CHANGEMENT DE DALLE', value: 'CHANGEMENT DE DALLE' },
    { label: 'SUPPORT ECRAN PC', value: 'SUPPORT ECRAN PC' },
    { label: 'WEBCAM', value: 'WEBCAM' },
    { label: 'TV', value: 'TV' },
    { label: 'CABLE', value: 'CABLE' },
    { label: 'ADAPTEUR', value: 'ADAPTEUR' },
    { label: 'BRAS ECRAN', value: 'BRAS ECRAN' },
    { label: 'TABLET A STYLET', value: 'TABLET A STYLET' },
    { label: 'COMUTATEUR', value: 'COMUTATEUR' },
    { label: 'BORNE WIFI', value: 'BORNE WIFI' },
    { label: 'CASQUE AUDIO', value: 'CASQUE AUDIO' },
    { label: 'ACCESSOIRES', value: 'ACCESSOIRES' },
    { label: 'AUTRE', value: 'AUTRE' },
  ];

  const etatOptions = [
    { label: 'Neuf', value: 'Neuf' },
    { label: 'Excellent', value: 'Excellent' },
    { label: 'Bon', value: 'Bon' },
    { label: 'Moyen', value: 'Moyen' },
    { label: 'Mauvais', value: 'Mauvais' },
    { label: 'Défectueux', value: 'Défectueux' },
  ];

  const osOptions = [
    { label: 'Windows 7', value: 'Windows 7' },
    { label: 'Windows 10', value: 'Windows 10' },
    { label: 'Windows 11', value: 'Windows 11' },
    { label: 'macOS', value: 'macOS' },
    { label: 'Autre', value: 'Autre' },
  ];

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
    if (!formData.nom.trim() || !formData.type_materiel.trim()) {
      Alert.alert("Erreur", "Le nom et le type de matériel sont obligatoires");
      return;
    }

    if (!formData.client_id) {
      Alert.alert("Erreur", "Veuillez sélectionner un client");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const createData = {
        nom: formData.nom.trim(),
        reference: formData.reference.trim() || null,
        etat: formData.etat.trim() || null,
        type_materiel: formData.type_materiel.trim(),
        date_achat: formatDateForAPI(formData.date_achat),
        date_commande_fournisseur: formatDateForAPI(formData.date_commande_fournisseur),
        nom_fournisseur: formData.nom_fournisseur.trim() || null,
        quantite_total: formData.quantite_total,
        client_id: formData.client_id,
        os: formData.os.trim() || null,
        commentaire: formData.commentaire.trim() || null,
        is_obsolete: formData.is_obsolete,
      } as any;

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

  const handleCommandeDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowCommandeDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedCommandeDate(selectedDate);
      } else {
        setSelectedCommandeDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          date_commande_fournisseur: selectedDate.toISOString().split('T')[0]
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

  const handleConfirmCommandeDate = () => {
    setSelectedCommandeDate(tempSelectedCommandeDate);
    setFormData(prev => ({
      ...prev,
      date_commande_fournisseur: tempSelectedCommandeDate.toISOString().split('T')[0]
    }));
    setShowCommandeDatePicker(false);
  };

  const handleCancelAchatDate = () => {
    setTempSelectedAchatDate(selectedAchatDate);
    setShowAchatDatePicker(false);
  };

  const handleCancelCommandeDate = () => {
    setTempSelectedCommandeDate(selectedCommandeDate);
    setShowCommandeDatePicker(false);
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

  const renderNumberInput = (label: string, field: keyof typeof formData, placeholder: string) => (
    <View style={styles.inputGroup}>
      <Caption style={styles.label}>{label}</Caption>
      <TextInput
        style={styles.numberInput}
        value={formData[field].toString()}
        onChangeText={(value) => updateFormField(field, parseInt(value) || 0)}
        placeholder={placeholder}
        keyboardType="numeric"
      />
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

            {/* Nom du matériel */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Nom du matériel *</Caption>
              <TextInput
                style={styles.textInput}
                value={formData.nom}
                onChangeText={(value) => updateFormField('nom', value)}
                placeholder="Nom du matériel"
                autoCapitalize="words"
              />
            </View>

            {/* Référence */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Référence</Caption>
              <TextInput
                style={styles.textInput}
                value={formData.reference}
                onChangeText={(value) => updateFormField('reference', value)}
                placeholder="Référence du matériel"
                autoCapitalize="characters"
              />
            </View>

            {/* Type de matériel */}
            {renderPicker('Type de matériel *', 'type_materiel', typeMaterielOptions, formData.type_materiel)}

            {/* État */}
            {renderPicker('État', 'etat', etatOptions, formData.etat)}

            {/* Quantité totale */}
            {renderNumberInput('Quantité totale *', 'quantite_total', '1')}
          </View>

          {/* Dates et fournisseur */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Dates et fournisseur</Heading2>
            
            {/* Date d'achat */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date d&apos;achat *</Caption>
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

            {/* Date commande fournisseur */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date commande fournisseur</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedCommandeDate(selectedCommandeDate);
                  setShowCommandeDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.date_commande_fournisseur ? formatDateForDisplay(formData.date_commande_fournisseur) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Nom du fournisseur */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Nom du fournisseur</Caption>
              <TextInput
                style={styles.textInput}
                value={formData.nom_fournisseur}
                onChangeText={(value) => updateFormField('nom_fournisseur', value)}
                placeholder="Nom du fournisseur"
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Système et statut */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Système et statut</Heading2>
            
            {/* Système d'exploitation */}
            {renderPicker('Système d\'exploitation', 'os', osOptions, formData.os)}

            {/* Matériel obsolète */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Matériel obsolète</Caption>
              <View style={styles.switchContainer}>
                <Switch
                  value={formData.is_obsolete}
                  onValueChange={(value) => updateFormField('is_obsolete', value)}
                  trackColor={{ false: '#d1d5db', true: '#2563eb' }}
                  thumbColor={formData.is_obsolete ? '#fff' : '#f4f3f4'}
                />
                <BodyText style={styles.switchLabel}>
                  {formData.is_obsolete ? 'Obsolète' : 'Actuel'}
                </BodyText>
              </View>
            </View>

            {/* Commentaire */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Commentaire</Caption>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.commentaire}
                onChangeText={(value) => updateFormField('commentaire', value)}
                placeholder="Ajoutez un commentaire sur ce matériel..."
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
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
                <BodyText style={styles.modalTitle}>Sélectionner une date d&apos;achat</BodyText>
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

      {/* Modal pour le sélecteur de date de commande */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showCommandeDatePicker}
          onRequestClose={() => setShowCommandeDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelCommandeDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date de commande</BodyText>
                <Pressable 
                  onPress={handleConfirmCommandeDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedCommandeDate}
                  mode="date"
                  display="spinner"
                  onChange={handleCommandeDateChange}
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
        showCommandeDatePicker && (
          <DateTimePicker
            value={selectedCommandeDate}
            mode="date"
            display="default"
            onChange={handleCommandeDateChange}
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