import { useState, useEffect } from 'react';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';

const API_DOG = 'https://dog.ceo/api';

export const BreedsList = () => {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const res = await fetch(`${API_DOG}/breeds/list/all`);
        const json = await res.json();
        setBreeds(Object.keys(json.message));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchBreeds();
  }, []);

  const showRandomImage = async (breed: string, btn: HTMLButtonElement) => {
    btn.disabled = true;
    btn.textContent = '...';
    try {
      const res = await fetch(`${API_DOG}/breed/${breed}/images/random`);
      const json = await res.json();
      if (json.status === 'success') {
        window.open(json.message, '_blank');
      } else {
        alert('Нет фото');
      }
    } catch {
      alert('Ошибка');
    } finally {
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Фото';
      }, 1000);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="section">
      <h2>Все породы</h2>
      <div className="cards-grid">
        {breeds.map((breed) => (
          <div className="card" key={breed}>
            <div className="card-content">
              <h3>{breed}</h3>
              <button
                className="vw"
                onClick={(e) => showRandomImage(breed, e.currentTarget)}
              >
                Фото
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};