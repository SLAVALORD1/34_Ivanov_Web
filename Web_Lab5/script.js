function renderPage(cards, isEditMode, containerId = 'cardsContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let cardsHtml = '';
    for (const card of cards) {
        cardsHtml += card.render(isEditMode);
    }
    
    if (cardsHtml === '') {
        cardsHtml = '<div class="empty-state">Нет карточек. Нажмите "Добавить"</div>';
    }
    
    container.innerHTML = cardsHtml;
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
        const del = `<button class="delete-btn" onclick="app.rm('${safeId}')">X</button>`;
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
        return `<div class="card ${this.getType()}" id="${safeId}">${del}<img src="${this.#img}" alt="${this.#name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Photo'"><div class="card-content">${html}</div></div>`;
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
        this.container = document.getElementById('cardsContainer');
        this.toggleBtn = document.getElementById('toggleEditBtn');
        this.addBtn = document.getElementById('addCardBtn');
        this.modal = document.getElementById('addModal');
        this.fieldMap = { n: 'name', img: 'img', b: 'beatQ', l: 'lyrQ', d: 'desc' };
        this.init();
    }

    init() {
        this.load();
        renderPage(this.cards, this.edit);
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
                new NewSchoolRapper("Мейби Бейби", "images/Мэйби_Бэйби.png", 8, 10, "Подружка Доры. Зафрендзонит любого заводчанина."),
                new NewSchoolRapper("Моргенштерн (иноагент в РФ)", "images/2ee68768979e54f92a1e31e2739544bc.1000x1000x1.png", 10, 6, "Женщина года. Особенность персонжа - универсальность."),
                new NewSchoolRapper("Travis Scott", "images/7ba0d6551733ef9_400x400.jpg", 10, 6, "Король автотюна и атмосферных битов."),
                new OldSchoolRapper("Oxxxymiron (иноагент в РФ)", "images/b5W2b_VgehU.jpg", 6, 9, "Мастер сложных рифм."),
                new UndergroundRapper("Овсянкин", "images/unnamed.jpg", 5, 9, "Представитель андеграунда с глубокими текстами."),
                new NewSchoolRapper("Дора", "images/54327623.jpg", 10, 10, "Убийца всех мужиков на заводе."),
                new NewSchoolRapper("Макар", "images/macan-o-voine.jpg", 3, 1, "Джеб Джеб, слева джеб, справа джет.")
            ];
            this.save();
        }
    }

    save() {
        const data = this.cards.map(c => c.toJSON());
        localStorage.setItem('rapDB', JSON.stringify(data));
    }
    refresh() {
        renderPage(this.cards, this.edit);
    }

    toggleEdit() {
        this.edit = !this.edit;
        document.body.classList.toggle('is-editing', this.edit);
        this.toggleBtn.textContent = this.edit ? 'Сохранить' : 'Редактировать';
        this.toggleBtn.classList.toggle('active', this.edit);
        this.addBtn.style.display = this.edit ? 'inline-block' : 'none';
        
        if (!this.edit) this.save();
        renderPage(this.cards, this.edit);
    }

    upd(id, key, val) {
        const card = this.cards.find(c => c.id === id);
        if (!card) {
            console.error('Карта не найдена:', id);
            return;
        }
        const field = this.fieldMap[key] || key;
        if (key === 'b' || key === 'l') {
            card[field] = +val;
        } else {
            card[field] = val;
        }
        renderPage(this.cards, this.edit);
    }

    rm(id) {
        if (confirm('Удалить карту?')) {
            this.cards = this.cards.filter(c => c.id !== id);
            this.save();
            renderPage(this.cards, this.edit);
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
        renderPage(this.cards, this.edit);
        this.closeModal();
    }

    setupEvents() {
        this.toggleBtn.onclick = () => this.toggleEdit();

        document.getElementById('resetBtn').onclick = () => {
            if (confirm('Сбросить все данные?')) {
                localStorage.removeItem('rapDB');
                location.reload();
            }
        };

        const addBtn = document.getElementById('addCardBtn');
        const close = document.querySelector('.close-modal');
        const form = document.getElementById('addForm');

        addBtn.onclick = () => this.modal.style.display = 'flex';
        close.onclick = () => this.closeModal();
        window.onclick = (e) => { if (e.target === this.modal) this.closeModal(); };

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

    closeModal() {
        this.modal.style.display = 'none';
    }
}




const app = new App();
