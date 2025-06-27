import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import ClientDashboard from './ClientDashboard';
import FreelancerDashboard from './FreelancerDashboard';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext); 

    if (!user) {
        return <Navigate to="/login" />;
    }

    return user.role === 'freelancer' ? <FreelancerDashboard /> : <ClientDashboard />;
};

export default Dashboard;
