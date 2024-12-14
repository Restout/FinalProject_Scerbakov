import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { DefaultService } from "../../api";
import { useNavigation } from "@react-navigation/native";

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigation = useNavigation();

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const response = await DefaultService.postRegister(formData);
            setMessage(response.message || 'Registration successful!');
            navigation.navigate('Login');
        } catch (error) {
            setMessage(error.message || 'Registration failed.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Register</Text>
            <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={(value) => handleChange("name", value)}
            />
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
            <Button title="Register" onPress={handleSubmit} />
            <Text style={styles.message}>{message}</Text>
            <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
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

export default RegisterPage;
