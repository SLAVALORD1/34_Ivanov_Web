function buildPage() {
    const root = document.getElementById('root');
    if (!root) return;
    
    root.innerHTML = `
        <header>
            <h1>БИТВА РЕПЕРОВ</h1>
            <p class="subtitle">Создай свою уникальную колоду из реперов!</p>
            <nav class="controls" aria-label="Управление коллекцией">
                <button id="toggleEditBtn" class="btn btn-primary" aria-label="Переключить режим редактирования">
                    Редактировать
                </button>
                <button id="addCardBtn" class="btn btn-success" style="display:none;" aria-label="Добавить новую карточку">
                    Добавить
                </button>
                <button id="resetBtn" class="btn btn-danger" aria-label="Сбросить все изменения">
                    Сброс
                </button>
            </nav>
        </header>

        <main>
            <section id="cardsContainer" class="cards-grid" aria-label="Коллекция карточек рэперов"></section>
        </main>

        <div id="addModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" aria-describedby="modalDesc">
            <div class="modal-content">
                <button class="close-modal" aria-label="Закрыть">&times;</button>
                <h2 id="modalTitle">Новый музыкант</h2>
                <p id="modalDesc" class="visually-hidden">Заполните форму для создания новой карточки рэпера</p>
                <form id="addForm">
                    <fieldset>
                        <legend>Информация о музыканте</legend>
                        <label>Тип:
                            <select id="newType" required>
                                <option value="OldSchool">Old School</option>
                                <option value="NewSchool">New School</option>
                                <option value="Underground">Underground</option>
                            </select>
                        </label>
                        <label>Ник:
                            <input type="text" id="newName" required placeholder="например: 2Pac">
                        </label>
                        <label>Фото:
                            <input type="url" id="newPhoto" required placeholder="images/foto.jpg">
                        </label>
                        <label>Бит (1-10):
                            <input type="number" id="newBeat" min="1" max="10" required>
                        </label>
                        <label>Текст (1-10):
                            <input type="number" id="newLyrics" min="1" max="10" required>
                        </label>
                        <label>Описание:
                            <textarea id="newDesc" required rows="3"></textarea>
                        </label>
                    </fieldset>
                    <button type="submit" class="btn btn-success">Создать карточку</button>
                </form>
            </div>
        </div>

        <footer>
            <p>Лабораторная работа номер 5</p>
            <p>Коллекционная карточная игра</p>
        </footer>
    `;
}

function renderCards(cards, isEditMode) {
    const container = document.getElementById('cardsContainer');
    if (!container) return;
    
    let html = '';
    for (const card of cards) {
        html += card.render(isEditMode);
    }
    
    if (html === '') {
        html = '<div class="empty-state">Нет карточек. Нажмите "Добавить"</div>';
    }
    
    container.innerHTML = html;
}

class MusicCard {
    #id;
    #name; 
    #img; 
    #beatQ; 
    #lyrQ; 
    #desc;
    
    constructor(name, img, beatQ, lyrQ, desc, id = null) {
        this.#id = id || crypto.randomUUID();
        this.#name = name;
        this.#img = img;
        this.#beatQ = +beatQ;
        this.#lyrQ = +lyrQ;
        this.#desc = desc;
    }

