import React, { useState, useRef } from 'react';
import './App.css';

const segments = [
  { label: '⭐️ 0.5', value: 0.5, color: '#f9d71c' },
  { label: '⭐️ 1', value: 1, color: '#f7b500' },
  { label: '⭐️ 0.7', value: 0.7, color: '#f9d71c' },
  { label: 'Mystery Box 5', value: 'mystery5', color: '#ff6f61' },
  { label: '⭐️ 2', value: 2, color: '#f7b500' },
  { label: '⭐️ 0.2', value: 0.2, color: '#f9d71c' },
  { label: 'Mystery Box 3', value: 'mystery3', color: '#ff6f61' },
  { label: '⭐️ 0.07', value: 0.07, color: '#f7b500' },
  { label: '⭐️ 5', value: 5, color: '#f9d71c' },
  { label: 'Mystery Box 2', value: 'mystery2', color: '#ff6f61' },
];

const segmentAngle = 360 / segments.length;

function App() {
  const [stars, setStars] = useState(0);
  const [spins, setSpins] = useState(0);
  const [result, setResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef(null);

  function openTask() {
    setSpins(spins + 5);
    setResult(null);
  }

  function spinWheel() {
    if (spins <= 0 || isSpinning) return;

    setIsSpinning(true);
    setSpins(spins - 1);
    setResult(null);

    // Выбор призового сегмента с учетом вероятностей
    // Большие призы — меньшая вероятность
    // Пример весов (обратные пропорционально значению):
    const weights = segments.map(s => {
      if (typeof s.value === 'number') return 1 / (s.value + 0.1);
      if (s.value.toString().startsWith('mystery')) return 0.5;
      return 1;
    });
    const totalWeight = weights.reduce((a,b) => a + b, 0);
    let rnd = Math.random() * totalWeight;
    let chosenIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      if (rnd < weights[i]) {
        chosenIndex = i;
        break;
      }
      rnd -= weights[i];
    }

    // Крутилка: вычисляем конечный угол с припаданием на выбранный сегмент
    const baseRotations = 5; // сколько раз крутить колесо
    const randomOffset = Math.random() * segmentAngle;
    const finalAngle = 360 * baseRotations - (chosenIndex * segmentAngle) - (segmentAngle / 2) + randomOffset;

    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.33, 1, 0.68, 1)';
      wheelRef.current.style.transform = `rotate(${finalAngle}deg)`;
    }

    setTimeout(() => {
      setIsSpinning(false);
      const prize = segments[chosenIndex];
      if (typeof prize.value === 'number') {
        setStars(stars + prize.value);
        setResult(`Поздравляем! Вы выиграли ${prize.label} звёзд.`);
      } else if (prize.value.toString().startsWith('mystery')) {
        // Mystery Box рандом
        let mysteryStars = 0;
        if (prize.value === 'mystery5') mysteryStars = 5;
        else if (prize.value === 'mystery3') mysteryStars = 3;
        else if (prize.value === 'mystery2') mysteryStars = 2;
        setStars(stars + mysteryStars);
        setResult(`Вы получили Mystery Box с ${mysteryStars} звёздами!`);
      }
      // Сброс анимации
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'none';
        wheelRef.current.style.transform = `rotate(${(finalAngle % 360)}deg)`;
      }
    }, 5200);
  }

  return (
    <div className="App">
      <h1>Колесо Фортуны</h1>
      <div className="balance">Баланс звёзд: <strong>{stars.toFixed(2)}</strong></div>
      <div className="spins">Вращения: {spins}</div>

      <div className="wheel-container">
        <div className="pointer">▼</div>
        <div className="wheel" ref={wheelRef}>
          {segments.map((seg, i) => (
            <div
              key={i}
              className="segment"
              style={{
                transform: `rotate(${i * segmentAngle}deg) skewY(-${90 - segmentAngle}deg)`,
                backgroundColor: seg.color,
              }}
            >
              <span className="label">{seg.label}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={spinWheel}
        disabled={spins <= 0 || isSpinning}
        className="spin-button"
      >
        {isSpinning ? 'Крутим...' : 'Вращать колесо'}
      </button>

      <button onClick={openTask} disabled={isSpinning} className="task-button">
        Открыть задание (+5 вращений)
      </button>

      {result && <div className="result">{result}</div>}
    </div>
  );
}

export default App;
