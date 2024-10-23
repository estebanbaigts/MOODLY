import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const LoadingScreen = () => {
    const [animationFinished, setAnimationFinished] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimationFinished(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        },);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="bg-[#08384f] flex items-center justify-center h-screen">
            <div
                className={`relative transform transition-all duration-1000 ease-in-out ${animationFinished ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
            >
                <img
                    src={logo}
                    alt="Logo"
                    className={`w-24 h-24 md:w-32 md:h-32 object-contain transition-transform duration-1000 ${animationFinished ? 'scale-200' : 'scale-0'}`}
                />
            </div>
        </div>
    );
};

export default LoadingScreen;
