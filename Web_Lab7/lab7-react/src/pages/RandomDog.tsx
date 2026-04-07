import { useState, useEffect } from 'react';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';

const API_DOG = 'https://dog.ceo/api';

export const RandomDog = () => {
  const [image, setImage] = useState<string | null>(null);
  const [breed, setBreed] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomDog = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_DOG}/breeds/image/random`);
      if (!res.ok) throw new Error('Нет фото');
      const json = await res.json();
      const url = json.message;
      const match = url.match(/breeds\/([^\/]+)\//);
      setBreed(match ? match[1].replace(/-/g, ' ') : 'неизвестно');
      setImage(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomDog();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="section">
      <h2>Случайный пёс</h2>
      <div className="cards-grid">
        <div className="card">
          <img
            src={image!}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/300x220?text=Нет+фото';
            }}
            alt="Случайная собака"
          />
          <div className="card-content">
            <h3>Пёсель дня</h3>
            <div className="breed">Порода: {breed}</div>
            <button className="success" onClick={fetchRandomDog}>
              Другой песик
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};