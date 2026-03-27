const API_DOG = 'https://dog.ceo/api';
const API_COL = 'https://api.restful-api.dev/objects';
const API_CAT = 'https://catfact.ninja/fact';
let d = [];

function init() {
    const root = document.getElementById('root');
    if (!root) return;
    root.innerHTML = `
        <div class="header">
            <h1>Коллекция собак</h1>
            <div class="nav-menu" id="navMenu">
                <button data-page="random" class="nav-btn active">Случайный пёс</button>
                <button data-page="breeds" class="nav-btn">Все породы</button>
                <button data-page="my" class="nav-btn">Моя коллекция</button>
                <button data-page="facts" class="nav-btn">Факты о котах</button>
            </div>
        </div>
        <div class="container" id="appContainer">
            <div class="loader">Загрузка...</div>
        </div>
        <footer>
            <p>Лабораторная работа номер 6</p>
        </footer>
    `;
}

async function loadD() {
    try {
        const r = await fetch(API_COL);
        const json = await r.json();
        d = json.filter(item => item.tag === 'my_dog_collection').map(item => item.data);
    } catch (e) {
        const s = localStorage.getItem('dogs');
        d = s ? JSON.parse(s) : [];
    }
}

async function saveD() {
    localStorage.setItem('dogs', JSON.stringify(d));
    try {
        const r = await fetch(API_COL);
        const json = await r.json();
        const srv = json.filter(item => item.tag === 'my_dog_collection');
        const map = new Map();
        srv.forEach(item => {
            if (item.data && item.data.id) map.set(item.data.id, item.id);
        });
        for (const dog of d) {
            const srvId = map.get(dog.id);
            if (srvId) {
                await fetch(`${API_COL}/${srvId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: `dog_${dog.id}`, data: dog, tag: 'my_dog_collection' })
                });
            } else {
                await fetch(API_COL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: `dog_${dog.id}`, data: dog, tag: 'my_dog_collection' })
                });
            }
        }
        for (const srvDog of srv) {
            if (srvDog.data && srvDog.data.id) {
                const exists = d.some(dog => dog.id === srvDog.data.id);
                if (!exists) {
                    await fetch(`${API_COL}/${srvDog.id}`, { method: 'DELETE' });
                }
            }
        }
    } catch (e) {
        console.warn(e);
    }
}

function loader() {
    const c = document.getElementById('appContainer');
    if (c) c.innerHTML = `<div class="loader">Загрузка</div>`;
}

function err(msg) {
    const c = document.getElementById('appContainer');
    if (c) c.innerHTML = `<div class="error">Ошибка: ${msg}</div>`;
}

function setAct(p) {
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.page === p);
    });
}

async function rnd() {
    loader();
    try {
        const r = await fetch(`${API_DOG}/breeds/image/random`);
        if (!r.ok) throw new Error('Нет фото');
        const json = await r.json();
        const u = json.message;
        const m = u.match(/breeds\/([^\/]+)\//);
        const b = m ? m[1].replace(/-/g, ' ') : 'неизвестно';
        document.getElementById('appContainer').innerHTML = `
            <div class="section">
                <h2>Случайный пёс</h2>
                <div class="cards-grid">
                    <div class="card">
                        <img src="${u}" onerror="this.src='https://via.placeholder.com/300x220?text=Нет+фото'">
                        <div class="card-content">
                            <h3>Пёсель дня</h3>
                            <div class="breed">Порода: ${b}</div>
                            <button id="newDogBtn" class="success">Другой песик</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('newDogBtn').onclick = () => rnd();
    } catch (e) {
        err(e.message);
    }
}

async function br() {
    loader();
    try {
        const r = await fetch(`${API_DOG}/breeds/list/all`);
        const json = await r.json();
        const list = Object.keys(json.message);
        let h = '';
        for (const breed of list) {
            h += `<div class="card"><div class="card-content"><h3>${breed}</h3><button class="vw" data-breed="${breed}">Фото</button></div></div>`;
        }
        document.getElementById('appContainer').innerHTML = `
            <div class="section">
                <h2>Все породы</h2>
                <div class="cards-grid">${h}</div>
            </div>
        `;
        document.querySelectorAll('.vw').forEach(btn => {
            btn.onclick = async () => {
                const breed = btn.dataset.breed;
                btn.disabled = true;
                btn.textContent = '...';
                try {
                    const r = await fetch(`${API_DOG}/breed/${breed}/images/random`);
                    const json = await r.json();
                    if (json.status === 'success') {
                        window.open(json.message, '_blank');
                        btn.textContent = '';
                    } else {
                        alert('Нет фото');
                        btn.textContent = 'Фото';
                    }
                } catch (e) {
                    alert('Ошибка');
                    btn.textContent = 'Фото';
                } finally {
                    setTimeout(() => { btn.disabled = false; }, 1000);
                }
            };
        });
    } catch (e) {
        err(e.message);
    }
}

async function my() {
    loader();
    await loadD();
    let ph = 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg';
    try {
        const r = await fetch(`${API_DOG}/breeds/image/random`);
        const json = await r.json();
        if (json.message) ph = json.message;
    } catch (e) {}
    let c = '';
    for (const dog of d) {
        c += `
            <div class="card" data-id="${dog.id}">
                <img src="${dog.img}" onerror="this.src='https://via.placeholder.com/300x220?text=Нет+фото'">
                <div class="card-content">
                    <h3>${dog.name}</h3>
                    <div class="breed">Порода: ${dog.breed || 'смешанная'}</div>
                    <p style="font-size:0.85rem;color:#666;">${dog.comment || ''}</p>
                    <div class="btn-group">
                        <button class="warning edit-btn" data-id="${dog.id}">Изм</button>
                        <button class="danger delete-btn" data-id="${dog.id}">Удал</button>
                    </div>
                </div>
            </div>
        `;
    }
    document.getElementById('appContainer').innerHTML = `
        <div class="section">
            <h2>Моя коллекция</h2>
            <div class="form-card">
                <h3>Добавить собаку</h3>
                <div class="form-group"><input type="text" id="dogName" placeholder="Кличка *"></div>
                <div class="form-group"><input type="text" id="dogBreed" placeholder="Порода"></div>
                <div class="form-group"><textarea id="dogComment" rows="2" placeholder="Коммент"></textarea></div>
                <div class="form-group"><label>Фото:</label><input type="url" id="dogImage" value="${ph}"></div>
                <button id="addDogBtn" class="success">Добавить</button>
            </div>
            <div class="cards-grid">${c || '<div class="empty">Пусто</div>'}</div>
        </div>
    `;
    document.getElementById('addDogBtn').onclick = async () => {
        const n = document.getElementById('dogName').value.trim();
        const brd = document.getElementById('dogBreed').value.trim();
        const cmt = document.getElementById('dogComment').value.trim();
        const img = document.getElementById('dogImage').value.trim();
        if (!n) { alert('Введите кличку'); return; }
        if (!img) { alert('Укажите фото'); return; }
        const newD = { id: Date.now(), name: n, breed: brd || 'неизвестная', comment: cmt, img: img };
        d.push(newD);
        await saveD();
        renderMyWithoutLoad();
        alert('Добавлено');
    };
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = async () => {
            const id = parseInt(btn.dataset.id);
            const dog = d.find(x => x.id === id);
            if (!dog) return;
            const n = prompt('Кличка:', dog.name);
            if (!n) return;
            dog.name = n;
            dog.breed = prompt('Порода:', dog.breed) || dog.breed;
            dog.comment = prompt('Коммент:', dog.comment) || '';
            const img = prompt('Фото:', dog.img);
            if (img) dog.img = img;
            await saveD();
            renderMyWithoutLoad();
            alert('Обновлено');
        };
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = async () => {
            const id = parseInt(btn.dataset.id);
            if (!confirm('Удалить?')) return;
            d = d.filter(x => x.id !== id);
            try {
                const r = await fetch(API_COL);
                const json = await r.json();
                const srvDog = json.find(item => item.tag === 'my_dog_collection' && item.data && item.data.id === id);
                if (srvDog) {
                    await fetch(`${API_COL}/${srvDog.id}`, { method: 'DELETE' });
                }
            } catch (e) {}
            localStorage.setItem('dogs', JSON.stringify(d));
            renderMyWithoutLoad();
            alert('Удалено');
        };
    });
}

function renderMyWithoutLoad() {
    let ph = 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg';
    let c = '';
    for (const dog of d) {
        c += `
            <div class="card" data-id="${dog.id}">
                <img src="${dog.img}" onerror="this.src='https://via.placeholder.com/300x220?text=Нет+фото'">
                <div class="card-content">
                    <h3>${dog.name}</h3>
                    <div class="breed">Порода: ${dog.breed || 'смешанная'}</div>
                    <p style="font-size:0.85rem;color:#666;">${dog.comment || ''}</p>
                    <div class="btn-group">
                        <button class="warning edit-btn" data-id="${dog.id}">Изм</button>
                        <button class="danger delete-btn" data-id="${dog.id}">Удал</button>
                    </div>
                </div>
            </div>
        `;
    }
    document.getElementById('appContainer').innerHTML = `
        <div class="section">
            <h2>Моя коллекция</h2>
            <div class="section-desc"></div>
            <div class="form-card">
                <h3>Добавить собаку</h3>
                <div class="form-group"><input type="text" id="dogName" placeholder="Кличка *"></div>
                <div class="form-group"><input type="text" id="dogBreed" placeholder="Порода"></div>
                <div class="form-group"><textarea id="dogComment" rows="2" placeholder="Коммент"></textarea></div>
                <div class="form-group"><label>Фото:</label><input type="url" id="dogImage" value="${ph}"></div>
                <button id="addDogBtn" class="success">Добавить</button>
            </div>
            <div class="cards-grid">${c || '<div class="empty">Пусто</div>'}</div>
        </div>
    `;
    document.getElementById('addDogBtn').onclick = async () => {
        const n = document.getElementById('dogName').value.trim();
        const brd = document.getElementById('dogBreed').value.trim();
        const cmt = document.getElementById('dogComment').value.trim();
        const img = document.getElementById('dogImage').value.trim();
        if (!n) { alert('Введите кличку'); return; }
        if (!img) { alert('Укажите фото'); return; }
        const newD = { id: Date.now(), name: n, breed: brd || 'неизвестная', comment: cmt, img: img };
        d.push(newD);
        await saveD();
        renderMyWithoutLoad();
        alert('Добавлено');
    };
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = async () => {
            const id = parseInt(btn.dataset.id);
            const dog = d.find(x => x.id === id);
            if (!dog) return;
            const n = prompt('Кличка:', dog.name);
            if (!n) return;
            dog.name = n;
            dog.breed = prompt('Порода:', dog.breed) || dog.breed;
            dog.comment = prompt('Коммент:', dog.comment) || '';
            const img = prompt('Фото:', dog.img);
            if (img) dog.img = img;
            await saveD();
            renderMyWithoutLoad();
            alert('Обновлено');
        };
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = async () => {
            const id = parseInt(btn.dataset.id);
            if (!confirm('Удалить?')) return;
            d = d.filter(x => x.id !== id);
            try {
                const r = await fetch(API_COL);
                const json = await r.json();
                const srvDog = json.find(item => item.tag === 'my_dog_collection' && item.data && item.data.id === id);
                if (srvDog) {
                    await fetch(`${API_COL}/${srvDog.id}`, { method: 'DELETE' });
                }
            } catch (e) {}
            localStorage.setItem('dogs', JSON.stringify(d));
            renderMyWithoutLoad();
            alert('Удалено');
        };
    });
}

async function facts() {
    loader();
    try {
        const r = await fetch(API_CAT);
        const json = await r.json();
        document.getElementById('appContainer').innerHTML = `
            <div class="section">
                <h2>Факты о котах</h2>
                <div class="cards-grid">
                    <div class="card">
                        <div class="card-content">
                            <h3>Факт</h3>
                            <p style="font-size:1rem;line-height:1.6;margin:1rem 0;">${json.fact}</p>
                            <button id="newFactBtn" class="success">Ещё</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('newFactBtn').onclick = () => facts();
    } catch (e) {
        err(e.message);
    }
}

init();

window.onload = async () => {
    await loadD();
    rnd();
    document.getElementById('navMenu').onclick = (e) => {
        const b = e.target.closest('.nav-btn');
        if (!b) return;
        const p = b.dataset.page;
        setAct(p);
        if (p === 'random') rnd();
        else if (p === 'breeds') br();
        else if (p === 'my') my();
        else if (p === 'facts') facts();
    };
};