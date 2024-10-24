import React, { useState } from "react";
import { auth, db } from "../../firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const CreateEmployee = () => {
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = `${firstName.toLowerCase()}.employee@example.com`;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "employees", user.uid), {
        firstName,
        email: user.email,
        role: "employee",
        createdAt: serverTimestamp(),
        uid: user.uid
      });

      console.log("Employee created and stored successfully!");

      navigate("/");
    } catch (error) {
      console.error("Error creating employee:", error);
      setError(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#08384f]">
      <div className="p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Créer un compte employé</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Prénom</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
              placeholder="Prénom"
            />
          </div>
          <div className="mb-6">
            <label className="block text-white mb-2">Mot de passe</label>
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
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors"
          >
            Créer le compte
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployee;
