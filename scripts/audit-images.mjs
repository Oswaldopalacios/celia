const base = process.env.AUDIT_BASE ?? "http://127.0.0.1:3001";
let cookie = "";

async function req(path, opts = {}) {
  const headers = new Headers(opts.headers);
  if (cookie) headers.set("cookie", cookie);
  const res = await fetch(base + path, { ...opts, headers });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length) {
    cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  }
  return { status: res.status, json: await res.json() };
}

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const login = await req("/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    email: "admin@donacelia.com",
    password: "admin123",
  }),
});
if (login.status !== 200) throw new Error("login");

const stamp = Date.now();
const a = await req("/api/categories", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ title: `Entradas-${stamp}`, kind: "comida" }),
});
const b = await req("/api/categories", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ title: `Fuertes-${stamp}`, kind: "comida" }),
});
if (a.status !== 201 || b.status !== 201) {
  throw new Error(`categories ${a.status} ${b.status} ${JSON.stringify(a.json)} ${JSON.stringify(b.json)}`);
}

const form = new FormData();
form.set("name", "Tostada");
form.set("description", "");
form.set("price", "80");
form.set("quantity", "1");
form.set("productType", "comida");
form.set("category", a.json.category._id);
form.set("isSoldOut", "false");
form.set("image", new File([png], "dot.png", { type: "image/png" }));

const product = await req("/api/products", { method: "POST", body: form });
if (product.status !== 201) {
  throw new Error(`product ${product.status} ${JSON.stringify(product.json)}`);
}
const imageUrl = product.json.product.image;
if (!imageUrl?.startsWith("https://res.cloudinary.com/")) {
  throw new Error(`image path ${imageUrl}`);
}

const imageRes = await fetch(imageUrl);
if (imageRes.status !== 200) throw new Error(`image serve ${imageRes.status}`);

const blocked = await req(`/api/categories/${a.json.category._id}`, {
  method: "DELETE",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({}),
});
if (blocked.status !== 400) {
  throw new Error(`expected 400 without reassign, got ${blocked.status}`);
}

const moved = await req(`/api/categories/${a.json.category._id}`, {
  method: "DELETE",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ reassignTo: b.json.category._id }),
});
if (moved.status !== 200) {
  throw new Error(`reassign ${moved.status} ${JSON.stringify(moved.json)}`);
}

const listed = await req("/api/products");
const updated = listed.json.products.find((p) => p._id === product.json.product._id);
if (updated.category._id !== b.json.category._id) {
  throw new Error("product was not reassigned");
}

await req(`/api/products/${product.json.product._id}`, { method: "DELETE" });
await req(`/api/categories/${b.json.category._id}`, { method: "DELETE" });
await req("/auth/logout", { method: "POST" });

console.log("OK imagen + reasignación de categoría");
