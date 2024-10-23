import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase.js";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const moodLevels = {
  "Heureux": 10, "Triste": 0, "Stressé": 3, "Motivé": 8, "Énergique": 9,
  "Fatigué": 2, "Anxieux": 4, "Excité": 9, "Déprimé": 1, "Satisfait": 7,
  "Frustré": 3, "Relaxé": 6, "Enthousiaste": 9, "En colère": 2, "Optimiste": 8,
  "Pessimiste": 1, "Indifférent": 5, "Reconnaissant": 9, "Mélancolique": 2, "Étonné": 6,
  "Amusé": 8, "Apaisé": 7, "Surpris": 6, "Inquiet": 4, "Confiant": 8,
  "Déterminé": 10, "Sombre": 0, "Inspiré": 9, "Nostalgique": 3, "Libre": 7
};

const ManagerHome = () => {
  const [moods, setMoods] = useState([]);
  const [employees, setEmployees] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchEmployees();
      } else {
        console.error("Aucun utilisateur connecté.");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchEmployees = async () => {
    try {
      const employeeCollection = collection(db, "employees");
      onSnapshot(employeeCollection, (snapshot) => {
        const employeesData = snapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});
        setEmployees(employeesData);
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des employés :", error);
    }
  };

  useEffect(() => {
    const moodsCollection = collection(db, "moods");
    const unsubscribeMoods = onSnapshot(moodsCollection, (snapshot) => {
      const moodsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMoods(moodsData);
    });

    return () => unsubscribeMoods();
  }, []);

  const getChartData = (employeeId = null) => {
    const labels = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString();
    }).reverse();

    if (employeeId) {
      const employeeMoods = moods.filter(mood => mood.userId === employeeId);
      const data = labels.map(date => {
        const moodEntry = employeeMoods.find(mood =>
          new Date(mood.timestamp.seconds * 1000).toLocaleDateString() === date
        );
        return moodEntry ? moodLevels[moodEntry.emotion] || 0 : 0; // Utiliser 0 au lieu de null
      });

      return {
        labels,
        datasets: [{
          label: employees[employeeId]?.name || 'Employé',
          data,
          fill: true,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.3,
        }]
      };
    } else {
      const datasets = Object.entries(employees).map(([employeeId, employee]) => {
        const employeeMoods = moods.filter(mood => mood.userId === employeeId);
        const data = labels.map(date => {
          const moodEntry = employeeMoods.find(mood =>
            new Date(mood.timestamp.seconds * 1000).toLocaleDateString() === date
          );
          return moodEntry ? moodLevels[moodEntry.emotion] || 0 : 0; // Utiliser 0 au lieu de null
        });

        return {
          label: employee.name,
          data,
          fill: true,
          borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
          tension: 0.3,
        };
      });

      return {
        labels,
        datasets,
      };
    }
  };

  const addMood = async (employeeId, mood) => {
    const moodData = {
      userId: employeeId,
      emotion: mood,
      timestamp: new Date()
    };

    try {
      await addDoc(collection(db, "moods"), moodData);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'humeur :", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <div className="bg-[#08384f] min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-white">Tableau de bord des managers</h2>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Menu
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleSignOut();
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Se déconnecter
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Mon profil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white text-white shadow-md rounded-lg p-4 mb-6">
        <h3 className="text-black text-xl font-medium">Niveau d'humeur de tous les employés</h3>
        <Line data={getChartData()} options={{
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const moodValue = tooltipItem.raw;
                  return moodValue !== null ? `Niveau d'humeur: ${moodValue}/10` : 'Aucune donnée disponible';
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 10,
            }
          }
        }} />
      </div>

      <div>
        <h3 className="text-xl text-white font-medium mb-4">Graphiques individuels des employés</h3>
        {Object.keys(employees).map((employeeId) => (
          <div key={employeeId} className="bg-white shadow-md rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-gray-600">UID: {employeeId}</h4>
            <Line data={getChartData(employeeId)} options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (tooltipItem) {
                      const moodValue = tooltipItem.raw;
                      return moodValue !== null ? `Niveau d'humeur: ${moodValue}/10` : 'Aucune donnée disponible';
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 10,
                }
              }
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerHome;
