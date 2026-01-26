import React, { useState } from 'react';
import { Users, BarChart3, Play, Monitor, LogOut, Menu, X, Plus, Trash2 } from 'lucide-react';

const { useStoredState } = hatch;

export default function VideSystem() {
  const [currentUser, setCurrentUser] = useStoredState('currentUser', null);
  const [users, setUsers] = useStoredState('users', [
    { id: 1, email: 'admin@gmail.com', name: 'Administrador', status: 'active', role: 'admin', createdAt: '22/01/2026' },
    { id: 2, email: 'usuario1@gmail.com', name: 'Usuário 1', status: 'active', role: 'user', createdAt: '10/01/2026' },
    { id: 3, email: 'usuario2@gmail.com', name: 'Usuário 2', status: 'active', role: 'user', createdAt: '10/01/2026' }
  ]);
  const [playlists, setPlaylists] = useStoredState('playlists', [
    { id: 1, name: 'Playlist Principal', midiasCount: 5, createdAt: '15/01/2026' },
    { id: 2, name: 'Comerciais', midiasCount: 3, createdAt: '10/01/2026' }
  ]);
  const [tvs, setTvs] = useStoredState('tvs', [
    { id: 1, code: 'ABC123', name: 'TV Recepção', status: 'active', createdAt: '20/01/2026' },
    { id: 2, code: 'DEF456', name: 'TV Sala Espera', status: 'active', createdAt: '18/01/2026' }
  ]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newTvCode, setNewTvCode] = useState('');
  const [newTvName, setNewTvName] = useState('');
  const [tvCodeInput, setTvCodeInput] = useState('');

  const stats = {
    medias: users.filter(u => u.status === 'active').length * 3,
    playlists: playlists.length,
    tvs: tvs.length,
    users: users.length
  };

  const addPlaylist = () => {
    if (newPlaylistName) {
      const newPlaylist = {
        id: Math.max(...playlists.map(p => p.id), 0) + 1,
        name: newPlaylistName,
        midiasCount: 0,
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName('');
    }
  };

  const deletePlaylist = (playlistId) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
  };

  const addTV = () => {
    if (newTvCode && newTvName) {
      const newTV = {
        id: Math.max(...tvs.map(t => t.id), 0) + 1,
        code: newTvCode,
        name: newTvName,
        status: 'active',
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      setTvs([...tvs, newTV]);
      setNewTvCode('');
      setNewTvName('');
    }
  };

  const deleteTV = (tvId) => {
    setTvs(tvs.filter(t => t.id !== tvId));
  };

  const toggleTvStatus = (tvId) => {
    setTvs(tvs.map(t => 
      t.id === tvId ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t
    ));
  };

  const handleLogin = (email) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const toggleUserStatus = (userId) => {
    if (currentUser.role !== 'admin') return;
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  const addNewUser = () => {
    if (newUserEmail && newUserName && currentUser.role === 'admin') {
      const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        email: newUserEmail,
        name: newUserName,
        status: 'active',
        role: 'user',
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      setUsers([...users, newUser]);
      setNewUserEmail('');
      setNewUserName('');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <div className="flex justify-center mb-6">
              <div className="bg-cyan-500 p-4 rounded-lg">
                <Monitor className="w-8 h-8 text-slate-900" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-2">JJ Mídia Indoor</h1>
            <p className="text-slate-400 text-center mb-8">Sistema de Gestão de Mídia Indoor</p>
            
            <div className="space-y-4">
              <button
                onClick={() => handleLogin('admin@gmail.com')}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-3 px-4 rounded transition"
              >
                Entrar como Admin
              </button>
              <button
                onClick={() => handleLogin('usuario1@gmail.com')}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded transition"
              >
                Entrar como Usuário
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-56 bg-slate-800 border-r border-slate-700 p-4 fixed md:relative h-screen z-40 overflow-y-auto`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-cyan-500 p-2 rounded">
            <Monitor className="w-5 h-5 text-slate-900" />
          </div>
          <span className="font-bold text-white">JJ Mídia</span>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden ml-auto">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <nav className="space-y-2 mb-8">
          <button
            onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded transition ${currentPage === 'dashboard' ? 'bg-cyan-500 text-slate-900 font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            <BarChart3 className="w-5 h-5" /> Painel
          </button>
          <button
            onClick={() => { setCurrentPage('medias'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded transition ${currentPage === 'medias' ? 'bg-cyan-500 text-slate-900 font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            <Play className="w-5 h-5" /> Mídias
          </button>
          <button
            onClick={() => { setCurrentPage('playlists'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded transition ${currentPage === 'playlists' ? 'bg-cyan-500 text-slate-900 font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            <Play className="w-5 h-5" /> Listas de reprodução
          </button>
          <button
            onClick={() => { setCurrentPage('tvs'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded transition ${currentPage === 'tvs' ? 'bg-cyan-500 text-slate-900 font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            <Monitor className="w-5 h-5" /> TVs
          </button>
          <button
            onClick={() => { setCurrentPage('open-tv'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded transition ${currentPage === 'open-tv' ? 'bg-cyan-500 text-slate-900 font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            <Monitor className="w-5 h-5" /> Abrir Tela
          </button>
        </nav>

        <div className="border-t border-slate-700 pt-4 mb-4">
          <p className="text-slate-500 text-xs font-semibold px-4 mb-3">ADMINISTRAÇÃO</p>
          <button
            onClick={() => { setCurrentPage('users'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded transition ${currentPage === 'users' ? 'bg-cyan-500 text-slate-900 font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            <Users className="w-5 h-5" /> Usuários
          </button>
        </div>

        <div className="border-t border-slate-700 pt-4 mt-4">
          <div className="bg-slate-700 rounded p-3 mb-4">
            <p className="text-slate-400 text-xs">Usuário Logado</p>
            <p className="text-white font-semibold text-sm">{currentUser.name}</p>
            <p className="text-slate-500 text-xs">{currentUser.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white rounded transition"
          >
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="md:hidden bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
          <span className="font-bold text-white">JJ Mídia</span>
          <button onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Dashboard */}
        {currentPage === 'dashboard' && (
          <div className="p-6 md:p-8">
            <h2 className="text-3xl font-bold text-white mb-8">Painel</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Mídias</p>
                <p className="text-4xl font-bold text-white">{stats.medias}</p>
                <p className="text-slate-500 text-xs mt-2">Imagens e vídeos</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Listas de reprodução</p>
                <p className="text-4xl font-bold text-white">{stats.playlists}</p>
                <p className="text-slate-500 text-xs mt-2">Listas de reprodução</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">TVs</p>
                <p className="text-4xl font-bold text-white">{stats.tvs}</p>
                <p className="text-slate-500 text-xs mt-2">Cadastradas</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Usuários</p>
                <p className="text-4xl font-bold text-white">{stats.users}</p>
                <p className="text-slate-500 text-xs mt-2">Conta no sistema</p>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-2">Bem-vindo ao JJ Mídia Indoor</h3>
              <p className="text-slate-400 text-sm">Use o menu lateral para gerenciar suas mídias, playlists e TVs. Para exibir conteúdo em uma TV, basta acessar a página "Abrir Tela" e inserir o código da TV.</p>
            </div>
          </div>
        )}

        {/* Users Management */}
        {currentPage === 'users' && (
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold text-white">Usuários</h2>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setCurrentPage('add-user')}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition"
                >
                  + Novo Usuário
                </button>
              )}
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold">E-mail</th>
                      <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold">Status</th>
                      <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold">Cadastro</th>
                      <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-700 transition">
                        <td className="px-4 md:px-6 py-4">
                          <p className="text-white font-medium">{user.email}</p>
                          <p className="text-slate-500 text-xs">{user.role === 'admin' ? '👑 Administrador' : 'Usuário'}</p>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-300'}`}>
                            {user.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-slate-400 text-sm">{user.createdAt}</td>
                        <td className="px-4 md:px-6 py-4">
                          {currentUser.role === 'admin' && user.id !== currentUser.id && (
                            <button
                              onClick={() => toggleUserStatus(user.id)}
                              className={`px-3 py-1 rounded text-sm font-semibold transition ${user.status === 'active' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                            >
                              {user.status === 'active' ? 'Desativar' : 'Ativar'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add User */}
        {currentPage === 'add-user' && currentUser.role === 'admin' && (
          <div className="p-6 md:p-8">
            <h2 className="text-3xl font-bold text-white mb-8">Novo Usuário</h2>
            
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md">
              <input
                type="text"
                placeholder="Nome do usuário"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-4"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-6"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={addNewUser}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition"
                >
                  Criar Usuário
                </button>
                <button
                  onClick={() => setCurrentPage('users')}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Medias */}
        {currentPage === 'medias' && (
          <div className="p-6 md:p-8">
            <h2 className="text-3xl font-bold text-white mb-8">Mídias</h2>
            
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <Play className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Geneře suas imagens e vídeos</p>
              <button className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-6 rounded transition">
                + Primeira mídia
              </button>
            </div>
          </div>
        )}

        {/* Playlists */}
        {currentPage === 'playlists' && (
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold text-white">Listas de reprodução</h2>
              <button
                onClick={() => setCurrentPage('add-playlist')}
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Lista de reprodução Nova
              </button>
            </div>

            {playlists.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
                <Play className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">Nenhuma lista de reprodução cadastrada</p>
                <button
                  onClick={() => setCurrentPage('add-playlist')}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-6 rounded transition"
                >
                  + Criar primeira playlist
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map(playlist => (
                  <div key={playlist.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">{playlist.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{playlist.midiasCount} mídias</p>
                    <p className="text-slate-500 text-xs mb-4">Criado em: {playlist.createdAt}</p>
                    <button
                      onClick={() => deletePlaylist(playlist.id)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition flex items-center gap-2 justify-center"
                    >
                      <Trash2 className="w-4 h-4" /> Deletar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Playlist */}
        {currentPage === 'add-playlist' && (
          <div className="p-6 md:p-8">
            <h2 className="text-3xl font-bold text-white mb-8">Nova Lista de Reprodução</h2>
            
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md">
              <input
                type="text"
                placeholder="Nome da playlist"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-6"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => { addPlaylist(); setCurrentPage('playlists'); }}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition"
                >
                  Criar
                </button>
                <button
                  onClick={() => setCurrentPage('playlists')}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TVs */}
        {currentPage === 'tvs' && (
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold text-white">TVs</h2>
              <button
                onClick={() => setCurrentPage('add-tv')}
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Nova TV
              </button>
            </div>

            {tvs.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
                <Monitor className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">Nenhuma TV cadastrada</p>
                <button
                  onClick={() => setCurrentPage('add-tv')}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-6 rounded transition"
                >
                  + primeira TV
                </button>
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold">Código</th>
                        <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold">Nome</th>
                        <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold">Status</th>
                        <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold">Cadastro</th>
                        <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-sm font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {tvs.map(tv => (
                        <tr key={tv.id} className="hover:bg-slate-700 transition">
                          <td className="px-4 md:px-6 py-4 text-white font-semibold">{tv.code}</td>
                          <td className="px-4 md:px-6 py-4 text-white">{tv.name}</td>
                          <td className="px-4 md:px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${tv.status === 'active' ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-300'}`}>
                              {tv.status === 'active' ? 'Ativa' : 'Inativa'}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 text-slate-400 text-sm">{tv.createdAt}</td>
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleTvStatus(tv.id)}
                                className={`px-3 py-1 rounded text-sm font-semibold transition ${tv.status === 'active' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                              >
                                {tv.status === 'active' ? 'Desativar' : 'Ativar'}
                              </button>
                              <button
                                onClick={() => deleteTV(tv.id)}
                                className="px-3 py-1 rounded text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition"
                              >
                                Deletar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add TV */}
        {currentPage === 'add-tv' && (
          <div className="p-6 md:p-8">
            <h2 className="text-3xl font-bold text-white mb-8">Nova TV</h2>
            
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md">
              <input
                type="text"
                placeholder="Código da TV (ex: ABC123)"
                value={newTvCode}
                onChange={(e) => setNewTvCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-4"
              />
              <input
                type="text"
                placeholder="Nome/Localização"
                value={newTvName}
                onChange={(e) => setNewTvName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-6"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => { addTV(); setCurrentPage('tvs'); }}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition"
                >
                  Criar TV
                </button>
                <button
                  onClick={() => setCurrentPage('tvs')}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Open TV */}
        {currentPage === 'open-tv' && (
          <div className="p-6 md:p-8">
            <h2 className="text-3xl font-bold text-white mb-8">Abrir Tela</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Horizontal Layout */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
                <h3 className="text-white font-bold text-lg mb-6">Modo Paisagem</h3>
                <div className="bg-slate-700 p-8 rounded-lg mb-6 text-center border-2 border-dashed border-slate-600">
                  <Monitor className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm">Tela Horizontal (16:9)</p>
                </div>
                
                <label className="block text-slate-400 text-sm mb-2">Código da TV</label>
                <input
                  type="text"
                  placeholder="EX: ABC123"
                  value={tvCodeInput}
                  onChange={(e) => setTvCodeInput(e.target.value.toUpperCase())}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white placeholder-slate-500 mb-6 text-center font-mono text-lg"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setTvCodeInput('')}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded transition"
                  >
                    Abrir aqui
                  </button>
                  <button
                    onClick={() => setTvCodeInput('')}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-3 px-4 rounded transition"
                  >
                    Nova janela
                  </button>
                </div>
              </div>

              {/* Vertical Layout */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
                <h3 className="text-white font-bold text-lg mb-6">Modo Retrato</h3>
                <div className="bg-slate-700 p-12 rounded-lg mb-6 text-center border-2 border-dashed border-slate-600">
                  <div style={{ transform: 'rotate(90deg)' }} className="inline-block">
                    <Monitor className="w-16 h-16 text-cyan-400" />
                  </div>
                  <p className="text-slate-400 text-sm mt-4">Tela Vertical (9:16)</p>
                </div>
                
                <label className="block text-slate-400 text-sm mb-2">Código da TV</label>
                <input
                  type="text"
                  placeholder="EX: DEF456"
                  value={tvCodeInput}
                  onChange={(e) => setTvCodeInput(e.target.value.toUpperCase())}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white placeholder-slate-500 mb-6 text-center font-mono text-lg"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setTvCodeInput('')}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded transition"
                  >
                    Abrir aqui
                  </button>
                  <button
                    onClick={() => setTvCodeInput('')}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-3 px-4 rounded transition"
                  >
                    Nova janela
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}