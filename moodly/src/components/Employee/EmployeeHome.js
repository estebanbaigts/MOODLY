import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth"; // Import signOut here
import { collection, addDoc } from "firebase/firestore";
import { query, where, orderBy, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const moodsList = [
  { label: "Heureux", score: 30 },
  { label: "Satisfait", score: 29 },
  { label: "Énergique", score: 28 },
  { label: "Excité", score: 27 },
  { label: "Motivé", score: 26 },
  { label: "Enthousiaste", score: 25 },
  { label: "Relaxé", score: 24 },
  { label: "Optimiste", score: 23 },
  { label: "Confiant", score: 22 },
  { label: "Amusé", score: 21 },
  { label: "Reconnaissant", score: 20 },
  { label: "Indifférent", score: 19 },
  { label: "Pessimiste", score: 18 },
  { label: "Triste", score: 17 },
  { label: "Fatigué", score: 16 },
  { label: "Déprimé", score: 15 },
  { label: "Inquiet", score: 14 },
  { label: "Stressé", score: 13 },
  { label: "Anxieux", score: 12 },
  { label: "Frustré", score: 11 },
  { label: "Mélancolique", score: 10 },
  { label: "Nostalgique", score: 9 },
  { label: "Inspiré", score: 8 },
  { label: "Étonné", score: 7 },
  { label: "Libre", score: 6 },
  { label: "Déterminé", score: 5 },
  { label: "Apaisé", score: 4 },
  { label: "Surpris", score: 3 },
  { label: "Sombre", score: 2 },
  { label: "En colère", score: 1 },
  { label: "Motivé", score: 0 },
];

const EmployeeHome = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [emotion, setEmotion] = useState("");
  const [selectedScore, setSelectedScore] = useState(null);
  const [comment, setComment] = useState("");
  const [moodHistory, setMoodHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true); 
  const navigate = useNavigate();
  const [quoteVisible, setQuoteVisible] = useState(false);

  const quotes = [
    "Chaque jour est une nouvelle chance de réussir.",
    "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.",
    "Il n'y a pas de vent favorable pour celui qui ne sait où il va.",
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Utilisateur connecté :", user);
        setCurrentUser(user);
        setTimeout(() => setQuoteVisible(true), 1000);
        fetchMoodHistory(user.uid); 
      } else {
        console.error("Aucun utilisateur connecté. Redirection vers EmployeeLogin.");
        navigate("/");
      }
    });

    return unsubscribe;
  }, [navigate]);

  const fetchMoodHistory = async (userId) => {
    setLoadingHistory(true);
    try {
      const moodsQuery = query(
        collection(db, "moods"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(moodsQuery);
      const moods = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMoodHistory(moods);
      setLoadingHistory(false);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique des humeurs :", error);
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      console.error("Aucun utilisateur connecté.");
      return;
    }

    console.log("Soumission de l'émotion :", emotion);

    try {
      await addDoc(collection(db, "moods"), {
        userId: currentUser.uid,
        emotion,
        score: selectedScore,
        comment,
        timestamp: new Date(),
      });

      alert("Émotion enregistrée avec succès !");
      setEmotion("");
      setSelectedScore(null);
      setComment("");
      fetchMoodHistory(currentUser.uid); 
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'émotion :", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-[#08384f] min-h-screen">
      <h2 className="text-2xl text-white font-bold mb-4">Page d'accueil de l'employé</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-lg rounded-lg p-4">
        <label className="block mb-2">
          Choisissez votre émotion :
          <select
            value={emotion}
            onChange={(e) => {
              const selectedMood = moodsList.find(mood => mood.label === e.target.value);
              setEmotion(e.target.value);
              setSelectedScore(selectedMood ? selectedMood.score : null);
            }}
            required
            className="block w-full p-2 border rounded-md"
          >
            <option value="">Sélectionnez une émotion</option>
            {moodsList.map((mood, index) => (
              <option key={index} value={mood.label}>
                {mood.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-2">
          Commentaire (optionnel) :
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Expliquez pourquoi vous ressentez cela..."
            className="block w-full p-2 border rounded-md"
          />
        </label>

        <button type="submit" className="w-full bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 transition duration-300">
          Enregistrer l'émotion
        </button>
      </form>

      {quoteVisible && (
        <div className="mt-10 p-4 bg-white rounded-lg shadow-lg max-w-md animate-fadeIn">
          <p className="text-center text-gray-700 font-semibold">
            {quotes[Math.floor(Math.random() * quotes.length)]}
          </p>
        </div>
      )}

      <div className="mt-8 w-full max-w-md bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-bold mb-4 text-center text-gray-700">Historique des émotions</h3>
        {loadingHistory ? (
          <p className="text-center text-gray-500">Chargement de l'historique...</p>
        ) : moodHistory.length === 0 ? (
          <p className="text-center text-gray-500">Aucun historique d'émotions pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {moodHistory.map((mood) => (
              <li key={mood.id} className="p-4 bg-gray-100 rounded-lg shadow">
                <p><strong>Émotion :</strong> {mood.emotion}</p>
                <p><strong>Score :</strong> {mood.score}</p>
                {mood.comment && <p><strong>Commentaire :</strong> {mood.comment}</p>}
                <p className="text-sm text-gray-500">
                  Enregistré le {new Date(mood.timestamp.seconds * 1000).toLocaleDateString()} à {new Date(mood.timestamp.seconds * 1000).toLocaleTimeString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <nav className="fixed bottom-4 left-4 right-4 bg-gray-600 shadow-lg rounded-lg p-4 flex justify-around">
        <button
          onClick={() => navigate('/')}
          className="transition duration-300 hover:bg-gray-200 rounded-lg p-2"
        >
          Deconnexion
        </button>
      </nav>
    </div>
  );
};

export default EmployeeHome;