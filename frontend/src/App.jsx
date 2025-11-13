import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./App.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE = "http://localhost:3000";

export default function App() {
  const [gastos, setGastos] = useState([]);
  const [total, setTotal] = useState(0);

  const carregarGastos = async () => {
    try {
      const res = await fetch(`${API_BASE}/gastos`);
      const data = await res.json();
      setGastos(data);

      const soma = data.reduce((acc, g) => acc + g.valor, 0);
      setTotal(soma);
    } catch (err) {
      console.error("Erro ao carregar gastos:", err);
    }
  };

  useEffect(() => {
    carregarGastos();
    const interval = setInterval(carregarGastos, 5000);
    return () => clearInterval(interval);
  }, []);

  // gráficos por categorias
  const categorias = {};
  gastos.forEach((g) => {
    const cat = g.descricao || "Outros";
    categorias[cat] = (categorias[cat] || 0) + g.valor;
  });

  const chartData = {
    labels: Object.keys(categorias),
    datasets: [
      {
        data: Object.values(categorias),
        backgroundColor: [
          "#4ade80", "#60a5fa", "#fcd34d", "#f87171", "#c084fc", "#fb923c"
        ],
        hoverOffset: 10,
      },
    ],
  };

  return (
    <div className="app-container">
      <header>
        <h1>Controle de Gastos</h1>
        <p>Envie mensagens pelo WhatsApp e veja os registros aqui.</p>
      </header>

      <section className="main-grid">
        <div className="table-section card">
          <h2>Últimos Gastos</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {gastos.length > 0 ? (
                gastos.slice().reverse().map((g, i) => (
                  <tr key={i}>
                    <td>{new Date(g.data).toLocaleDateString("pt-BR")}</td>
                    <td>{g.descricao}</td>
                    <td className="valor">{g.valor.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="empty">Nenhum gasto registrado ainda</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="chart-section card">
          <h2>Resumo de Gastos</h2>
          <div className="total-box">
            <span>Total registrado</span>
            <span className="valor">R$ {total.toFixed(2)}</span>
          </div>
          {gastos.length > 0 ? (
            <div className="chart-wrapper">
              <Pie data={chartData} options={{ maintainAspectRatio: true }} />
            </div>
          ) : (
            <p>Nenhum gasto registrado</p>
          )}
        </div>
      </section>
    </div>
  );
}
