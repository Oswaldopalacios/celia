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
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const results = [];

try {
  const unauth = await req("/api/products", {
    method: "POST",
    body: new FormData(),
  });
  assert(unauth.status === 401, `create product without auth: ${unauth.status}`);
  results.push("POST /api/products sin sesión → 401");

  const badLogin = await req("/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "no@existe.com", password: "x" }),
  });
  assert(badLogin.status === 404, `missing user: ${badLogin.status}`);
  results.push("Login usuario inexistente → 404");

  const wrongPass = await req("/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "admin@donacelia.com",
      password: "wrong",
    }),
  });
  assert(wrongPass.status === 401, `wrong password: ${wrongPass.status}`);
  results.push("Login contraseña incorrecta → 401");

  const login = await req("/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "admin@donacelia.com",
      password: "admin123",
    }),
  });
  assert(login.status === 200, `login failed: ${login.status} ${JSON.stringify(login.json)}`);
  assert(login.json.user?.email === "admin@donacelia.com", "login user email");
  assert(cookie.includes("donacelia_session"), "session cookie set");
  results.push("Login admin → 200 + cookie");

  const me = await req("/auth/isLogged");
  assert(me.status === 200, `isLogged: ${me.status}`);
  assert(me.json.email === "admin@donacelia.com", "isLogged email");
  results.push("GET /auth/isLogged → sesión activa");

  const cat = await req("/api/categories", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Antojitos", kind: "comida" }),
  });
  assert(cat.status === 201, `create category: ${cat.status} ${JSON.stringify(cat.json)}`);
  const categoryId = cat.json.category._id;
  results.push("POST categoría Antojitos → 201");

  const drinkCat = await req("/api/categories", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Aguas", kind: "bebidas" }),
  });
  assert(drinkCat.status === 201, `drink category: ${drinkCat.status}`);
  results.push("POST categoría Aguas → 201");

  const dup = await req("/api/categories", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Antojitos", kind: "comida" }),
  });
  assert(dup.status === 400, `duplicate category: ${dup.status}`);
  results.push("Categoría duplicada → 400");

  const form = new FormData();
  form.set("name", "Sopes");
  form.set("description", "Fresco");
  form.set("price", "120");
  form.set("quantity", "1 porción");
  form.set("productType", "comida");
  form.set("category", categoryId);
  form.set("isSoldOut", "false");

  const created = await req("/api/products", { method: "POST", body: form });
  assert(created.status === 201, `create product: ${created.status} ${JSON.stringify(created.json)}`);
  const productId = created.json.product._id;
  assert(created.json.product.category._id === categoryId, "product category");
  results.push("POST producto Sopes → 201");

  const patch = new FormData();
  patch.set("name", "Sopes especiales");
  patch.set("description", "Más fresco");
  patch.set("price", "150");
  patch.set("quantity", "1 porción");
  patch.set("productType", "comida");
  patch.set("category", categoryId);
  patch.set("isSoldOut", "true");
  const updated = await req(`/api/products/${productId}`, {
    method: "PATCH",
    body: patch,
  });
  assert(updated.status === 200, `update product: ${updated.status}`);
  assert(updated.json.product.name === "Sopes especiales", "updated name");
  assert(updated.json.product.isSoldOut === true, "sold out");
  results.push("PATCH producto → agotado y nuevo precio");

  const list = await req("/api/products");
  assert(list.status === 200, "list products");
  assert(list.json.products.length >= 1, "has products");
  results.push("GET productos públicos → lista");

  const stats = await req("/api/stats");
  assert(stats.status === 200, `stats: ${stats.status}`);
  assert(stats.json.stats.catalog.products >= 1, "stats products");
  results.push("GET stats autenticado → catálogo");

  const delProduct = await req(`/api/products/${productId}`, { method: "DELETE" });
  assert(delProduct.status === 200, `delete product: ${delProduct.status}`);
  results.push("DELETE producto → 200");

  const delCat = await req(`/api/categories/${categoryId}`, { method: "DELETE" });
  assert(delCat.status === 200, `delete category: ${delCat.status}`);
  const delDrink = await req(`/api/categories/${drinkCat.json.category._id}`, {
    method: "DELETE",
  });
  assert(delDrink.status === 200, `delete drink cat: ${delDrink.status}`);
  results.push("DELETE categorías → 200");

  const logout = await req("/auth/logout", { method: "POST" });
  assert(logout.status === 200, `logout: ${logout.status}`);
  const after = await req("/auth/isLogged");
  assert(after.status === 401, `isLogged after logout: ${after.status}`);
  results.push("Logout → isLogged 401");

  const dash = await req("/dashboard", { redirect: "manual" });
  assert(dash.status === 307 || dash.status === 308 || dash.status === 200, `dashboard: ${dash.status}`);
  results.push(`GET /dashboard sin sesión → ${dash.status}`);

  console.log("OK\n" + results.map((line) => `- ${line}`).join("\n"));
} catch (error) {
  console.error("FAIL", error);
  console.error("passed:\n" + results.map((line) => `- ${line}`).join("\n"));
  process.exit(1);
}
