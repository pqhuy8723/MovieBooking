import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from "recharts";

// ---- MOCK DATA (thay bằng API sau) ----
const revenueByMonth = [
  { month: "T1", revenue: 45000000 },
  { month: "T2", revenue: 52000000 },
  { month: "T3", revenue: 38000000 },
  { month: "T4", revenue: 61000000 },
  { month: "T5", revenue: 55000000 },
  { month: "T6", revenue: 72000000 },
  { month: "T7", revenue: 68000000 },
  { month: "T8", revenue: 80000000 },
  { month: "T9", revenue: 65000000 },
  { month: "T10", revenue: 74000000 },
  { month: "T11", revenue: 59000000 },
  { month: "T12", revenue: 91000000 },
];

const revenueByMovie = [
  { name: "Phi Phỏng: Quỷ Mẫu Rừng Thiêng", revenue: 120000000, tickets: 1200 },
  { name: "Avengers: Secret Wars", revenue: 95000000, tickets: 950 },
  { name: "Deadpool & Wolverine", revenue: 78000000, tickets: 780 },
  { name: "Spider-Man: Beyond", revenue: 63000000, tickets: 630 },
  { name: "Thor: Love & Thunder 2", revenue: 41000000, tickets: 410 },
];

const revenueByCinema = [
  { name: "Beta Cinemas Mỹ Đình", value: 320000000 },
  { name: "Beta Cinemas Thanh Xuân", value: 180000000 },
  { name: "Beta Cinemas Đà Nẵng", value: 120000000 },
];

const ticketsByDay = [
  { day: "T2", tickets: 120 },
  { day: "T3", tickets: 95 },
  { day: "T4", tickets: 140 },
  { day: "T5", tickets: 180 },
  { day: "T6", tickets: 250 },
  { day: "T7", tickets: 380 },
  { day: "CN", tickets: 420 },
];

const summaryCards = [
  { label: "Tổng doanh thu", value: "760.000.000 đ", change: "+12.5%", positive: true, icon: "💰" },
  { label: "Vé bán ra", value: "3.970", change: "+8.2%", positive: true, icon: "🎟️" },
  { label: "Phim đang chiếu", value: "12", change: "+2", positive: true, icon: "🎬" },
  { label: "Suất chiếu hôm nay", value: "36", change: "-3", positive: false, icon: "📅" },
];

const COLORS = ["#111111", "#707072", "#CACACB", "#E5E5E5", "#9E9EA0"];
const PIE_COLORS = ["#111111", "#555555", "#999999"];

