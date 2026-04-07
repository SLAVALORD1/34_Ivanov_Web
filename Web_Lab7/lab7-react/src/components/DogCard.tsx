import type { Dog } from '../types';

interface Props {
  dog: Dog;
  onEdit: (dog: Dog) => void;
  onDelete: (id: number) => void;
}

export const DogCard = ({ dog, onEdit, onDelete }: Props) => (
  <div className="card">
    <img
      src={dog.img}
      onError={(e) => {
        (e.target as HTMLImageElement).src =
          'https://via.placeholder.com/300x220?text=Нет+фото';
      }}
      alt={dog.name}
    />
    <div className="card-content">
      <h3>{dog.name}</h3>
      <div className="breed">Порода: {dog.breed || 'смешанная'}</div>
      <p style={{ fontSize: '0.85rem', color: '#666' }}>{dog.comment}</p>
      <div className="btn-group">
        <button className="warning" onClick={() => onEdit(dog)}>
          Изм
        </button>
        <button className="danger" onClick={() => onDelete(dog.id)}>
          Удал
        </button>
      </div>
    </div>
  </div>
);