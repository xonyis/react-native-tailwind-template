import { BodyText, Caption, Heading3 } from '@/components/CustomText';
import { Client } from '@/services/ClientsApi';
import { Edit, Eye, Mail, MapPin, Phone, User } from 'lucide-react-native';
import React from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';


export type ClientListVariant = 'card' | 'compact' | 'detailed';

interface ClientListProps {
  clients: Client[];
  loading?: boolean;
  onRefresh?: () => void;
  onClientPress?: (client: Client) => void;
  onClientEdit?: (client: Client) => void;
  variant?: ClientListVariant;
  showActions?: boolean;
  emptyMessage?: string;
  containerStyle?: ViewStyle;
  cardStyle?: ViewStyle;
}

interface ClientCardProps {
  client: Client;
  variant: ClientListVariant;
  onClientPress?: (client: Client) => void;
  onClientEdit?: (client: Client) => void;
  showActions?: boolean;
  cardStyle?: ViewStyle;
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  variant,
  onClientPress,
  onClientEdit,
  showActions,
  cardStyle,
}) => {
  const handlePress = () => {
    onClientPress?.(client);
  };

  const handleEdit = () => {
    Alert.alert(
      'Modifier le client',
      `Voulez-vous modifier ${client.nom} ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Modifier',
          style: 'default',
          onPress: () => onClientEdit?.(client),
        },
      ]
    );
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
            <Heading3 style={styles.compactName}>{client.nom}</Heading3>
            <BodyText style={styles.compactEmail}>{client.adresseEmail1 || 'Aucun email'}</BodyText>
          </View>
          <View style={styles.compactIcons}>
            <User size={16} color="#666" />
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
          <Heading3 style={styles.detailedName}>{client.nom}</Heading3>
          {client.typeClient && (
            <Caption style={styles.clientType}>{client.typeClient}</Caption>
          )}
        </View>

        <View style={styles.detailedInfo}>
          {client.adresseEmail1 && (
            <View style={styles.infoRow}>
              <Mail size={16} color="#666" />
              <BodyText style={styles.infoText}>{client.adresseEmail1}</BodyText>
            </View>
          )}
          
          {client.numeroTel1 && (
            <View style={styles.infoRow}>
              <Phone size={16} color="#666" />
              <BodyText style={styles.infoText}>{client.numeroTel1}</BodyText>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <MapPin size={16} color="#666" />
            <BodyText style={styles.infoText}>
              {client.adresseClient}, {client.ville} {client.codePostal}
            </BodyText>
          </View>

          {client.referenceClient && (
            <View style={styles.raisonSocial}>
              <Caption style={styles.raisonText}>
                Référence: {client.referenceClient}
              </Caption>
            </View>
          )}
        </View>

        {showActions && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onClientPress?.(client)}
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
      <Heading3 style={styles.defaultName}>{client.nom}</Heading3>
      <BodyText style={styles.defaultEmail}>{client.adresseEmail1 || 'Aucun email'}</BodyText>
      <BodyText style={styles.defaultPhone}>{client.numeroTel1 || 'Aucun téléphone'}</BodyText>
      <BodyText style={styles.defaultAddress}>
        {client.adresseClient}, {client.ville} {client.codePostal}
      </BodyText>
      {client.referenceClient && (
        <Caption style={styles.defaultRaison}>
          Référence: {client.referenceClient}
        </Caption>
      )}
    </TouchableOpacity>
  );
};

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  loading = false,
  onRefresh,
  onClientPress,
  onClientEdit,
  variant = 'card',
  showActions = false,
  emptyMessage = 'Aucun client trouvé',
  containerStyle,
  cardStyle,
}) => {
  const renderClient = ({ item }: { item: Client }) => (
    <ClientCard
      client={item}
      variant={variant}
      onClientPress={onClientPress}
      onClientEdit={onClientEdit}
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
        data={clients}
        renderItem={renderClient}
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
          clients.length === 0 ? styles.emptyContentContainer : undefined
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
  compactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  compactEmail: {
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
  defaultName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  defaultEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  defaultPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  defaultAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  defaultRaison: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
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
  detailedName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  clientType: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
  raisonSocial: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  raisonText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
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
  actionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
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
});