import { useState, useEffect } from 'react';
import { useDogStore } from '../store/dogStore';
import { DogCard } from '../components/DogCard';
import { Loader } from '../components/Loader';
import type { Dog } from '../types';

const DEFAULT_IMAGE = 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg';

export const MyCollection = () => {
  const { dogs, isLoading, loadDogs, addDog, updateDog, removeDog } = useDogStore();
  const [newDog, setNewDog] = useState({
    name: '',
    breed: '',
    comment: '',
    img: DEFAULT_IMAGE,
  });

  useEffect(() => {
    loadDogs();
  }, []);

  const handleAdd = async () => {
    if (!newDog.name.trim()) {
      alert('Введите кличку');
      return;
    }
    if (!newDog.img.trim()) {
      alert('Укажите фото');
      return;
    }
    const dog: Dog = {
      id: Date.now(),
      name: newDog.name.trim(),
      breed: newDog.breed.trim() || 'неизвестная',
      comment: newDog.comment.trim(),
      img: newDog.img.trim(),
    };
    await addDog(dog);
    setNewDog({ name: '', breed: '', comment: '', img: DEFAULT_IMAGE });
    alert('Добавлено');
  };

  const handleEdit = (dog: Dog) => {
    const newName = prompt('Кличка:', dog.name);
    if (!newName) return;
    const newBreed = prompt('Порода:', dog.breed) || dog.breed;
    const newComment = prompt('Коммент:', dog.comment) || '';
    const newImg = prompt('Фото:', dog.img) || dog.img;
    updateDog({ ...dog, name: newName, breed: newBreed, comment: newComment, img: newImg });
    alert('Обновлено');
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить?')) {
      await removeDog(id);
      alert('Удалено');
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="section">
      <h2>Моя коллекция</h2>
      <div className="form-card">
        <h3>Добавить собаку</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Кличка *"
            value={newDog.name}
            onChange={(e) => setNewDog({ ...newDog, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Порода"
            value={newDog.breed}
            onChange={(e) => setNewDog({ ...newDog, breed: e.target.value })}
          />
        </div>
        <div className="form-group">
          <textarea
            rows={2}
            placeholder="Коммент"
            value={newDog.comment}
            onChange={(e) => setNewDog({ ...newDog, comment: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Фото:</label>
          <input
            type="url"
            value={newDog.img}
            onChange={(e) => setNewDog({ ...newDog, img: e.target.value })}
          />
        </div>
        <button className="success" onClick={handleAdd}>
          Добавить
        </button>
      </div>
      <div className="cards-grid">
        {dogs.length === 0 ? (
          <div className="empty">Пусто</div>
        ) : (
          dogs.map((dog) => (
            <DogCard
              key={dog.id}
              dog={dog}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};