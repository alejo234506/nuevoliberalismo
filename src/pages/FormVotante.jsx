import { useState } from "react";

const API_BASE = "https://api.nuevoliberalismo.factoryil.com";
const PATH = "/inscripciones"; // Tabla: inscripciones

async function apiSend(body) {
  const res = await fetch(`${API_BASE}${PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json;
}

export default function FormVotante() {
  const initial = { nombre: "", identificacion: "", celular: "", direccion: "", barrio: "" };
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setOk(""); setErr("");
    if (!form.nombre || !form.identificacion) {
      setErr("Nombre e identificación son obligatorios");
      return;
    }
    try {
      setSaving(true);
      await apiSend(form);
      setOk("✅ Registro guardado");
      setTimeout(() => setOk(""), 3000); // auto-ocultar
      setForm(initial);                   // opcional: limpiar
    } catch (error) {
      setErr("⚠️ " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hero">
      {/* Slideshow 3 imágenes */}
      <span className="hero__slide hero__slide--s1" />
      <span className="hero__slide hero__slide--s2" />
      <span className="hero__slide hero__slide--s3" />

      <section className="card card--glass">
        <h2>Formulario – Votante</h2>

        {ok && <p className="hint" style={{ color: "#059669", fontWeight: 600 }}>{ok}</p>}
        {err && <p className="hint error">{err}</p>}

        <form className="grid" onSubmit={onSubmit}>
          <input className="input" name="nombre" placeholder="Nombre" value={form.nombre} onChange={onChange} />
          <input className="input" name="identificacion" placeholder="Identificación" value={form.identificacion} onChange={onChange} />
          <input className="input" name="celular" placeholder="Celular" value={form.celular} onChange={onChange} />
          <input className="input" name="direccion" placeholder="Dirección" value={form.direccion} onChange={onChange} />
          <input className="input" name="barrio" placeholder="Barrio" value={form.barrio} onChange={onChange} />
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </section>
    </div>
  );
}
