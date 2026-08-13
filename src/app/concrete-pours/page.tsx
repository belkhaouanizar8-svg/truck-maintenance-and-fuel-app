"use client";

import { useEffect, useState } from "react";

type Truck = {
  id: number;
  name: string;
};

type Pour = {
  id: number;
  truckId: number;
  truckName: string;
  date: string;
  clientName: string;
  cubicMeters: string;
  location: string;
};

export default function ConcretePoursPage() {
  const [pours, setPours] = useState<Pour[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [truckId, setTruckId] = useState("");
  const [date, setDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [cubicMeters, setCubicMeters] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [poursRes, trucksRes] = await Promise.all([
      fetch("/api/concrete-pours"),
      fetch("/api/trucks"),
    ]);
    const poursData = await poursRes.json();
    const trucksData = await trucksRes.json();
    setPours(poursData);
    setTrucks(trucksData);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/concrete-pours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        truckId: Number(truckId),
        date,
        clientName,
        cubicMeters,
        location,
      }),
    });
    setTruckId("");
    setDate("");
    setClientName("");
    setLocation("");
    setCubicMeters("");
    loadData();
  }

  async function handleDelete(id: number) {
    await fetch("/api/concrete-pours?id=" + id, { method: "DELETE" });
    loadData();
  }

  function printReceipt(pour: Pour) {
    const win = window.open("", "_blank");
    if (!win) return;
    var html = "<html><head><title>Fiche Pompe a Beton</title>";
    html += "<style>";
    html += "body { font-family: Arial, sans-serif; padding: 40px; }";
    html += "h1 { font-size: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }";
    html += "table { width: 100%; margin-top: 20px; border-collapse: collapse; }";
    html += "td { padding: 10px; border-bottom: 1px solid #ddd; }";
    html += "td:first-child { font-weight: bold; width: 200px; }";
    html += "</style></head><body>";
    html += "<h1>Fiche Pompe a Beton</h1><table>";
    html += "<tr><td>Date</td><td>" + pour.date + "</td></tr>";
    html += "<tr><td>Camion</td><td>" + pour.truckName + "</td></tr>";
    html += "<tr><td>Client / Chantier</td><td>" + pour.clientName + "</td></tr>";
    html += "<tr><td>Chantier</td><td>" + pour.location + "</td></tr>";
    html += "<tr><td>Volume coule</td><td>" + pour.cubicMeters + " m3</td></tr>";
    html += "</table></body></html>";
    win.document.write(html);
    win.document.close();
    win.print();
  }

  function printGlobalReport() {
    const totalsByTruck = new Map<string, number>();
    for (const p of pours) {
      const current = totalsByTruck.get(p.truckName) ?? 0;
      totalsByTruck.set(p.truckName, current + Number(p.cubicMeters));
    }

    const win = window.open("", "_blank");
    if (!win) return;
    var rows = "";
    totalsByTruck.forEach((total, name) => {
      rows += "<tr><td>" + name + "</td><td>" + total.toFixed(2) + " m3</td></tr>";
    });

    var html2 = "<html><head><title>Rapport Global Pompe a Beton</title>";
    html2 += "<style>";
    html2 += "body { font-family: Arial, sans-serif; padding: 40px; }";
    html2 += "h1 { font-size: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }";
    html2 += "table { width: 100%; margin-top: 20px; border-collapse: collapse; }";
    html2 += "th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }";
    html2 += "</style></head><body>";
    html2 += "<h1>Rapport Global - Total m3 par Camion</h1><table>";
    html2 += "<tr><th>Camion</th><th>Total m3</th></tr>";
    html2 += rows;
    html2 += "</table></body></html>";
    win.document.write(html2);
    win.document.close();
    win.print();
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Pompe à Béton</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 20,
          padding: 15,
          background: "#f5f5f5",
          borderRadius: 8,
        }}
      >
        <select
          value={truckId}
          onChange={(e) => setTruckId(e.target.value)}
          required
          style={{ padding: 8, color: "#000"}}
        >
          <option value="">Choisir camion</option>
          {trucks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ padding: 8, color: "#000"}}
        />
        <input
          type="text"
          placeholder="Nom du client / chantier"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          required
style={{ padding: 8, color: "#000", flex: 1, minWidth: 150 }}        />
        <input
          type="text"
          placeholder="Chantier"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ padding: 8, color: "#000", flex: 1, minWidth: 150 }}
        />
        <input
          type="number"
          step="0.01"
          placeholder="m³ dar"
          value={cubicMeters}
          onChange={(e) => setCubicMeters(e.target.value)}
          required
          style={{ padding: 8, color: "#000", width: 100 }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Ajouter
        </button>
      </form>

      <button
        onClick={printGlobalReport}
        style={{
          padding: "8px 16px",
          background: "#16a34a",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        Imprimer Rapport Global
      </button>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th style={{ padding: 8, color: "#000", textAlign: "left" }}>Date</th>
            <th style={{ padding: 8, color: "#000", textAlign: "left" }}>Camion</th>
            <th style={{ padding: 8, color: "#000", textAlign: "left" }}>Client</th>
            <th style={{ padding: 8, color: "#000", textAlign: "left" }}>m³</th>
            <th style={{ padding: 8, color: "#000", textAlign: "left" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pours.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: 8, color: "#000" }}>{p.date}</td>
              <td style={{ padding: 8, color: "#000" }}>{p.truckName}</td>
              <td style={{ padding: 8, color: "#000" }}>{p.clientName}</td>
              <td style={{ padding: 8, color: "#000" }}>{p.cubicMeters}</td>
              <td style={{ padding: 8, color: "#000", display: "flex", gap: 8 }}>
                <button
                  onClick={() => printReceipt(p)}
                  style={{
                    padding: "4px 10px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  Imprimer
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  style={{
                    padding: "4px 10px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
