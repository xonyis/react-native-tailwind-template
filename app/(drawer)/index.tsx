import { BodyText, Caption, Heading1, Heading3 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { ThemedView } from "@/components/ThemedView";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { ScrollView, View } from "react-native";

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: "#fff"}}>
      <ScrollView style={{ flex: 1 }} contentInsetAdjustmentBehavior="automatic">
        <ThemedView className="p-6 gap-4" lightColor="#ffffff" darkColor="#000000">
          <Heading1 style={{ color: "#4C4D5C", textAlign: "center", marginTop: 40, marginBottom: 10 }}>
            Dashboard
          </Heading1>
                    
          <BodyText style={{ color: "#666" }}>
            Voici votre tableau de bord principal avec toutes les informations importantes.
          </BodyText>

          <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <Heading3 style={{ color: "#1e40af", marginBottom: 8 }}>
              Statistiques du jour
            </Heading3>
            <BodyText style={{ color: "#1e40af" }}>
              Consultez vos métriques en temps réel
            </BodyText>
            <Caption style={{ color: "#64748b", marginTop: 4 }}>
              Dernière mise à jour : il y a 5 minutes
            </Caption>
          </View>

          <View className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <Heading3 style={{ color: "#065f46", marginBottom: 8 }}>
              Actions rapides
            </Heading3>
            <BodyText style={{ color: "#065f46" }}>
              Accédez rapidement à vos tâches principales
            </BodyText>
          </View>
          
          {/* Espace en bas pour éviter que le FAB cache le contenu */}
          <View style={{ height: 80 }} />
        </ThemedView>
      </ScrollView>
      <FAB onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
    </View>
  );
}



