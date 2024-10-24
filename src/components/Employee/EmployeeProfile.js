import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const EmployeeProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [moodsHistory, setMoodsHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchMoods(user.uid);
      } else {
        navigate("/");
      }
    });

    return unsubscribe;
  }, [navigate]);

  const fetchMoods = (userId) => {
    const moodsRef = collection(db, "moods");
    const q = query(moodsRef, where("userId", "==", userId));
    onSnapshot(q, (snapshot) => {
      const moodsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMoodsHistory(moodsData);
    });
  };

  return (
    <div className="flex flex-col items-center p-4 bg-[#08384f] min-h-screen">
      <h2 className="text-2xl text-white font-bold mb-4">Profil de l'employé</h2>
      {currentUser ? (
        <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-md">
          <h3 className="text-xl font-semibold">Bienvenue, {currentUser.displayName || currentUser.email}!</h3>
          <h4 className="mt-4">Historique de vos émotions :</h4>
          <ul className="mt-2">
            {moodsHistory.length > 0 ? (
              moodsHistory.map((mood) => (
                <li key={mood.id} className="border-b py-2">
                  <p><strong>Émotion :</strong> {mood.emotion}</p>
                  <p><strong>Commentaire :</strong> {mood.comment || "Aucun commentaire"}</p>
                  <p><strong>Date :</strong> {new Date(mood.timestamp.seconds * 1000).toLocaleDateString()}</p>
                </li>
              ))
            ) : (
              <p>Aucune émotion enregistrée.</p>
            )}
          </ul>
        </div>
      ) : (
        <p>Chargement du profil...</p>
      )}

      <nav className="fixed bottom-4 left-4 right-4 bg-white shadow-lg rounded-lg p-4 flex justify-around">
        <button
          onClick={() => navigate('/EmployeeHome')}
          className="transition duration-300 hover:bg-gray-200 rounded-lg p-2"
        >
          Accueil
        </button>
        <button
          onClick={() => navigate('/EmployeeProfile')}
          className="transition duration-300 hover:bg-gray-200 rounded-lg p-2"
        >
          Profil
        </button>
      </nav>
    </div>
  );
};

export default EmployeeProfile;