    get id() { return this.#id; }
    get name() { return this.#name; }
    set name(v) { this.#name = v; }
    get img() { return this.#img; }
    set img(v) { this.#img = v; }
    get beatQ() { return this.#beatQ; }
    set beatQ(v) { this.#beatQ = +v; }
    get lyrQ() { return this.#lyrQ; }
    set lyrQ(v) { this.#lyrQ = +v; }
    get desc() { return this.#desc; }
    set desc(v) { this.#desc = v; }

    toJSON() {
        return {
            t: this.constructor.name,
            id: this.#id,
            n: this.#name,
            img: this.#img,
            b: this.#beatQ,
            l: this.#lyrQ,
            d: this.#desc
        };
    }

    render(edit = false) {
        const safeId = this.#id.replace(/'/g, "\\'");
        const del = `<button class="delete-btn" onclick="app.rm('${safeId}')">✖</button>`;
        let html = '';

        if (edit) {
            html = `
                <input class="edit-input" value="${this.#name}" oninput="app.upd('${safeId}','n',this.value)">
                <input class="edit-input" value="${this.#img}" oninput="app.upd('${safeId}','img',this.value)">
                <div class="stats">
                    <label>Бит: <input type="number" class="edit-input" style="width:50px" value="${this.#beatQ}" oninput="app.upd('${safeId}','b',this.value)"></label>
                    <label>Текст: <input type="number" class="edit-input" style="width:50px" value="${this.#lyrQ}" oninput="app.upd('${safeId}','l',this.value)"></label>
                </div>
                <textarea class="edit-input" oninput="app.upd('${safeId}','d',this.value)">${this.#desc}</textarea>
            `;
        } else {
            html = `
                <h2>${this.#name}</h2>
                <div class="stats">
                    <span>Бит: ${this.#beatQ}/10</span>
                    <span>Текст: ${this.#lyrQ}/10</span>
                </div>
                <p class="desc">${this.#desc}</p>
            `;
        }
        return `<div class="card ${this.getType()}" id="${safeId}">${del}<img src="${this.#img}" alt="${this.#name}" onerror="this.src='https://foni.papik.pro/uploads/posts/2024-09/foni-papik-pro-qfsi-p-kartinki-vopros-na-prozrachnom-fone-1.png'"><div class="card-content">${html}</div></div>`;
    }

    getType() { return 'type-default'; }
}

class OldSchoolRapper extends MusicCard { getType() { return 'type-old-school'; } }
class NewSchoolRapper extends MusicCard { getType() { return 'type-new-school'; } }
class UndergroundRapper extends MusicCard { getType() { return 'type-underground'; } }

class App {
    constructor() {
        this.cards = [];
        this.edit = false;
        this.container = null;
        this.toggleBtn = null;
        this.addBtn = null;
        this.modal = null;
        this.fieldMap = { n: 'name', img: 'img', b: 'beatQ', l: 'lyrQ', d: 'desc' };
        setTimeout(() => this.init(), 10);
    }

    init() {
        this.container = document.getElementById('cardsContainer');
        this.toggleBtn = document.getElementById('toggleEditBtn');
        this.addBtn = document.getElementById('addCardBtn');
        this.modal = document.getElementById('addModal');
        
        this.load();
        renderCards(this.cards, this.edit);
        this.setupEvents();
    }

    load() {
        const raw = localStorage.getItem('rapDB');
        if (raw) {
            const data = JSON.parse(raw);
            const seenIds = new Set();
            
            this.cards = data.map(i => {
                if (seenIds.has(i.id)) {
                    i.id = crypto.randomUUID();
                }
                seenIds.add(i.id);
                
                const args = [i.n, i.img, i.b, i.l, i.d, i.id];
                if (i.t === 'OldSchoolRapper') return new OldSchoolRapper(...args);
                if (i.t === 'NewSchoolRapper') return new NewSchoolRapper(...args);
                if (i.t === 'UndergroundRapper') return new UndergroundRapper(...args);
                return new MusicCard(...args);
            });
        } else {
            this.cards = [
                new OldSchoolRapper("Eminem", "images/shutterstock_1632717139.jpg", 8, 10, "Легенда хип-хопа. Мастер рифмы и скорочтения."),
                new NewSchoolRapper("Мейби Бейби", "images/Мэйби_Бэйби.png", 8, 10, "Подружка Доры. Зафрендзонит любого."),
                new NewSchoolRapper("Моргенштерн", "images/2ee68768979e54f92a1e31e2739544bc.1000x1000x1.png", 10, 6, "Король автотюна и эпатажа."),
                new NewSchoolRapper("Travis Scott", "images/7ba0d6551733ef9_400x400.jpg", 10, 6, "Король атмосферных битов."),
                new OldSchoolRapper("Oxxxymiron", "images/b5W2b_VgehU.jpg", 6, 9, "Мастер сложных рифм и баттлов."),
                new UndergroundRapper("Овсянкин", "images/unnamed.jpg", 5, 9, "Андеграунд с глубокими текстами."),
                new NewSchoolRapper("Дора", "images/54327623.jpg", 10, 10, "Убийца всех мужиков на заводе."),
                new NewSchoolRapper("Макар", "images/macan-o-voine.jpg", 3, 1, "Джеб джеб, слева джеб, справа джет.")
            ];
            this.save();
        }
    }

    save() {
        const data = this.cards.map(c => c.toJSON());
        localStorage.setItem('rapDB', JSON.stringify(data));
    }
    fullRender() {
        renderCards(this.cards, this.edit);
    }

    toggleEdit() {
        this.edit = !this.edit;
        document.body.classList.toggle('is-editing', this.edit);
        
        if (this.toggleBtn) {
            this.toggleBtn.textContent = this.edit ? 'Сохранить' : 'Редактировать';
            this.toggleBtn.classList.toggle('active', this.edit);
        }
        if (this.addBtn) {
            this.addBtn.style.display = this.edit ? 'inline-block' : 'none';
        }
        
        if (!this.edit) this.save();
        this.fullRender();
    }

    upd(id, key, val) {
        const card = this.cards.find(c => c.id === id);
        if (!card) return;
        
        const field = this.fieldMap[key] || key;
        if (key === 'b' || key === 'l') {
            card[field] = +val;
        } else {
            card[field] = val;
        }
        
        if (!this.edit) {
            const cardElement = document.getElementById(id);
            if (cardElement) {
                if (key === 'n') {
                    const titleEl = cardElement.querySelector('h2');
                    if (titleEl) titleEl.textContent = val;
                } else if (key === 'b') {
                    const beatSpan = cardElement.querySelector('.stats span:first-child');
                    if (beatSpan) beatSpan.textContent = `Бит: ${val}/10`;
                } else if (key === 'l') {
                    const lyricsSpan = cardElement.querySelector('.stats span:last-child');
                    if (lyricsSpan) lyricsSpan.textContent = `Текст: ${val}/10`;
                } else if (key === 'd') {
                    const descEl = cardElement.querySelector('.desc');
                    if (descEl) descEl.textContent = val;
                } else if (key === 'img') {
                    const imgEl = cardElement.querySelector('img');
                    if (imgEl) imgEl.src = val;
                }
            }
        }
    }

    rm(id) {
        if (confirm('Удалить карту?')) {
            this.cards = this.cards.filter(c => c.id !== id);
            this.save();
            this.fullRender();
        }
    }

    add(type, name, img, beat, lyrics, desc) {
        const cls = {
            OldSchool: OldSchoolRapper,
            NewSchool: NewSchoolRapper,
            Underground: UndergroundRapper
        }[type] || MusicCard;
        
        this.cards.push(new cls(name, img, +beat, +lyrics, desc));
        this.save();
        this.fullRender();
        this.closeModal();
    }

    setupEvents() {
        if (this.toggleBtn) {
            this.toggleBtn.onclick = () => this.toggleEdit();
        }

        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.onclick = () => {
                if (confirm('Сбросить все данные?')) {
                    localStorage.removeItem('rapDB');
                    location.reload();
                }
            };
        }

        const addBtn = document.getElementById('addCardBtn');
        const close = document.querySelector('.close-modal');
        const form = document.getElementById('addForm');

        if (addBtn) {
            addBtn.onclick = () => {
                if (this.modal) this.modal.style.display = 'flex';
            };
        }
        if (close) {
            close.onclick = () => this.closeModal();
        }
        
        window.onclick = (e) => {
            if (this.modal && e.target === this.modal) this.closeModal();
        };

        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.add(
                    document.getElementById('newType').value,
                    document.getElementById('newName').value.trim(),
                    document.getElementById('newPhoto').value.trim(),
                    document.getElementById('newBeat').value,
                    document.getElementById('newLyrics').value,
                    document.getElementById('newDesc').value.trim()
                );
                form.reset();
            };
        }
    }

    closeModal() {
        if (this.modal) this.modal.style.display = 'none';
    }
}

buildPage();
const app = new App();