const formatVND = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}tr`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toString();
};

// ---- COMPONENT ----
function RevenueDashboard() {
  const [period, setPeriod] = useState("month");

  const cardStyle = {
    background: "#FAFAFA",
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const chartContainerStyle = {
    background: "#FFFFFF",
    border: "1px solid #E5E5E5",
    padding: "24px",
    marginBottom: "24px",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111111", marginBottom: "4px" }}>
          DOANH THU
        </h1>
        <p style={{ fontSize: "14px", color: "#707072", margin: 0 }}>
          Thống kê doanh thu và hoạt động kinh doanh
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px", marginBottom: "32px" }}>
        {summaryCards.map((card, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ fontSize: "28px", marginBottom: "4px" }}>{card.icon}</div>
            <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#9E9EA0" }}>
              {card.label}
            </div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#111111", lineHeight: "1" }}>
              {card.value}
            </div>
            <div style={{
              fontSize: "13px", fontWeight: "600",
              color: card.positive ? "#007D48" : "#D30005",
            }}>
              {card.change} so với tháng trước
            </div>
          </div>
        ))}
      </div>

      {/* Period filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {[
          { key: "week", label: "Tuần" },
          { key: "month", label: "Tháng" },
          { key: "quarter", label: "Quý" },
          { key: "year", label: "Năm" },
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: "600",
              border: period === p.key ? "2px solid #111111" : "1.5px solid #CACACB",
              background: period === p.key ? "#111111" : "#FFFFFF",
              color: period === p.key ? "#FFFFFF" : "#111111",
              cursor: "pointer",
              borderRadius: "0",
              transition: "all 150ms ease",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Revenue by month - Bar chart */}
        <div style={chartContainerStyle}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111111", marginBottom: "20px", textTransform: "uppercase" }}>
            Doanh thu theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByMonth} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={{ stroke: "#E5E5E5" }} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatVND} />
              <Tooltip
                formatter={(value) => [`${Number(value).toLocaleString("vi-VN")} đ`, "Doanh thu"]}
                contentStyle={{ border: "1px solid #E5E5E5", borderRadius: "0", fontSize: "13px" }}
              />
              <Bar dataKey="revenue" fill="#111111" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by cinema - Pie chart */}
        <div style={chartContainerStyle}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111111", marginBottom: "20px", textTransform: "uppercase" }}>
            Theo rạp
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByCinema}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={12}
                fontWeight={700}
              >
                {revenueByCinema.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => <span style={{ color: "#111111", fontWeight: "500" }}>{value}</span>}
              />
              <Tooltip
                formatter={(value) => [`${Number(value).toLocaleString("vi-VN")} đ`, "Doanh thu"]}
                contentStyle={{ border: "1px solid #E5E5E5", borderRadius: "0", fontSize: "13px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Tickets by day - Area chart */}
        <div style={chartContainerStyle}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111111", marginBottom: "20px", textTransform: "uppercase" }}>
            Lượng vé bán theo ngày
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={ticketsByDay}>
              <defs>
                <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#111111" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={{ stroke: "#E5E5E5" }} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value) => [`${value} vé`, "Số lượng"]}
                contentStyle={{ border: "1px solid #E5E5E5", borderRadius: "0", fontSize: "13px" }}
              />
              <Area type="monotone" dataKey="tickets" stroke="#111111" strokeWidth={2} fill="url(#colorTickets)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by movie - Horizontal bar */}
        <div style={chartContainerStyle}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111111", marginBottom: "20px", textTransform: "uppercase" }}>
            Top phim doanh thu cao
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueByMovie} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" horizontal={false} />
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatVND} />
              <YAxis
                type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false}
                width={140}
                tick={{ fill: "#111111", fontWeight: 500 }}
              />
              <Tooltip
                formatter={(value) => [`${Number(value).toLocaleString("vi-VN")} đ`, "Doanh thu"]}
                contentStyle={{ border: "1px solid #E5E5E5", borderRadius: "0", fontSize: "13px" }}
              />
              <Bar dataKey="revenue" fill="#111111" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent bookings table */}
      <div style={chartContainerStyle}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111111", marginBottom: "20px", textTransform: "uppercase" }}>
          Đơn đặt vé gần đây
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #111111" }}>
              <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "#9E9EA0" }}>Mã vé</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "#9E9EA0" }}>Phim</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "#9E9EA0" }}>Rạp</th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "#9E9EA0" }}>Ghế</th>
              <th style={{ textAlign: "right", padding: "10px 12px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "#9E9EA0" }}>Tổng tiền</th>
              <th style={{ textAlign: "center", padding: "10px 12px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "#9E9EA0" }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {[
              { code: "BK20260423001", movie: "Phi Phỏng: Quỷ Mẫu", cinema: "Beta Mỹ Đình", seats: "J14, J15", total: 100000, status: "PAID" },
              { code: "BK20260423002", movie: "Avengers: Secret Wars", cinema: "Beta Thanh Xuân", seats: "A1, A2, A3", total: 360000, status: "PAID" },
              { code: "BK20260423003", movie: "Deadpool & Wolverine", cinema: "Beta Mỹ Đình", seats: "D5", total: 90000, status: "PENDING" },
              { code: "BK20260423004", movie: "Spider-Man: Beyond", cinema: "Beta Đà Nẵng", seats: "F10, F11", total: 150000, status: "CANCELLED" },
              { code: "BK20260423005", movie: "Phi Phỏng: Quỷ Mẫu", cinema: "Beta Mỹ Đình", seats: "B7", total: 50000, status: "PAID" },
            ].map((booking, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #E5E5E5" }}>
                <td style={{ padding: "12px", fontWeight: "600", color: "#111111" }}>{booking.code}</td>
                <td style={{ padding: "12px", color: "#111111" }}>{booking.movie}</td>
                <td style={{ padding: "12px", color: "#707072" }}>{booking.cinema}</td>
                <td style={{ padding: "12px", color: "#707072" }}>{booking.seats}</td>
                <td style={{ padding: "12px", textAlign: "right", fontWeight: "600", color: "#111111" }}>{Number(booking.total).toLocaleString("vi-VN")} đ</td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    fontSize: "11px",
                    fontWeight: "700",
                    borderRadius: "30px",
                    background: booking.status === "PAID" ? "#DFFFB9" : booking.status === "PENDING" ? "#FEF087" : "#FFE5E5",
                    color: booking.status === "PAID" ? "#007D48" : booking.status === "PENDING" ? "#6B5900" : "#D30005",
                  }}>
                    {booking.status === "PAID" ? "Đã thanh toán" : booking.status === "PENDING" ? "Chờ thanh toán" : "Đã hủy"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RevenueDashboard;
