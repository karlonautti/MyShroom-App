import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function MapScreen() {
    const [location, setLocation] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Lisää markerin kartalle pitkällä painalluksella
    const handleLongPress = (event) => {
        const newMarker = {
            coordinate: event.nativeEvent.coordinate,
            key: Math.random().toString(),
        };
        setMarkers([...markers, newMarker]);
    };

    //Näytetään latausilmoitus, kun sijaintia haetaan
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Haetaan sijaintia...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {location && (
                <MapView
                    style={styles.map}
                    initialRegion={location}
                    showsUserLocation={true}
                    onLongPress={handleLongPress}
                >
                    {markers.map((marker) => (
                        <Marker
                            key={marker.key}
                            coordinate={marker.coordinate}
                            title="Sienipaikka"
                            description="Lisätty pitkällä painalluksella"
                            pinColor="#DAA520"
                        />
                    ))}
                </MapView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
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
});