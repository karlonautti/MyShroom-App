import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View, Text, TextInput, Button, Modal } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MapScreen() {
    const [location, setLocation] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [currentMarkerKey, setCurrentMarkerKey] = useState(null);
    const [mushroomName, setMushroomName] = useState("");

    // Haetaan käyttäjän nykyinen sijainti
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Paikannus estetty", "Sovellus tarvitsee paikannusoikeudet toimiakseen.");
                setLoading(false);
                return;
            }

            try {
                let currentLocation = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
            } catch (error) {
                Alert.alert("Virhe", "Sijainnin hakeminen epäonnistui.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Lataa tallennetut markerit
    useEffect(() => {
        const loadMarkers = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem("markers");
                if (jsonValue) {
                    const savedMarkers = JSON.parse(jsonValue);
                    setMarkers(savedMarkers);
                }
            } catch (error) {
                console.log("Virhe merkitsijöiden latauksessa:", error);
            }
        };

        loadMarkers();
    }, []);

    // Tallennetaan markerit tietovarastoon
    const saveMarkersToStorage = async (markerList) => {
        try {
            const jsonValue = JSON.stringify(markerList);
            await AsyncStorage.setItem("markers", jsonValue);
        } catch (error) {
            console.log("Virhe markerin tallennuksessa", error);
        }
    };

    // Lisää markerin kartalle pitkällä painalluksella
    const handleLongPress = (event) => {
        const newMarker = {
            coordinate: event.nativeEvent.coordinate,
            key: Math.random().toString(),
            name: null,
        };

        // Päivittää uuden markerin listaan
        const updatedList = [...markers, newMarker];
        setMarkers(updatedList);
        saveMarkersToStorage(updatedList);

        // Avaa ponnahdusikkunan nimen syöttöä varten
        setMushroomName("");
        setCurrentMarkerKey(newMarker.key);
        setShowModal(true);
    };

    // Tallentaa nimen markerille
    const saveNameForMarker = () => {
        if (!mushroomName.trim()) {
            Alert.alert("Virhe!", "Et voi jättää nimeä tyhjäksi!");
            return;
        }

        // Käydään markerilista läpi ja korvataan muokattu markeri
        const updatedList = markers.map(marker =>
            marker.key === currentMarkerKey ? { ...marker, name: mushroomName } : marker
        );

        setMarkers(updatedList);
        saveMarkersToStorage(updatedList);

        // Suljetaan ponnahdusikkuna
        setShowModal(false);
        setMushroomName("");
        setCurrentMarkerKey(null);
    };

    // Markerin poisto
    const deleteMarker = () => {
        const updatedList = markers.filter(marker => marker.key !== currentMarkerKey);
        setMarkers(updatedList);
        saveMarkersToStorage(updatedList);

        setShowModal(false);
        setCurrentMarkerKey(null);
        setMushroomName("");
    };

    // Näytetään latausanimaatio
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Haetaan sijaintia...</Text>
            </View>
        );
    }

    const mushroomIcons = {
        Kanttarelli: require("../assets/icons/kanttarelli.png"),
        Suppilovahvero: require("../assets/icons/suppilovahvero.png"),
        Herkkutatti: require("../assets/icons/herkkutatti.png"),
        Kangashapero: require("../assets/icons/kangashapero.png"),
        Kärpässieni: require("../assets/icons/karpassieni.png"),
    }

    // Näytön sisältö
    return (
        <View style={styles.container}>
            {location && (
                <>
                    {/* karttanäkymä */}
                    <MapView
                        style={styles.map}
                        initialRegion={location}
                        showsUserLocation={true}
                        onLongPress={handleLongPress}
                    >
                        {/* markeri kartassa */}
                        {markers.map((marker) => (
                            <Marker
                                key={marker.key}
                                coordinate={marker.coordinate}
                                title={marker.name || "Sienipaikka"}
                                // pinColor="#0e08d1ff"

                                image={marker.name ? mushroomIcons[marker.name] : undefined}

                                onCalloutPress={() => {
                                    setCurrentMarkerKey(marker.key);
                                    setMushroomName(marker.name || "");
                                    setShowModal(true);
                                }}
                            />
                        ))}
                    </MapView>

                    {/* Ponnahdusikkuna */}
                    <Modal
                        visible={showModal}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setShowModal(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalBox}>
                                <Text style={{ fontSize: 18, marginBottom: 10 }}>
                                    Anna sienen nimi
                                </Text>

                                {/* tekstinsyöttö */}
                                <TextInput
                                    style={styles.input}
                                    placeholder="Esim. Kanttarelli"
                                    value={mushroomName}
                                    onChangeText={setMushroomName}
                                />

                                {/* "tallennus"- ja "poisto" -napit */}
                                <Button title="Tallenna" color="green" onPress={saveNameForMarker} />
                                <Button title="Poista" color="red" onPress={deleteMarker} />
                                <Button title="Sulje" color="gray" onPress={() => setShowModal(false)} />
                            </View>
                        </View>
                    </Modal>
                </>
            )
            }
        </View >
    );
}

// Tyylit
const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#555",
    },
    modalContainer: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "100%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        alignItems: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
});
