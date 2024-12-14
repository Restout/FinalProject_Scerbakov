import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { DefaultService } from "../../api";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { setToken } from "../../api/core/OpenAPI";

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigation = useNavigation();

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const response = await DefaultService.postLogin(formData);
            if (response.token) {
                const userId = (jwtDecode(response.token) as { id: string }).id;
                await AsyncStorage.setItem('token', response.token);
                await setToken(response.token);
                await AsyncStorage.setItem('userId', userId);
                setMessage('Login successful!');
                navigation.navigate('ShoppingLists');  // Adjust the route name as per your app
            } else {
                setMessage('Login failed.');
            }
        } catch (error) {
            setMessage(error.message || 'Login failed.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(value) => handleChange("email", value)}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                value={formData.password}
                onChangeText={(value) => handleChange("password", value)}
            />
            <Button title="Login" onPress={handleSubmit} />
            <Text style={styles.message}>{message}</Text>
            <Button title="Go to Register" onPress={() => navigation.navigate('Register')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 15,
        paddingLeft: 10,
        borderRadius: 5,
    },
    message: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default LoginPage;
