// <stdin>
import React, { useState } from "https://esm.sh/react@19.2.0";
import { Users, BarChart3, Play, Monitor, LogOut, Menu, X, Plus, Trash2 } from "https://esm.sh/lucide-react?deps=react@19.2.0,react-dom@19.2.0";
var { useStoredState } = hatch;
function VideSystem() {
  const [currentUser, setCurrentUser] = useStoredState("currentUser", null);
  const [users, setUsers] = useStoredState("users", [
    { id: 1, email: "admin@gmail.com", name: "Administrador", status: "active", role: "admin", createdAt: "22/01/2026" },
    { id: 2, email: "usuario1@gmail.com", name: "Usu\xE1rio 1", status: "active", role: "user", createdAt: "10/01/2026" },
    { id: 3, email: "usuario2@gmail.com", name: "Usu\xE1rio 2", status: "active", role: "user", createdAt: "10/01/2026" }
  ]);
  const [playlists, setPlaylists] = useStoredState("playlists", [
    { id: 1, name: "Playlist Principal", midiasCount: 5, createdAt: "15/01/2026" },
    { id: 2, name: "Comerciais", midiasCount: 3, createdAt: "10/01/2026" }
  ]);
  const [tvs, setTvs] = useStoredState("tvs", [
    { id: 1, code: "ABC123", name: "TV Recep\xE7\xE3o", status: "active", createdAt: "20/01/2026" },
    { id: 2, code: "DEF456", name: "TV Sala Espera", status: "active", createdAt: "18/01/2026" }
  ]);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newTvCode, setNewTvCode] = useState("");
  const [newTvName, setNewTvName] = useState("");
  const [tvCodeInput, setTvCodeInput] = useState("");
  const stats = {
    medias: users.filter((u) => u.status === "active").length * 3,
    playlists: playlists.length,
    tvs: tvs.length,
    users: users.length
  };
  const addPlaylist = () => {
    if (newPlaylistName) {
      const newPlaylist = {
        id: Math.max(...playlists.map((p) => p.id), 0) + 1,
        name: newPlaylistName,
        midiasCount: 0,
        createdAt: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")
      };
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName("");
    }
  };
  const deletePlaylist = (playlistId) => {
    setPlaylists(playlists.filter((p) => p.id !== playlistId));
  };
  const addTV = () => {
    if (newTvCode && newTvName) {
      const newTV = {
        id: Math.max(...tvs.map((t) => t.id), 0) + 1,
        code: newTvCode,
        name: newTvName,
        status: "active",
        createdAt: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")
      };
      setTvs([...tvs, newTV]);
      setNewTvCode("");
      setNewTvName("");
    }
  };
  const deleteTV = (tvId) => {
    setTvs(tvs.filter((t) => t.id !== tvId));
  };
  const toggleTvStatus = (tvId) => {
    setTvs(tvs.map(
      (t) => t.id === tvId ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t
    ));
  };
  const handleLogin = (email) => {
    const user = users.find((u) => u.email === email);
    if (user) {
      setCurrentUser(user);
      setCurrentPage("dashboard");
    }
  };
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage("login");
  };
  const toggleUserStatus = (userId) => {
    if (currentUser.role !== "admin") return;
    setUsers(users.map(
      (u) => u.id === userId ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
    ));
  };
  const addNewUser = () => {
    if (newUserEmail && newUserName && currentUser.role === "admin") {
      const newUser = {
        id: Math.max(...users.map((u) => u.id), 0) + 1,
        email: newUserEmail,
        name: newUserName,
        status: "active",
        role: "user",
        createdAt: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")
      };
      setUsers([...users, newUser]);
      setNewUserEmail("");
      setNewUserName("");
    }
  };
  if (!currentUser) {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-md" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 rounded-lg p-8 border border-slate-700" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-center mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-cyan-500 p-4 rounded-lg" }, /* @__PURE__ */ React.createElement(Monitor, { className: "w-8 h-8 text-slate-900" }))), /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-bold text-white text-center mb-2" }, "JJ M\xEDdia Indoor"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-center mb-8" }, "Sistema de Gest\xE3o de M\xEDdia Indoor"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleLogin("admin@gmail.com"),
        className: "w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-3 px-4 rounded transition"
      },
      "Entrar como Admin"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleLogin("usuario1@gmail.com"),
        className: "w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded transition"
      },
      "Entrar como Usu\xE1rio"
    )))));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "flex h-screen bg-slate-900" }, /* @__PURE__ */ React.createElement("div", { className: `${mobileMenuOpen ? "block" : "hidden"} md:block w-full md:w-56 bg-slate-800 border-r border-slate-700 p-4 fixed md:relative h-screen z-40 overflow-y-auto` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "bg-cyan-500 p-2 rounded" }, /* @__PURE__ */ React.createElement(Monitor, { className: "w-5 h-5 text-slate-900" })), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-white" }, "JJ M\xEDdia"), /* @__PURE__ */ React.createElement("button", { onClick: () => setMobileMenuOpen(false), className: "md:hidden ml-auto" }, /* @__PURE__ */ React.createElement(X, { className: "w-5 h-5 text-white" }))), /* @__PURE__ */ React.createElement("nav", { className: "space-y-2 mb-8" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setCurrentPage("dashboard");
        setMobileMenuOpen(false);
      },
      className: `w-full flex items-center gap-3 px-4 py-2 rounded transition ${currentPage === "dashboard" ? "bg-cyan-500 text-slate-900 font-semibold" : "text-slate-400 hover:text-white"}`
    },
    /* @__PURE__ */ React.createElement(BarChart3, { className: "w-5 h-5" }),
    " Painel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setCurrentPage("medias");
        setMobileMenuOpen(false);
      },
      className: `w-full flex items-center gap-3 px-4 py-2 rounded transition ${currentPage === "medias" ? "bg-cyan-500 text-slate-900 font-semibold" : "text-slate-400 hover:text-white"}`
    },
    /* @__PURE__ */ React.createElement(Play, { className: "w-5 h-5" }),
    " M\xEDdias"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setCurrentPage("playlists");
        setMobileMenuOpen(false);
      },
      className: `w-full flex items-center gap-3 px-4 py-2 rounded transition ${currentPage === "playlists" ? "bg-cyan-500 text-slate-900 font-semibold" : "text-slate-400 hover:text-white"}`
    },
    /* @__PURE__ */ React.createElement(Play, { className: "w-5 h-5" }),
    " Listas de reprodu\xE7\xE3o"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setCurrentPage("tvs");
        setMobileMenuOpen(false);
      },
      className: `w-full flex items-center gap-3 px-4 py-2 rounded transition ${currentPage === "tvs" ? "bg-cyan-500 text-slate-900 font-semibold" : "text-slate-400 hover:text-white"}`
    },
    /* @__PURE__ */ React.createElement(Monitor, { className: "w-5 h-5" }),
    " TVs"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setCurrentPage("open-tv");
        setMobileMenuOpen(false);
      },
      className: `w-full flex items-center gap-3 px-4 py-2 rounded transition ${currentPage === "open-tv" ? "bg-cyan-500 text-slate-900 font-semibold" : "text-slate-400 hover:text-white"}`
    },
    /* @__PURE__ */ React.createElement(Monitor, { className: "w-5 h-5" }),
    " Abrir Tela"
  )), /* @__PURE__ */ React.createElement("div", { className: "border-t border-slate-700 pt-4 mb-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-xs font-semibold px-4 mb-3" }, "ADMINISTRA\xC7\xC3O"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setCurrentPage("users");
        setMobileMenuOpen(false);
      },
      className: `w-full flex items-center gap-3 px-4 py-2 rounded transition ${currentPage === "users" ? "bg-cyan-500 text-slate-900 font-semibold" : "text-slate-400 hover:text-white"}`
    },
    /* @__PURE__ */ React.createElement(Users, { className: "w-5 h-5" }),
    " Usu\xE1rios"
  )), /* @__PURE__ */ React.createElement("div", { className: "border-t border-slate-700 pt-4 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-700 rounded p-3 mb-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-xs" }, "Usu\xE1rio Logado"), /* @__PURE__ */ React.createElement("p", { className: "text-white font-semibold text-sm" }, currentUser.name), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-xs" }, currentUser.role === "admin" ? "Administrador" : "Usu\xE1rio")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleLogout,
      className: "w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white rounded transition"
    },
    /* @__PURE__ */ React.createElement(LogOut, { className: "w-5 h-5" }),
    " Sair"
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-auto" }, /* @__PURE__ */ React.createElement("div", { className: "md:hidden bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-white" }, "JJ M\xEDdia"), /* @__PURE__ */ React.createElement("button", { onClick: () => setMobileMenuOpen(true) }, /* @__PURE__ */ React.createElement(Menu, { className: "w-6 h-6 text-white" }))), currentPage === "dashboard" && /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white mb-8" }, "Painel"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-6" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mb-2" }, "M\xEDdias"), /* @__PURE__ */ React.createElement("p", { className: "text-4xl font-bold text-white" }, stats.medias), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-xs mt-2" }, "Imagens e v\xEDdeos")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-6" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mb-2" }, "Listas de reprodu\xE7\xE3o"), /* @__PURE__ */ React.createElement("p", { className: "text-4xl font-bold text-white" }, stats.playlists), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-xs mt-2" }, "Listas de reprodu\xE7\xE3o")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-6" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mb-2" }, "TVs"), /* @__PURE__ */ React.createElement("p", { className: "text-4xl font-bold text-white" }, stats.tvs), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-xs mt-2" }, "Cadastradas")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-6" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mb-2" }, "Usu\xE1rios"), /* @__PURE__ */ React.createElement("p", { className: "text-4xl font-bold text-white" }, stats.users), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-xs mt-2" }, "Conta no sistema"))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-6" }, /* @__PURE__ */ React.createElement("h3", { className: "text-white font-semibold mb-2" }, "Bem-vindo ao JJ M\xEDdia Indoor"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm" }, 'Use o menu lateral para gerenciar suas m\xEDdias, playlists e TVs. Para exibir conte\xFAdo em uma TV, basta acessar a p\xE1gina "Abrir Tela" e inserir o c\xF3digo da TV.'))), currentPage === "users" && /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white" }, "Usu\xE1rios"), currentUser.role === "admin" && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentPage("add-user"),
      className: "bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition"
    },
    "+ Novo Usu\xE1rio"
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-700" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold" }, "E-mail"), /* @__PURE__ */ React.createElement("th", { className: "px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold" }, "Status"), /* @__PURE__ */ React.createElement("th", { className: "px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold" }, "Cadastro"), /* @__PURE__ */ React.createElement("th", { className: "px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold" }, "A\xE7\xF5es"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-700" }, users.map((user) => /* @__PURE__ */ React.createElement("tr", { key: user.id, className: "hover:bg-slate-700 transition" }, /* @__PURE__ */ React.createElement("td", { className: "px-4 md:px-6 py-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-white font-medium" }, user.email), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-xs" }, user.role === "admin" ? "\u{1F451} Administrador" : "Usu\xE1rio")), /* @__PURE__ */ React.createElement("td", { className: "px-4 md:px-6 py-4" }, /* @__PURE__ */ React.createElement("span", { className: `inline-block px-3 py-1 rounded-full text-xs font-semibold ${user.status === "active" ? "bg-green-500 text-white" : "bg-slate-600 text-slate-300"}` }, user.status === "active" ? "Ativo" : "Inativo")), /* @__PURE__ */ React.createElement("td", { className: "px-4 md:px-6 py-4 text-slate-400 text-sm" }, user.createdAt), /* @__PURE__ */ React.createElement("td", { className: "px-4 md:px-6 py-4" }, currentUser.role === "admin" && user.id !== currentUser.id && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => toggleUserStatus(user.id),
      className: `px-3 py-1 rounded text-sm font-semibold transition ${user.status === "active" ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`
    },
    user.status === "active" ? "Desativar" : "Ativar"
  ))))))))), currentPage === "add-user" && currentUser.role === "admin" && /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white mb-8" }, "Novo Usu\xE1rio"), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Nome do usu\xE1rio",
      value: newUserName,
      onChange: (e) => setNewUserName(e.target.value),
      className: "w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-4"
    }
  ), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      placeholder: "E-mail",
      value: newUserEmail,
      onChange: (e) => setNewUserEmail(e.target.value),
      className: "w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-6"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: addNewUser,
      className: "flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition"
    },
    "Criar Usu\xE1rio"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentPage("users"),
      className: "flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded transition"
    },
    "Cancelar"
  )))), currentPage === "medias" && /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white mb-8" }, "M\xEDdias"), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-12 text-center" }, /* @__PURE__ */ React.createElement(Play, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 mb-4" }, "Gene\u0159e suas imagens e v\xEDdeos"), /* @__PURE__ */ React.createElement("button", { className: "bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-6 rounded transition" }, "+ Primeira m\xEDdia"))), currentPage === "playlists" && /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white" }, "Listas de reprodu\xE7\xE3o"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentPage("add-playlist"),
      className: "bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition flex items-center gap-2"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-5 h-5" }),
    " Lista de reprodu\xE7\xE3o Nova"
  )), playlists.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-12 text-center" }, /* @__PURE__ */ React.createElement(Play, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 mb-4" }, "Nenhuma lista de reprodu\xE7\xE3o cadastrada"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentPage("add-playlist"),
      className: "bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-6 rounded transition"
    },
    "+ Criar primeira playlist"
  )) : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, playlists.map((playlist) => /* @__PURE__ */ React.createElement("div", { key: playlist.id, className: "bg-slate-800 border border-slate-700 rounded-lg p-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-white font-semibold mb-2" }, playlist.name), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mb-4" }, playlist.midiasCount, " m\xEDdias"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-xs mb-4" }, "Criado em: ", playlist.createdAt), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => deletePlaylist(playlist.id),
      className: "w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition flex items-center gap-2 justify-center"
    },
    /* @__PURE__ */ React.createElement(Trash2, { className: "w-4 h-4" }),
    " Deletar"
  ))))), currentPage === "add-playlist" && /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white mb-8" }, "Nova Lista de Reprodu\xE7\xE3o"), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Nome da playlist",
      value: newPlaylistName,
      onChange: (e) => setNewPlaylistName(e.target.value),
      className: "w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-6"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        addPlaylist();
        setCurrentPage("playlists");
      },
      className: "flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition"
    },
    "Criar"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentPage("playlists"),
      className: "flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded transition"
    },
    "Cancelar"
  )))), currentPage === "tvs" && /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white" }, "TVs"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentPage("add-tv"),
      className: "bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition flex items-center gap-2"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-5 h-5" }),
    " Nova TV"
  )), tvs.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-12 text-center" }, /* @__PURE__ */ React.createElement(Monitor, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 mb-4" }, "Nenhuma TV cadastrada"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentPage("add-tv"),
      className: "bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-6 rounded transition"
    },
    "+ primeira TV"
  )) : /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-700" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold" }, "C\xF3digo"), /* @__PURE__ */ React.createElement("th", { className: "px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold" }, "Nome"), /* @__PURE__ */ React.createElement("th", { className: "px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold" }, "Status"), /* @__PURE__ */ React.createElement("th", { className: "px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold" }, "Cadastro"), /* @__PURE__ */ React.createElement("th", { className: "px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold" }, "A\xE7\xF5es"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-700" }, tvs.map((tv) => /* @__PURE__ */ React.createElement("tr", { key: tv.id, className: "hover:bg-slate-700 transition" }, /* @__PURE__ */ React.createElement("td", { className: "px-4 md:px-6 py-4 text-white font-semibold" }, tv.code), /* @__PURE__ */ React.createElement("td", { className: "px-4 md:px-6 py-4 text-white" }, tv.name), /* @__PURE__ */ React.createElement("td", { className: "px-4 md:px-6 py-4" }, /* @__PURE__ */ React.createElement("span", { className: `inline-block px-3 py-1 rounded-full text-xs font-semibold ${tv.status === "active" ? "bg-green-500 text-white" : "bg-slate-600 text-slate-300"}` }, tv.status === "active" ? "Ativa" : "Inativa")), /* @__PURE__ */ React.createElement("td", { className: "px-4 md:px-6 py-4 text-slate-400 text-sm" }, tv.createdAt), /* @__PURE__ */ React.createElement("td", { className: "px-4 md:px-6 py-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => toggleTvStatus(tv.id),
      className: `px-3 py-1 rounded text-sm font-semibold transition ${tv.status === "active" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`
    },
    tv.status === "active" ? "Desativar" : "Ativar"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => deleteTV(tv.id),
      className: "px-3 py-1 rounded text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition"
    },
    "Deletar"
  )))))))))), currentPage === "add-tv" && /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white mb-8" }, "Nova TV"), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "C\xF3digo da TV (ex: ABC123)",
      value: newTvCode,
      onChange: (e) => setNewTvCode(e.target.value.toUpperCase()),
      className: "w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-4"
    }
  ), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Nome/Localiza\xE7\xE3o",
      value: newTvName,
      onChange: (e) => setNewTvName(e.target.value),
      className: "w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-6"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        addTV();
        setCurrentPage("tvs");
      },
      className: "flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition"
    },
    "Criar TV"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCurrentPage("tvs"),
      className: "flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded transition"
    },
    "Cancelar"
  )))), currentPage === "open-tv" && /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white mb-8" }, "Abrir Tela"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-8" }, /* @__PURE__ */ React.createElement("h3", { className: "text-white font-bold text-lg mb-6" }, "Modo Paisagem"), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-700 p-8 rounded-lg mb-6 text-center border-2 border-dashed border-slate-600" }, /* @__PURE__ */ React.createElement(Monitor, { className: "w-20 h-20 text-cyan-400 mx-auto mb-4" }), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm" }, "Tela Horizontal (16:9)")), /* @__PURE__ */ React.createElement("label", { className: "block text-slate-400 text-sm mb-2" }, "C\xF3digo da TV"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "EX: ABC123",
      value: tvCodeInput,
      onChange: (e) => setTvCodeInput(e.target.value.toUpperCase()),
      className: "w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white placeholder-slate-500 mb-6 text-center font-mono text-lg"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setTvCodeInput(""),
      className: "flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded transition"
    },
    "Abrir aqui"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setTvCodeInput(""),
      className: "flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-3 px-4 rounded transition"
    },
    "Nova janela"
  ))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 border border-slate-700 rounded-lg p-8" }, /* @__PURE__ */ React.createElement("h3", { className: "text-white font-bold text-lg mb-6" }, "Modo Retrato"), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-700 p-12 rounded-lg mb-6 text-center border-2 border-dashed border-slate-600" }, /* @__PURE__ */ React.createElement("div", { style: { transform: "rotate(90deg)" }, className: "inline-block" }, /* @__PURE__ */ React.createElement(Monitor, { className: "w-16 h-16 text-cyan-400" })), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mt-4" }, "Tela Vertical (9:16)")), /* @__PURE__ */ React.createElement("label", { className: "block text-slate-400 text-sm mb-2" }, "C\xF3digo da TV"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "EX: DEF456",
      value: tvCodeInput,
      onChange: (e) => setTvCodeInput(e.target.value.toUpperCase()),
      className: "w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white placeholder-slate-500 mb-6 text-center font-mono text-lg"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setTvCodeInput(""),
      className: "flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded transition"
    },
    "Abrir aqui"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setTvCodeInput(""),
      className: "flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-3 px-4 rounded transition"
    },
    "Nova janela"
  )))))));
}
export {
  VideSystem as default
};
