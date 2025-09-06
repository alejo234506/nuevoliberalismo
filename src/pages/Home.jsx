import { useEffect, useMemo, useState } from "react";

const API_BASE = "https://api.nuevoliberalismo.factoryil.com";

const ENDPOINTS = [
  { path: "/inscripciones", fuente: "INSCRIPCIONES" },
  { path: "/registro_personas", fuente: "REGISTRO_PERSONAS" },
];

export default function Home() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [fuente, setFuente] = useState("ALL"); // ALL | INSCRIPCIONES | REGISTRO_PERSONAS
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true); setErr("");
      try {
        const results = await Promise.allSettled(
          ENDPOINTS.map(async ({ path, fuente }) => {
            const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
            const text = await res.text();
            if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}: ${text.slice(0,200)}`);
            const json = JSON.parse(text);
            const data = normalize(json);
            return data.map(item => ({
              ...item,
              __fuente: fuente,
              fecha_registro: item.fecha_registro ?? item.created_at ?? null,
              nombre: item.nombre ?? item.full_name ?? "",
              identificacion: item.identificacion ?? item.documento ?? item.cc ?? "",
              celular: item.celular ?? item.telefono ?? "",
            }));
          })
        );

        const merged = [];
        const errors = [];
        results.forEach((r, i) => {
          if (r.status === "fulfilled") merged.push(...r.value);
          else errors.push(r.reason?.message || String(r.reason) || `Error en ${ENDPOINTS[i].path}`);
        });

        if (!cancelled) {
          setRows(merged);
          if (errors.length) setErr(errors.join(" | "));
        }
      } catch (e) {
        if (e.name !== "AbortError" && !cancelled) setErr(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; controller.abort(); };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let data = [...rows];

    if (fuente !== "ALL") data = data.filter(r => r.__fuente === fuente);

    if (needle) {
      data = data.filter(r =>
        [r.nombre, r.identificacion, r.celular, r.direccion, r.barrio]
          .map(v => (v ?? "").toString().toLowerCase())
          .some(s => s.includes(needle))
      );
    }

    data.sort((a, b) =>
      (new Date(b.fecha_registro || 0) - new Date(a.fecha_registro || 0)) ||
      ((b.id ?? 0) - (a.id ?? 0))
    );

    return data;
  }, [rows, q, fuente]);

  const countIns = rows.filter(r => r.__fuente === "INSCRIPCIONES").length;
  const countReg = rows.filter(r => r.__fuente === "REGISTRO_PERSONAS").length;

  return (
    <section className="card">
      {/* Filtros */}
      <div className="tools" style={{ marginBottom: 12 }}>
        <select
          className="input"
          value={fuente}
          onChange={e => setFuente(e.target.value)}
          aria-label="Filtrar por fuente"
        >
          <option value="ALL">Todos ({rows.length})</option>
          <option value="INSCRIPCIONES">Inscripciones ({countIns})</option>
          <option value="REGISTRO_PERSONAS">Registro personas ({countReg})</option>
        </select>

        <input
          className="input"
          placeholder="Filtrar por nombre, identificación, barrio…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      {loading && <p className="hint">Cargando…</p>}
      {err && <p className="hint error">⚠️ {err}</p>}

      {!loading && !err && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fuente</th>
                <th>Fecha registro</th>
                <th>Nombre</th>
                <th>Identificación</th>
                <th>Celular</th>
                <th>Dirección</th>
                <th>Barrio</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center" }}>Sin registros.</td></tr>
              ) : filtered.map((x, i) => (
                <tr key={`${x.__fuente}-${x.id ?? i}`}>
                  <td>{i + 1}</td>
                  <td>
                    <span className={`badge ${x.__fuente === "INSCRIPCIONES" ? "primary" : "secondary"}`}>
                      {x.__fuente === "INSCRIPCIONES" ? "Inscripciones" : "Registro personas"}
                    </span>
                  </td>
                  <td>{fmtDate(x.fecha_registro)}</td>
                  <td>{x.nombre}</td>
                  <td>{x.identificacion}</td>
                  <td>{x.celular ?? ""}</td>
                  <td>{x.direccion ?? ""}</td>
                  <td>{x.barrio ?? ""}</td>
                  <td style={{ fontFamily: "monospace" }}>{x.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ------------ helpers ------------ */
function normalize(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.rows)) return raw.rows;
  return [];
}
function fmtDate(v) {
  if (!v) return "";
  try { return new Date(v).toLocaleString(); } catch { return v; }
}
