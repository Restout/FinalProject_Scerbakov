import { useState } from "react";
import { DefaultService } from "../../api";
import './RegisterPage.css'
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await DefaultService.postRegister(formData);
            setMessage(response.message || 'Registration successful!');
        } catch (error) {
            setMessage((error as {message: string}).message || 'Registration failed.');
        }
    };

    return (
        <div className='container'>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                />
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
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
            <br></br>
            <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
    );
};

export default RegisterPage;