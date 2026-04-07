import { create } from 'zustand';
import type { Dog } from '../types';

const API_COL = 'https://api.restful-api.dev/objects';

interface DogStore {
  dogs: Dog[];
  isLoading: boolean;
  loadDogs: () => Promise<void>;
  addDog: (dog: Dog) => Promise<void>;
  updateDog: (dog: Dog) => Promise<void>;
  removeDog: (id: number) => Promise<void>;
  syncWithServer: () => Promise<void>;
}

export const useDogStore = create<DogStore>((set, get) => ({
  dogs: [],
  isLoading: false,

  loadDogs: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(API_COL);
      const json = await res.json();
      const filtered = json.filter(
        (item: any) => item.tag === 'my_dog_collection'
      );
      const dogs = filtered.map((item: any) => item.data as Dog);
      set({ dogs });
      localStorage.setItem('dogs', JSON.stringify(dogs));
    } catch {
      const saved = localStorage.getItem('dogs');
      if (saved) set({ dogs: JSON.parse(saved) });
    } finally {
      set({ isLoading: false });
    }
  },

  addDog: async (dog: Dog) => {
    const { dogs, syncWithServer } = get();
    const newDogs = [...dogs, dog];
    set({ dogs: newDogs });
    localStorage.setItem('dogs', JSON.stringify(newDogs));
    await syncWithServer();
  },

  updateDog: async (dog: Dog) => {
    const { dogs, syncWithServer } = get();
    const newDogs = dogs.map((d) => (d.id === dog.id ? dog : d));
    set({ dogs: newDogs });
    localStorage.setItem('dogs', JSON.stringify(newDogs));
    await syncWithServer();
  },

  removeDog: async (id: number) => {
    const { dogs, syncWithServer } = get();
    const newDogs = dogs.filter((d) => d.id !== id);
    set({ dogs: newDogs });
    localStorage.setItem('dogs', JSON.stringify(newDogs));
    await syncWithServer();
  },

  syncWithServer: async () => {
    const { dogs } = get();
    try {
      const res = await fetch(API_COL);
      const json = await res.json();
      const serverDogs = json.filter(
        (item: any) => item.tag === 'my_dog_collection'
      );
      const serverMap = new Map();
      serverDogs.forEach((item: any) => {
        if (item.data?.id) serverMap.set(item.data.id, item.id);
      });

      for (const dog of dogs) {
        const serverId = serverMap.get(dog.id);
        if (serverId) {
          await fetch(`${API_COL}/${serverId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: `dog_${dog.id}`,
              data: dog,
              tag: 'my_dog_collection',
            }),
          });
        } else {
          await fetch(API_COL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: `dog_${dog.id}`,
              data: dog,
              tag: 'my_dog_collection',
            }),
          });
        }
      }

      for (const serverDog of serverDogs) {
        if (serverDog.data?.id && !dogs.some((d) => d.id === serverDog.data.id)) {
          await fetch(`${API_COL}/${serverDog.id}`, { method: 'DELETE' });
        }
      }
    } catch (e) {
      console.warn('Sync error:', e);
    }
  },
}));