import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from 'expo-location';

export default function MapScreen() {
    const [location, setLocation] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef(null);

    // Haetaan käyttäjän nykyinen sijainti
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Paikannus edtetty', 'Sovellus tarvitsee paikannusoikeudet toimiakseen.');
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
                Alert.alert('Virhe, "Sijainnin hakeminen epäonnnistui.');
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

    const goToCurrentLocation = async () => {
        try {
            let currentLocation = await Location.getCurrentPositionAsync({});
            const newRegion = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            mapRef.current.animateToRegion(newRegion, 1000);
        } catch (error) {
            Alert.alert('Virhe', 'Sijainnin hakeminen epäonnistui.');
        }
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

    // Renderöidään kartta ja markerit
    return (
        <View style={styles.container}>
            {location && (
                <View>
                    <MapView
                        ref={mapRef}
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
                                description="Pitkällä painalluksella lisätty paikka"
                                pinColor="#DAA520"
                            />
                        ))}
                    </MapView>

                    <TouchableOpacity style={styles.locationButton} onPress={goToCurrentLocation}>
                        <Text style={styles.locationButtonText}>Palaa nykyiseen sijaintiin</Text>
                    </TouchableOpacity>
                </View>
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#555",
    },
    locationButton: {
        position: "absolute",
        bottom: 30,
        right: 20,
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 5,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    locationButtonText: {
        fontSize: 24,
    },
});