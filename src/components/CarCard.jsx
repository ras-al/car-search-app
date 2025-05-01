export default function CarCard({ car }) {
    return (
      <div className="card">
        <img src={car.image} alt={car.name} />
        <h3>{car.name}</h3>
        <p>Year: {car.year}</p>
        <p>Price: ₹{car.price}</p>
        <p>Engine: {car.engine}</p>
      </div>
    );
  }
  