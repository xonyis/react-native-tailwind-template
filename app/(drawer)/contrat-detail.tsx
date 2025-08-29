import { BodyText, Caption, Heading1, Heading2, Heading3 } from '@/components/CustomText';
import { FAB } from '@/components/FAB';
import { useAuth } from '@/context/AuthContext';
import { useContratDetail } from '@/hooks/useContratDetail';
import { contratsApi } from '@/services/contratsApi';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CalendarClock, Edit, FileText, Mail, MapPin, Phone, Signature, Trash } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function ContratDetailPage() {
  const navigation = useNavigation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const contratId = id ? parseInt(id) : null;
  const { token } = useAuth();
  
  const { contrat, loading, error } = useContratDetail(contratId);

  const handleEdit = () => {
    if (contrat) {
      router.push({
        pathname: '/(drawer)/contrat-edit',
        params: { id: contrat.id.toString() }
      });
    }
  };

  const handleBack = () => {
    router.push('/(drawer)/contrats');
  };

  const handleDelete = () => {
    if (!contrat || !token) return;

    Alert.alert(
      "Supprimer le contrat",
      `Êtes-vous sûr de vouloir supprimer le contrat "${contrat.type_contrat}" ?\n\nCette action ne peut pas être annulée.`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await contratsApi.deleteContrat(contrat.id, token);
              
              Alert.alert(
                "Contrat supprimé",
                "Le contrat a été supprimé avec succès.",
                [
                  {
                    text: "OK",
                    onPress: () => router.push('/(drawer)/contrats')
                  }
                ]
              );
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert(
                "Erreur",
                error instanceof Error 
                  ? error.message 
                  : "Impossible de supprimer le contrat"
              );
            }
          },
        },
      ]
    ); 
  };

  const getStatusColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'en cours':
        return '#10b981';
      case 'termine':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getDaysRemaining = (dateString: string | null) => {
    if (!dateString) return null;
    const expirationDate = new Date(dateString);
    const today = new Date();
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    expirationDate.setHours(0, 0, 0, 0);
    
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

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
          {error || 'Contrat non trouvé'}
        </BodyText>
        <Pressable style={styles.button} onPress={handleBack}>
          <BodyText style={styles.buttonText}>Retour aux contrats</BodyText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Détail Contrat</Heading2>
        <View style={styles.actionButtons}>
          <Pressable onPress={handleEdit} style={styles.editButton}>
            <Edit size={20} color="#2563eb" />
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <Trash size={20} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Nom du client en grand */}
        <View style={styles.clientHeader}>
          <Heading1 style={styles.clientName}>
            {contrat.client?.nom || 'Client non défini'}
          </Heading1> 
          <View className='mb-2' style={[styles.statusBadge, { backgroundColor: '#6b7280' + '20' }]}>
            <Caption style={styles.statusText}>Référence : #{contrat.id}</Caption>
          </View>
          <View className="gap-2 flex-row">
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contrat.statut) + '20' }]}>
              <Caption style={[styles.statusText, { color: getStatusColor(contrat.statut) }]}>
                {contrat.statut.charAt(0).toUpperCase() + contrat.statut.slice(1)}
              </Caption>
            </View>
            <View style={styles.contractTypeBadge}>
              <Caption style={styles.contractTypeText}>{contrat.type_contrat}</Caption>
            </View>
          </View>
        </View>

        {/* Informations du contrat */}
        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>Informations du contrat</Heading3>
          
          <View style={styles.infoRow}>
            <FileText size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Type de contrat</Caption>
              <BodyText style={styles.infoValue}>{contrat.type_contrat}</BodyText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Signature size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Date de signature</Caption>
              <BodyText style={styles.infoValue}>{formatDate(contrat.date_signature)}</BodyText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <CalendarClock size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Date d&apos;expiration</Caption>
              <BodyText style={styles.infoValue}>{formatDate(contrat.date_expiration)}</BodyText>
              {contrat.date_expiration && (
                <View style={styles.daysRemainingContainer}>
                  {(() => {
                    const daysRemaining = getDaysRemaining(contrat.date_expiration);
                    if (daysRemaining === null) return null;
                    
                    let text = '';
                    let color = '#6b7280';
                    
                    if (daysRemaining > 0) {
                      text = `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`;
                      color = daysRemaining <= 30 ? '#f59e0b' : '#10b981'; // Orange si ≤ 30 jours, vert sinon
                    } else if (daysRemaining === 0) {
                      text = 'Expire aujourd\'hui';
                      color = '#f59e0b';
                    } else {
                      text = `Expiré depuis ${Math.abs(daysRemaining)} jour${Math.abs(daysRemaining) > 1 ? 's' : ''}`;
                      color = '#ef4444';
                    }
                    
                    return (
                      <Caption style={[styles.daysRemainingText, { color }]}>
                        {text}
                      </Caption>
                    );
                  })()}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Informations du client */}
        {contrat.client && (
          <>
            {/* Contact */}
            <View style={styles.section}>
              <Heading3 style={styles.sectionTitle}>Contact</Heading3>
              
              <View style={styles.infoRow}>
                <Mail size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Email</Caption>
                  <BodyText style={styles.infoValue}>{contrat.client.email}</BodyText>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Phone size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Téléphone</Caption>
                  <BodyText style={styles.infoValue}>{contrat.client.telephone}</BodyText>
                </View>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <BodyText style={styles.infoValue}>
                    {contrat.client.adresseClient}
                  </BodyText>
                  <BodyText style={styles.infoValue}>
                    {contrat.client.codePostal} {contrat.client.ville}
                    {contrat.client.pays && `, ${contrat.client.pays}`}
                  </BodyText>
                </View>
              </View>
            </View>

            {/* Informations supplémentaires */}
            {/* {contrat.client.referenceClient && (
              <View style={styles.section}>
                <Heading3 style={styles.sectionTitle}>Informations supplémentaires</Heading3>
                
                <View style={styles.infoRow}>
                  <User size={20} color="#6b7280" />
                  <View style={styles.infoContent}>
                    <Caption style={styles.infoLabel}>Référence client</Caption>
                    <BodyText style={styles.infoValue}>{contrat.client.referenceClient}</BodyText>
                  </View>
                </View>
              </View>
            )} */}
          </>
        )}

        {/* Espace en bas */}
        <View style={{ height: 120 }} />
      </ScrollView>
      
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  clientHeader: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  clientName: {
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontWeight: "600",
    textAlign: "center",
  },
  contractTypeBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  contractTypeText: {
    color: "#1e40af",
    fontWeight: "600",
    textAlign: "center",
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
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: "#9ca3af",
    marginBottom: 2,
  },
  infoValue: {
    color: "#374151",
    fontSize: 16,
  },
  daysRemainingContainer: {
    marginTop: 4,
  },
  daysRemainingText: {
    fontSize: 12,
    fontWeight: "500",
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
});
