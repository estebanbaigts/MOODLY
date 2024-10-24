import React, { useState } from "react";
import { auth, db } from "../firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmailFormat = (email) => {
    const emailPatternE = /^[a-zA-Z0-9._%+-]+\.employee@example\.com$/;
    const emailPatternM = /^[a-zA-Z0-9._%+-]+\.manager@example\.com$/;

    if (emailPatternE.test(email)) {
      return "employee";
    }
    if (emailPatternM.test(email)) {
      return "manager";
    }
    return null;
  };

  const handleSignup = () => {
    navigate("/CreateEmployee");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
  
    const userType = validateEmailFormat(email);
  
    if (!userType) {
      setError("L'email doit être comme ceci : 'prenom.employee@example.com' ou 'prenom.manager@example.com'.");
      return;
    }
  
    try {
      let collectionName = "";
      if (userType === "employee") {
        collectionName = "employees";
      } else if (userType === "manager") {
        collectionName = "managers";
      }
  
      await signInWithEmailAndPassword(auth, email, password);
  
      const user = auth.currentUser;
      console.log("Utilisateur authentifié :", user); 
  
      const userCollection = collection(db, collectionName);
      const userQuery = query(userCollection, where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);
  
      if (userSnapshot.empty) {
        setError(`Cet ${userType} n'existe pas. Veuillez vérifier l'email ou contacter l'administrateur.`);
        return;
      }
  
      if (userType === "employee") {
        navigate("/EmployeeHome");
      } else if (userType === "manager") {
        navigate("/ManagerHome");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      setError("Email ou mot de passe incorrect. Veuillez réessayer.");
    }
  };
  

   return (
    <div className="flex justify-center items-center h-screen bg-[#08384f]">
      <div className="p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Welcome On Moodly
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
              placeholder="prenom.employee@example.com ou prenom.manager@example.com"
            />
          </div>
          <div className="mb-6">
            <label className="block text-white mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
              placeholder="Mot de passe"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
          <button
            type="button"
            onClick={handleSignup}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors mt-4"
          >
            Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;