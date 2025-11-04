// src/components/Reportes/ReportChart.tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export function ReportChart({ data }: { data: { mes: string; ingresos: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="mes" stroke="#64748B" />
        <YAxis stroke="#64748B" />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="ingresos"
          stroke="#B02128"
          strokeWidth={3}
          name="Ingresos"
          dot={{ fill: "#B02128", r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
