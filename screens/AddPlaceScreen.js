import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddPlaceScreen() {

    const [mushroomName, setMushroomName] = useState("");

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Anna sienen nimi</Text>

            <TextInput
                style={styles.input}
                placeholder="Esim. Kanttarelli"
                value={mushroomName}
                onChangeText={setMushroomName}
            />

            <Button title="Tallenna" onPress={handleSave} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#f6ddddff",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
});