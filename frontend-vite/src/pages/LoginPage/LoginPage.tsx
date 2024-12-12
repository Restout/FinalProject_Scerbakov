import { useState } from "react";
import { DefaultService } from "../../api";
import'./LoginPage.css';
import { useNavigate } from "react-router-dom";
import {jwtDecode} from 'jwt-decode';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await DefaultService.postLogin(formData);
            if (response.token) {
                const userId = (jwtDecode(response.token) as {id: string}).id;
                localStorage.setItem('token', response.token);
                localStorage.setItem('userId', userId);
                setMessage('Login successful!');
                navigate('/');
            } else {
                setMessage('Login failed.');
            }
        } catch (error) {
            setMessage((error as {message: string}).message || 'Login failed.');
        }
    };

    return (
        <div className='container'>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
            <br></br>
            <button onClick={() => navigate('/register')}>Go to Register</button>
        </div>
    );
};

export default LoginPage;

