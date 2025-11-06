import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from 'expo-location';

export default function MapScreen() {
    const [location, setLocation] = useState(null);
    const [markers, setMarkers] = useState([]);

    // Haetaan käyttäjän nykyinen sijainti
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Paikannus edtetty', 'Sovellus tarvitsee paikannusoikeudet toimiakseen.');
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
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

    // Renderöidään kartta ja markerit
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
                            description="Pitkällä painalluksella lisätty paikka"
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
});