import { useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function CarSearch() {
  const [registration, setregistration] = useState("");
  const [car, setCar] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!registration) return;

    // Fetch all cars from the database
    const q = query(collection(db, "cars"));
    const querySnapshot = await getDocs(q);

    // Loop through all cars and find the one with case-insensitive match
    let foundCar = null;
    querySnapshot.forEach((doc) => {
      const carData = doc.data();
      if (carData.registration && carData.registration.toLowerCase() === registration.toLowerCase()) {
        foundCar = carData;
      }
    });

    if (foundCar) {
      setCar(foundCar);
      setNotFound(false);
    } else {
      setCar(null);
      setNotFound(true);
    }
  };

  return (
    <div className="container">
      <h1>ABC Cars</h1>
      <h2>Search Car</h2>
      <input
        type="text"
        placeholder="Enter Registration Number (e.g., KL59E1259)"
        value={registration}
        onChange={(e) => setregistration(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {/* Move Login button here below the search button */}
      <button onClick={() => navigate("/login")}>Login</button>

      {notFound && <p>No car found.</p>}

      {car && (
        <div className="car-details">
          <div className="car-image">
            <img src={car.image} alt="Car" />
          </div>
          <div className="car-info">
            <h3>{car.name}</h3>
            <p>Year: {car.year}</p>
            <p>Price: ₹{car.price}</p>
            <p>Registration No: {car.registration}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarSearch;
