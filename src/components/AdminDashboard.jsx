import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip'; // For generating the ZIP file
import { saveAs } from 'file-saver'; // To save the ZIP file
import { signOut } from 'firebase/auth'; // Import signOut function
import { auth } from '../firebase'; // Import Firebase authentication

export default function AdminDashboard() {
    const [form, setForm] = useState({ name: '', year: '', price: '', registration: '', image: '' });
    const [cars, setCars] = useState([]);
    const nav = useNavigate();
  
    const handleChange = (e) => {
      const { name, value, files } = e.target;
      if (name === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => setForm((f) => ({ ...f, image: reader.result }));
        reader.readAsDataURL(files[0]);
      } else {
        setForm((f) => ({ ...f, [name]: value }));
      }
    };
  
    const submit = async () => {
      await addDoc(collection(db, 'cars'), form);
      alert('Car added!');
      setForm({ name: '', year: '', price: '', registration: '', image: '' });
      loadCars(); // refresh list
    };
  
    const loadCars = async () => {
      const snap = await getDocs(collection(db, 'cars'));
      setCars(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
  
    const handleDelete = async (id) => {
      const carDoc = doc(db, 'cars', id);
      await deleteDoc(carDoc);
      loadCars(); // refresh list
    };
  
    const handleEdit = (car) => {
      setForm({
        name: car.name,
        year: car.year,
        price: car.price,
        registration: car.registration,
        image: car.image,
      });
    };
  
    const handleUpdate = async (id) => {
      const carDoc = doc(db, 'cars', id);
      await updateDoc(carDoc, form);
      alert('Car updated!');
      loadCars(); // refresh list
      setForm({ name: '', year: '', price: '', registration: '', image: '' }); // Clear form
    };
  
    const handleDownload = async () => {
      const zip = new JSZip();
      const carData = [];
  
      // Add each car's image and details to the ZIP
      cars.forEach((car, index) => {
        zip.file(`${car.name}.txt`, `Name: ${car.name}\nYear: ${car.year}\nPrice: ₹${car.price}\nregistration: ${car.registration}`);
        if (car.image) {
          zip.file(`${car.name}.jpg`, car.image.split(',')[1], { base64: true });
        }
        carData.push(`${car.name}, ${car.year}, ₹${car.price}`);
      });
  
      // Generate ZIP file
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'cars.zip');
    };
  
    const logout = async () => {
      try {
        await signOut(auth); // Sign out the user
        nav('/'); // Redirect to login or home page after logout
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };
  
    useEffect(() => {
      loadCars();
    }, []);
  
    return (
      <div className="container">
        <div className="header-buttons">
          <button onClick={() => nav('/')}>← Back to Search</button>
          <button onClick={logout}>Logout</button>
        </div>
  
        <h2>Add Car</h2>
        <input
          type="text"
          name="name"
          placeholder="Car Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="year"
          placeholder="Year"
          value={form.year}
          onChange={handleChange}
        />
        <input
          type="text"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />
        <input
          type="text"
          name="registration"
          placeholder="Registration Number"
          value={form.registration}
          onChange={handleChange}
        />
        <input type="file" name="image" accept="image/*" onChange={handleChange} />
        <button onClick={submit}>Submit</button>
  
        <h2 style={{ marginTop: '40px' }}>All Cars</h2>
        <button onClick={handleDownload}>Download Cars as ZIP</button>
        <div className="grid">
          {cars.map((car) => (
            <div key={car.id} className="card">
              <img src={car.image} alt={car.name} />
              <h3>{car.name}</h3>
              <p>Year: {car.year}</p>
              <p>Price: ₹{car.price}</p>
              <p>registration: {car.registration}</p>
              <button onClick={() => handleEdit(car)}>Edit</button>
              <button onClick={() => handleDelete(car.id)}>Delete</button>
              {form.name === car.name && (
                <button onClick={() => handleUpdate(car.id)}>Update</button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  

