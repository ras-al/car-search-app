import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function CarSearch() {
  const [registration, setRegistration] = useState("");
  const [carList, setCarList] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  // Fetch all cars from Firestore when component mounts
  useEffect(() => {
    const loadCars = async () => {
      const q = query(collection(db, "cars"));
      const querySnapshot = await getDocs(q);

      const cars = [];
      querySnapshot.forEach((doc) => {
        cars.push({ id: doc.id, ...doc.data() });
      });
      setCarList(cars);
    };
    loadCars();
  }, []);

  // Handle search
  const handleSearch = () => {
    if (!registration) {
      setFilteredCars(carList);
      setNotFound(false);
      return;
    }

    const lowerCaseQuery = registration.toLowerCase();
    const matchedCars = carList.filter(
      (car) =>
        car.registration?.toLowerCase().includes(lowerCaseQuery) ||
        car.name?.toLowerCase().includes(lowerCaseQuery)
    );

    if (matchedCars.length > 0) {
      setFilteredCars(matchedCars);
      setNotFound(false);
    } else {
      setFilteredCars([]);
      setNotFound(true);
    }
  };

  return (
    <div className="container">
      <img src="/logo.png" alt="Logo" className="logo" />
      <h1>ABC Cars</h1>
      <h2>Search Car</h2>
      <input
        type="text"
        placeholder="Enter Registration Number or Car Name"
        value={registration}
        onChange={(e) => setRegistration(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <button onClick={() => navigate("/login")}>Login</button>

      {notFound && <p>No cars found matching your search criteria.</p>}

      {filteredCars.length > 0 && (
        <div className="car-list">
          {filteredCars.map((car) => (
            <div key={car.id} className="car-details">
              <div className="car-image">
                <img src={car.image} alt={car.name} />
              </div>
              <div className="car-info">
                <h3>{car.name}</h3>
                <p>Year: {car.year}</p>
                <p>Price: ₹{car.price}</p>
                <p>Registration No: {car.registration}</p>
                <p>Ownership: {car.ownership || "N/A"}</p>
                <p>Kilometers Run: {car.kms || "N/A"} km</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CarSearch;
