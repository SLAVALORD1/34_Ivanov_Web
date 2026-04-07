import { useState, useEffect } from 'react';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';

const API_CAT = 'https://catfact.ninja/fact';

export const CatFacts = () => {
  const [fact, setFact] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFact = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_CAT);
      const json = await res.json();
      setFact(json.fact);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFact();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="section">
      <h2>Факты о котах</h2>
      <div className="cards-grid">
        <div className="card">
          <div className="card-content">
            <h3>Факт</h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.6', margin: '1rem 0' }}>
              {fact}
            </p>
            <button className="success" onClick={fetchFact}>
              Ещё
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};