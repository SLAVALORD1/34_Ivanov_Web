function app() {
    return {
        currentPage: 'random',
        
        pages: [
            { id: 'random', name: 'Случайный пёс' },
            { id: 'breeds', name: 'Все породы' },
            { id: 'my', name: 'Моя коллекция' },
            { id: 'facts', name: 'Факты о котах' }
        ],
        
        loading: {
            random: false,
            breeds: false,
            facts: false
        },
        
        randomDog: {
            image: '',
            breed: ''
        },
        
        breedsList: [],
        
        myDogs: [],
        
        catFact: '',
        
        newDog: {
            name: '',
            breed: '',
            comment: '',
            img: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg'
        },
        
        errors: {
            name: ''
        },

        async init() {
            const savedPage = localStorage.getItem('currentPage');
            if (savedPage && this.pages.some(p => p.id === savedPage)) {
                this.currentPage = savedPage;
            }
            
            await this.loadMyCollection();
            await this.loadRandomDog();
            await this.loadCatFact();
            
            if (this.currentPage === 'breeds') {
                await this.loadBreeds();
            }
        },

        async loadRandomDog() {
            this.loading.random = true;
            try {
                const response = await fetch('https://dog.ceo/api/breeds/image/random');
                const data = await response.json();
                
                if (data.status === 'success') {
                    this.randomDog.image = data.message;
                    const match = data.message.match(/breeds\/([^\/]+)\//);
                    this.randomDog.breed = match ? match[1].replace(/-/g, ' ') : 'неизвестная порода';
                } else {
                    throw new Error('Ошибка API');
                }
            } catch (error) {
                console.error('Ошибка загрузки собаки:', error);
                this.randomDog.image = 'https://via.placeholder.com/300x220?text=Ошибка+загрузки';
                this.randomDog.breed = 'ошибка загрузки';
            } finally {
                this.loading.random = false;
            }
        },

        async loadBreeds() {
            this.loading.breeds = true;
            try {
                const response = await fetch('https://dog.ceo/api/breeds/list/all');
                const data = await response.json();
                
                if (data.status === 'success') {
                    this.breedsList = Object.keys(data.message);
                } else {
                    throw new Error('Ошибка API');
                }
            } catch (error) {
                console.error('Ошибка загрузки пород:', error);
                this.breedsList = [];
            } finally {
                this.loading.breeds = false;
            }
        },

        async showBreedPhoto(breed) {
            try {
                const response = await fetch(`https://dog.ceo/api/breed/${breed}/images/random`);
                const data = await response.json();
                
                if (data.status === 'success') {
                    window.open(data.message, '_blank');
                } else {
                    alert('Нет фото для этой породы');
                }
            } catch (error) {
                console.error('Ошибка загрузки фото:', error);
                alert('Ошибка загрузки фото');
            }
        },

        async loadMyCollection() {
            try {
                const response = await fetch('https://api.restful-api.dev/objects');
                const data = await response.json();
                const serverDogs = data.filter(item => item.tag === 'my_dog_collection');
                
                if (serverDogs.length > 0) {
                    this.myDogs = serverDogs.map(item => item.data);
                } else {
                    const saved = localStorage.getItem('dogs');
                    this.myDogs = saved ? JSON.parse(saved) : [];
                }
                
                localStorage.setItem('dogs', JSON.stringify(this.myDogs));
            } catch (error) {
                console.warn('API недоступно, использую localStorage');
                const saved = localStorage.getItem('dogs');
                this.myDogs = saved ? JSON.parse(saved) : [];
            }
        },

        async saveMyCollection() {
            localStorage.setItem('dogs', JSON.stringify(this.myDogs));
            
            try {
                const response = await fetch('https://api.restful-api.dev/objects');
                const data = await response.json();
                const serverDogs = data.filter(item => item.tag === 'my_dog_collection');
                const serverMap = new Map();
                
                serverDogs.forEach(item => {
                    if (item.data && item.data.id) {
                        serverMap.set(item.data.id, item.id);
                    }
                });
                
                for (const dog of this.myDogs) {
                    const serverId = serverMap.get(dog.id);
                    if (serverId) {
                        await fetch(`https://api.restful-api.dev/objects/${serverId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: `dog_${dog.id}`, data: dog, tag: 'my_dog_collection' })
                        });
                    } else {
                        await fetch('https://api.restful-api.dev/objects', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: `dog_${dog.id}`, data: dog, tag: 'my_dog_collection' })
                        });
                    }
                }
                
                for (const serverDog of serverDogs) {
                    if (serverDog.data && serverDog.data.id) {
                        const exists = this.myDogs.some(dog => dog.id === serverDog.data.id);
                        if (!exists) {
                            await fetch(`https://api.restful-api.dev/objects/${serverDog.id}`, { method: 'DELETE' });
                        }
                    }
                }
            } catch (error) {
                console.warn('Не удалось синхронизировать с API:', error);
            }
        },

        async addDog() {
            this.errors.name = '';
            
            if (!this.newDog.name.trim()) {
                this.errors.name = 'Кличка обязательна для заполнения';
                return;
            }
            
            if (!this.newDog.img.trim()) {
                alert('Укажите URL фото');
                return;
            }
            
            const newDogObj = {
                id: Date.now(),
                name: this.newDog.name.trim(),
                breed: this.newDog.breed.trim() || 'неизвестная',
                comment: this.newDog.comment.trim(),
                img: this.newDog.img.trim(),
                createdAt: new Date().toLocaleString()
            };
            
            this.myDogs.push(newDogObj);
            await this.saveMyCollection();
            
            this.newDog = {
                name: '',
                breed: '',
                comment: '',
                img: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg'
            };
            
            alert(`Собака добавлена в коллекцию`);
        },

        async editDog(id) {
            const dog = this.myDogs.find(d => d.id === id);
            if (!dog) return;
            
            const newName = prompt('Введите новую кличку:', dog.name);
            if (newName && newName.trim()) dog.name = newName.trim();
            
            const newBreed = prompt('Введите породу:', dog.breed);
            if (newBreed !== null) dog.breed = newBreed.trim() || 'неизвестная';
            
            const newComment = prompt('Введите комментарий:', dog.comment || '');
            if (newComment !== null) dog.comment = newComment.trim();
            
            const newImg = prompt('Введите URL фото:', dog.img);
            if (newImg && newImg.trim()) dog.img = newImg.trim();
            
            await this.saveMyCollection();
            alert(`Собака обновлена`);
        },

        async deleteDog(id) {
            const dog = this.myDogs.find(d => d.id === id);
            if (!dog) return;
            
            if (!confirm(`Удалить собаку "${dog.name}"?`)) {
                return;
            }
            
            this.myDogs = this.myDogs.filter(dog => dog.id !== id);
            await this.saveMyCollection();
            alert(`Собака удалена из коллекции`);
        },

        async loadCatFact() {
            this.loading.facts = true;
            try {
                const response = await fetch('https://catfact.ninja/fact');
                const data = await response.json();
                this.catFact = data.fact;
            } catch (error) {
                console.error('Ошибка загрузки факта:', error);
                this.catFact = 'Не удалось загрузить факт. Попробуйте позже';
            } finally {
                this.loading.facts = false;
            }
        }
    };
}