import { BodyText, Caption, Heading3 } from '@/components/CustomText';
import { Contrat } from '@/services/contratsApi';
import { Calendar, CalendarClock, Edit, Eye, FileText, Server } from 'lucide-react-native';
import React from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

export type ContratListVariant = 'card' | 'compact' | 'detailed';

interface ContratListProps {
  contrats: Contrat[];
  loading?: boolean;
  onRefresh?: () => void;
  onContratPress?: (contrat: Contrat) => void;
  onContratEdit?: (contrat: Contrat) => void;
  variant?: ContratListVariant;
  showActions?: boolean;
  emptyMessage?: string;
  containerStyle?: ViewStyle;
  cardStyle?: ViewStyle;
}

interface ContratCardProps {
  contrat: Contrat;
  variant: ContratListVariant;
  onContratPress?: (contrat: Contrat) => void;
  onContratEdit?: (contrat: Contrat) => void;
  showActions?: boolean;
  cardStyle?: ViewStyle;
}

const ContratCard: React.FC<ContratCardProps> = ({
  contrat,
  variant,
  onContratPress,
  onContratEdit,
  showActions,
  cardStyle,
}) => {
  const handlePress = () => {
    onContratPress?.(contrat);
  };

  const handleEdit = () => {
    Alert.alert(
      'Modifier le contrat',
      `Voulez-vous modifier le contrat ${contrat.type_contrat} ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Modifier',
          style: 'default',
          onPress: () => onContratEdit?.(contrat),
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
  
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactCard, cardStyle]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactMain}>
            <Heading3 style={styles.compactType}>{contrat.client || 'Client non défini'}</Heading3>
            <BodyText style={styles.compactClient}>{contrat.type_contrat}</BodyText>
            <BodyText style={styles.compactStatus}>
              Statut: {contrat.statut}
            </BodyText>
          </View>
          <View style={styles.compactIcons}>
            <FileText size={16} color="#666" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'detailed') {
    return (
      <TouchableOpacity
        style={[styles.detailedCard, cardStyle]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.detailedHeader}>
          <Heading3 style={styles.detailedType}>{contrat.client || 'Client non défini'}</Heading3>
          <Caption style={[styles.contratStatut, { backgroundColor: getStatusColor(contrat.statut) + '20', color: getStatusColor(contrat.statut) }]}>
            {contrat.statut.charAt(0).toUpperCase() + contrat.statut.slice(1)}
          </Caption>
        </View>

        <View style={styles.detailedInfo}>
          <View style={styles.infoRow}>
            <FileText size={16} color="#666" />
            <Text className='font-semibold' style={styles.infoText}>{contrat.type_contrat}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Calendar size={16} color="#666" />
            <BodyText style={styles.infoText}>
              Signature: {formatDate(contrat.date_signature)}
            </BodyText>
          </View>
          
          <View style={styles.infoRow}>
            <CalendarClock size={16} color="#666" />
            <BodyText style={styles.infoText}>
              Expiration: {formatDate(contrat.date_expiration)}
            </BodyText>
          </View>

          {/* Affichage des équipements si présents */}
          {(contrat.nombreServPhysique > 0 || contrat.nombreServVirtuel > 0 || contrat.nombrePcFixe > 0 || contrat.nombrePcPortable > 0) && (
            <View style={styles.equipmentRow}>
              <Server size={16} color="#666" />
              <BodyText style={styles.equipmentText}>
                {[contrat.nombreServPhysique > 0 && `${contrat.nombreServPhysique} serv. phys.`,
                  contrat.nombreServVirtuel > 0 && `${contrat.nombreServVirtuel} serv. virt.`,
                  contrat.nombrePcFixe > 0 && `${contrat.nombrePcFixe} PC fixes`,
                  contrat.nombrePcPortable > 0 && `${contrat.nombrePcPortable} PC port.`]
                  .filter(Boolean).join(', ')}
              </BodyText>
            </View>
          )}
        </View>

        {showActions && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onContratPress?.(contrat)}
            >
              <Eye size={24} color="#3D9FCD" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleEdit}
            >
              <Edit size={24} color="#FBCA35" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Default card variant
  return (
    <TouchableOpacity
      style={[styles.defaultCard, cardStyle]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Heading3 style={styles.defaultType}>{contrat.type_contrat}</Heading3>
      <BodyText style={styles.defaultClient}>{contrat.client || 'Client non défini'}</BodyText>
      <BodyText style={styles.defaultDates}>
        Signature: {formatDate(contrat.date_signature)} | Expiration: {formatDate(contrat.date_expiration)}
      </BodyText>
      <Caption style={[styles.defaultStatut, { color: getStatusColor(contrat.statut) }]}>
        Statut: {contrat.statut}
      </Caption>
    </TouchableOpacity>
  );
};

export const ContratList: React.FC<ContratListProps> = ({
  contrats,
  loading = false,
  onRefresh,
  onContratPress,
  onContratEdit,
  variant = 'card',
  showActions = false, 
  emptyMessage = 'Aucun contrat trouvé',
  containerStyle,
  cardStyle,
}) => {
  const renderContrat = ({ item }: { item: Contrat }) => (
    <ContratCard
      contrat={item}
      variant={variant}
      onContratPress={onContratPress}
      onContratEdit={onContratEdit}
      showActions={showActions}
      cardStyle={cardStyle}
    />
  );

  const getItemLayout = (data: any, index: number) => {
    const itemHeight = variant === 'compact' ? 70 : variant === 'detailed' ? 180 : 140;
    return {
      length: itemHeight,
      offset: itemHeight * index,
      index,
    };
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        data={contrats}
        renderItem={renderContrat}
        keyExtractor={(item) => item.id.toString()}
        getItemLayout={getItemLayout}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          ) : undefined
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <BodyText style={styles.emptyText}>{emptyMessage}</BodyText>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          contrats.length === 0 ? styles.emptyContentContainer : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Compact variant
  compactCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactMain: {
    flex: 1,
  },
  compactType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  compactClient: {
    fontSize: 14,
    color: '#6b7280',
  },
  compactIcons: {
    marginLeft: 12,
  },
  // Default card variant
  defaultCard: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  defaultClient: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  defaultDates: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  defaultStatut: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Detailed variant
  detailedCard: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailedType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  contratStatut: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '500',
  },
  detailedInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  compactStatus: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  equipmentText: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
});
