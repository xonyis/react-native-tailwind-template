#!/bin/bash

# Script pour renommer un projet React Native
# Usage: ./rename-project.sh "nouveau-nom"

if [ $# -eq 0 ]; then
    echo "Usage: ./rename-project.sh \"nouveau-nom\""
    echo "Exemple: ./rename-project.sh \"mon-app\""
    exit 1
fi

NEW_NAME=$1
OLD_NAME="mon-app"
NEW_DIR_NAME=$(echo $NEW_NAME | sed 's/[^a-zA-Z0-9]/-/g')

echo "Renommage du projet de '$OLD_NAME' vers '$NEW_NAME'..."

# 1. Renommer le dossier (depuis l'extérieur)
cd ..
if [ -d "$OLD_NAME" ]; then
    mv "$OLD_NAME" "$NEW_DIR_NAME"
    echo "✓ Dossier renommé: $OLD_NAME → $NEW_DIR_NAME"
    cd "$NEW_DIR_NAME"
else
    echo "❌ Dossier $OLD_NAME non trouvé"
    exit 1
fi

# 2. Modifier package.json
if [ -f "package.json" ]; then
    sed -i '' "s/\"name\": \"$OLD_NAME\"/\"name\": \"$NEW_NAME\"/" "package.json"
    echo "✓ package.json mis à jour"
fi

# 3. Modifier app.json
if [ -f "app.json" ]; then
    sed -i '' "s/\"slug\": \"[^\"]*\"/\"slug\": \"$NEW_NAME\"/" "app.json"
    sed -i '' "s/\"name\": \"[^\"]*\"/\"name\": \"$NEW_NAME\"/" "app.json"
    echo "✓ app.json mis à jour"
fi

# 4. Modifier README.md
if [ -f "README.md" ]; then
    sed -i '' "s/$OLD_NAME/$NEW_NAME/g" "README.md"
    echo "✓ README.md mis à jour"
fi

# 5. Réinstaller les dépendances
npm install
echo "✓ Dépendances réinstallées"

echo ""
echo "🎉 Projet renommé avec succès !"
echo "Nouveau nom: $NEW_NAME"
echo "Nouveau dossier: $NEW_DIR_NAME"
echo ""
echo "Pour démarrer le projet:"
echo "cd $NEW_DIR_NAME"
echo "npm start"
