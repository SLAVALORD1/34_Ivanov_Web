import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { RandomDog } from './pages/RandomDog';
import { BreedsList } from './pages/BreedsList';
import { MyCollection } from './pages/MyCollection';
import { CatFacts } from './pages/CatFacts';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<RandomDog />} />
          <Route path="/breeds" element={<BreedsList />} />
          <Route path="/my" element={<MyCollection />} />
          <Route path="/facts" element={<CatFacts />} />
        </Routes>
      </div>
      <footer>
        <p>Лабораторная работа 7, Иванов Вячеслав КС-26</p>
      </footer>
    </BrowserRouter>
  );
}

export default App;