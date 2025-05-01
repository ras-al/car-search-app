import { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import imageCompression from 'browser-image-compression';

export default function AdminDashboard() {
  const [form, setForm] = useState({
    name: '',
    year: '',
    price: '',
    registration: '',
    image: '',
    ownership: '',
    kms: '',
  });

  const [cars, setCars] = useState([]);
  const nav = useNavigate();

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === 'image') {
      const file = files[0];
      if (!file) return;

      const options = {
        maxSizeMB: 0.9,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64String = reader.result;
          if (base64String.length > 1048487) {
            alert('Image is still too large after compression. Please use a smaller image.');
          } else {
            setForm((f) => ({ ...f, image: base64String }));
          }
        };

        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Image compression error:', error);
        alert('Failed to compress image.');
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const submit = async () => {
    await addDoc(collection(db, 'cars'), form);
    alert('Car added!');
    setForm({ name: '', year: '', price: '', registration: '', image: '', ownership: '', kms: '' });
    loadCars();
  };

  const loadCars = async () => {
    const snap = await getDocs(collection(db, 'cars'));
    setCars(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleDelete = async (id) => {
    const carDoc = doc(db, 'cars', id);
    await deleteDoc(carDoc);
    loadCars();
  };

  const handleEdit = (car) => {
    setForm({
      name: car.name,
      year: car.year,
      price: car.price,
      registration: car.registration,
      image: car.image,
      ownership: car.ownership || '',
      kms: car.kms || '',
    });
  };

  const handleUpdate = async (id) => {
    const carDoc = doc(db, 'cars', id);
    await updateDoc(carDoc, form);
    alert('Car updated!');
    loadCars();
    setForm({ name: '', year: '', price: '', registration: '', image: '', ownership: '', kms: '' });
  };

  const handleDownload = async () => {
    const zip = new JSZip();

    cars.forEach((car) => {
      zip.file(
        `${car.name}.txt`,
        `Name: ${car.name}\nYear: ${car.year}\nPrice: ₹${car.price}\nRegistration: ${car.registration}\nOwnership: ${car.ownership}\nKilometers Run: ${car.kms}`
      );
      if (car.image) {
        zip.file(`${car.name}.jpg`, car.image.split(',')[1], { base64: true });
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'cars.zip');
  };

  const logout = async () => {
    try {
      await signOut(auth);
      nav('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  return (
    <div className="container">
      <img src="/logo.png" alt="Logo" className="logo" />
      <div className="header-buttons">
        <button onClick={() => nav('/')}>← Back to Search</button>
        <button onClick={logout}>Logout</button>
      </div>

      <h2>Add Car</h2>
      <input type="text" name="name" placeholder="Car Name" value={form.name} onChange={handleChange} />
      <input type="text" name="year" placeholder="Year" value={form.year} onChange={handleChange} />
      <input type="text" name="price" placeholder="Price" value={form.price} onChange={handleChange} />
      <input type="text" name="registration" placeholder="Registration Number" value={form.registration} onChange={handleChange} />
      <input type="text" name="ownership" placeholder="Number of Ownership" value={form.ownership} onChange={handleChange} />
      <input type="text" name="kms" placeholder="Kilometers Run" value={form.kms} onChange={handleChange} />
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
            <p>Registration: {car.registration}</p>
            <p>Ownership: {car.ownership}</p>
            <p>Kilometers Run: {car.kms}</p>
            <button onClick={() => handleEdit(car)}>Edit</button>
            <button onClick={() => handleDelete(car.id)}>Delete</button>
            {form.name === car.name && <button onClick={() => handleUpdate(car.id)}>Update</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
