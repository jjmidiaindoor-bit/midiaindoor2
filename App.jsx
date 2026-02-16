import React, { useState, useEffect } from 'react';
import { Users, BarChart3, Play, Monitor, LogOut, Menu, X, Plus, Trash2, List, Download } from 'lucide-react';
import { useStoredState } from './src/lib/hatch';
import { mediaService, categoryService, playlistService, tvService, authService } from './src/lib/supabase_api';

export default function VideoSystem() {
  // Estados de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  const [currentUser, setCurrentUser] = useStoredState('currentUser', null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [users, setUsers] = useStoredState('users', []);
  const [playlists, setPlaylists] = useStoredState('playlists', []);
  const [tvs, setTvs] = useStoredState('tvs', []);
  const [categories, setCategories] = useStoredState('categories', []);
  const [selectedCategory, setSelectedCategory] = useState('Geral');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistOrientation, setNewPlaylistOrientation] = useState('horizontal'); // 'horizontal' or 'vertical'
  const [playlistTab, setPlaylistTab] = useState('horizontal');
  const [newTvCode, setNewTvCode] = useState('');
  const [newTvName, setNewTvName] = useState('');
  const [newTvPlaylist, setNewTvPlaylist] = useState(''); // New state
  const [newTvOrientation, setNewTvOrientation] = useState('horizontal'); // New state
  const [tvCodeInputHorizontal, setTvCodeInputHorizontal] = useState('');
  const [tvCodeInputVertical, setTvCodeInputVertical] = useState('');

  const [medias, setMedias] = useState([]); // Changed from useStoredState to normal state (loaded from DB)
  const [mediaTab, setMediaTab] = useState('horizontal'); // 'horizontal' or 'vertical'
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState('image'); // 'image' or 'video'
  const [newMediaCategory, setNewMediaCategory] = useState('Geral');

  // Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [playingItems, setPlayingItems] = useState([]);
  const [opacity, setOpacity] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [verticalRotation, setVerticalRotation] = useStoredState('verticalRotation', 90); // 90 (left) or 270 (right)

  // Carregar dados do Supabase ao montar o componente
  useEffect(() => {
    if (currentUser) {
      loadDataFromSupabase();
    }
  }, [currentUser]);

  const loadDataFromSupabase = async () => {
    try {
      // Carregar mídias do usuário
      if (currentUser?.id) {
        const userMedias = await mediaService.getUserMedias(currentUser.id);
        // Garantir que as URLs sejam válidas para exibição
        const mediasWithValidUrls = userMedias.map(media => {
          if (media.file_path && !media.url.startsWith('http')) {
            // Se o media tem um file_path mas não tem uma URL pública válida, geramos a URL
            return {
              ...media,
              url: mediaService.getFileUrl(media.file_path)
            };
          }
          return media;
        });
        setMedias(mediasWithValidUrls);
      } else {
        // Se o usuário não foi autenticado via Supabase, tentar carregar do estado local
        console.log('Carregando mídias do estado local');
      }

      // Carregar categorias
      const loadedCategories = await categoryService.getCategories();
      setCategories(loadedCategories);

      // Carregar playlists
      const loadedPlaylists = await playlistService.getPlaylists();
      setPlaylists(loadedPlaylists);

      // Carregar TVs
      const loadedTvs = await tvService.getTVs();
      setTvs(loadedTvs);
    } catch (error) {
      console.error('Erro ao carregar dados do Supabase:', error);
    }
  };

  // Player Logic
  useEffect(() => {
    if (!isPlaying || playingItems.length === 0) return;

    const currentItem = playingItems[currentMediaIndex];
    const media = medias.find(m => m.id === currentItem.mediaId);

    // Default duration 5s if not found or invalid
    let duration = (currentItem.duration || 5) * 1000;

    // If video, we wait for 'ended' event, but here we set a failsafe or read duration metadata (complex for demo)
    // For this demo, let's treat video duration as fixed or assume auto-play handles it.
    // We'll stick to image transitions for the requested "smooth transition".
    if (media && media.type === 'video') {
      duration = 15000; // Mock video duration
    }

    const transitionTime = 1000; // 1s fade

    const timer = setTimeout(() => {
      setOpacity(0); // Fade out
      setTimeout(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % playingItems.length);
        setOpacity(1); // Fade in
      }, transitionTime);
    }, duration - transitionTime);

    return () => clearTimeout(timer);
  }, [isPlaying, currentMediaIndex, playingItems, medias]);

  // Auto-start player if code is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || params.get('tv');

    if (code && tvs.length > 0) {
      const tv = tvs.find(t => t.code === code.toUpperCase() && t.status === 'active');
      if (tv) {
        // Set a mock user just to bypass the login check if needed
        if (!currentUser) {
          setCurrentUser({ id: 'autostart', name: 'Auto Start', role: 'player' });
        }
        // Determine orientation from TV settings and start
        startPlayer(tv.orientation || 'horizontal', tv.code);
      }
    }
  }, [tvs]);

  const startPlayer = (orientation, directCode = null) => {
    let playlist = null;
    const codeInput = directCode || (orientation === 'horizontal' ? tvCodeInputHorizontal : tvCodeInputVertical);

    // 1. Try to find playlist by TV Code if input is set
    if (codeInput) {
      const tv = tvs.find(t => t.code === codeInput && t.status === 'active');
      if (tv && tv.playlistId) {
        playlist = playlists.find(p => p.id === tv.playlistId);
        // Check orientation match warning eventually? For now, we trust the user or just play it.
        if (playlist && playlist.orientation !== orientation) {
          console.warn("TV Playlist orientation mismatch");
        }
      } else if (codeInput && !tv) {
        if (!directCode) alert('TV não encontrada ou inativa com este código.');
        return;
      }
    }

    // 2. If no TV code or no playlist on TV, find a fallback suitable playlist (demo behavior)
    if (!playlist) {
      playlist = playlists.find(p => p.orientation === orientation && p.items && p.items.length > 0);
    }

    if (playlist) {
      setPlayingItems(playlist.items || []);
      setCurrentMediaIndex(0);
      setIsPlaying(true);
      setOpacity(1);

      // Apply rotation based on orientation
      if (orientation === 'vertical') {
        setRotation(verticalRotation);
      } else {
        setRotation(0);
      }
    } else {
      alert(`Nenhuma playlist ${orientation} encontrada (verifique se há mídias ou se o código da TV está correto).`);
    }
  };

  const generateTvCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // No size limit check anymore!
      // We use ObjectURL for immediate preview (very fast, no lag)
      const objectUrl = URL.createObjectURL(file);
      setNewMediaUrl(objectUrl);

      // We store the raw file object temporarily to save it to DB later
      // We'll attach it to the newMedia object in addMedia
      window.tempUploadFile = file;

      // Auto-detect type
      if (file.type.startsWith('image/')) setNewMediaType('image');
      if (file.type.startsWith('video/')) setNewMediaType('video');
    }
  };

  const addMedia = async () => {
    if (newMediaTitle && newMediaUrl && currentUser) {
      try {
        // Fazer upload do arquivo para o Storage do Supabase (opcional)
        let filePath = null;
        if (window.tempUploadFile) {
          const fileName = `${currentUser.id}/${Date.now()}_${window.tempUploadFile.name}`;
          const uploadResult = await mediaService.uploadMediaFile(window.tempUploadFile, fileName);
          filePath = uploadResult.path;
        }

        // Criar objeto de mídia
        const newMedia = {
          user_id: currentUser.id,
          title: newMediaTitle,
          type: newMediaType,
          orientation: mediaTab,
          category_id: newMediaCategory, // Precisaria converter nome para ID
          url: filePath ? mediaService.getFileUrl(filePath) : newMediaUrl, // Usar URL do Storage se disponível
          file_path: filePath
        };

        // Salvar no Supabase
        const savedMedia = await mediaService.addMedia(newMedia);

        // Atualizar estado local
        setMedias([...medias, savedMedia]);

        // Limpar formulário
        setNewMediaTitle('');
        setNewMediaUrl('');
        setNewMediaCategory('Geral');
        window.tempUploadFile = null;
        setIsUploadModalOpen(false);
      } catch (error) {
        console.error('Erro ao adicionar mídia:', error);
        alert('Erro ao adicionar mídia: ' + error.message);
      }
    }
  };

  const addCategory = async () => {
    if (newCategoryName) {
      try {
        const newCategory = await categoryService.addCategory(newCategoryName);
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
      } catch (error) {
        console.error('Erro ao adicionar categoria:', error);
        alert('Erro ao adicionar categoria: ' + error.message);
      }
    }
  };

  const deleteMedia = async (mediaId) => {
    if (confirm('Tem certeza que deseja excluir esta mídia?')) {
      try {
        await mediaService.deleteMedia(mediaId);
        setMedias(medias.filter(m => m.id !== mediaId));
        
        // Revogar URL do objeto se for uma URL de objeto
        const media = medias.find(m => m.id === mediaId);
        if (media && media.url && media.url.startsWith('blob:')) {
          URL.revokeObjectURL(media.url);
        }
      } catch (error) {
        console.error('Erro ao excluir mídia:', error);
        alert('Erro ao excluir mídia: ' + error.message);
      }
    }
  };

  const openPlaylistEditor = (playlist) => {
    // Migration: Ensure items array exists, converting mediaIds if necessary
    let items = playlist.items || [];
    if (!items.length && playlist.mediaIds && playlist.mediaIds.length) {
      items = playlist.mediaIds.map(id => ({ mediaId: id, duration: 10 }));
    }
    setEditingPlaylist({ ...playlist, items });
    setCurrentPage('edit-playlist');
  };

  const updateItemDuration = async (index, newDuration) => {
    if (editingPlaylist) {
      try {
        const itemToUpdate = editingPlaylist.items[index];
        await playlistService.updateItemDuration(itemToUpdate.id, newDuration);
        
        const updatedItems = [...editingPlaylist.items];
        updatedItems[index].duration = newDuration;
        const updatedPlaylist = { ...editingPlaylist, items: updatedItems };
        setEditingPlaylist(updatedPlaylist);
        
        // Atualizar playlists locais
        setPlaylists(playlists.map(p => p.id === editingPlaylist.id ? updatedPlaylist : p));
      } catch (error) {
        console.error('Erro ao atualizar duração do item:', error);
        alert('Erro ao atualizar duração do item: ' + error.message);
      }
    }
  };

  const addPlaylist = async () => {
    if (newPlaylistName) {
      try {
        const newPlaylist = await playlistService.addPlaylist({
          name: newPlaylistName,
          orientation: newPlaylistOrientation
        });
        
        setPlaylists([...playlists, newPlaylist]);
        setNewPlaylistName('');
        setNewPlaylistOrientation('horizontal');
      } catch (error) {
        console.error('Erro ao adicionar playlist:', error);
        alert('Erro ao adicionar playlist: ' + error.message);
      }
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (confirm('Tem certeza que deseja excluir esta playlist?')) {
      try {
        // A exclusão será feita automaticamente via constraint no banco de dados
        // pois playlist_items tem ON DELETE CASCADE
        setPlaylists(playlists.filter(p => p.id !== playlistId));
      } catch (error) {
        console.error('Erro ao excluir playlist:', error);
        alert('Erro ao excluir playlist: ' + error.message);
      }
    }
  };

  const addMediaToPlaylist = async (mediaId) => {
    if (editingPlaylist) {
      try {
        const media = medias.find(m => m.id === mediaId);
        const duration = media.type === 'video' ? 15 : 10; // vídeos têm duração padrão de 15s

        const newItem = await playlistService.addItemToPlaylist(editingPlaylist.id, mediaId, duration);

        const updatedItems = [...(editingPlaylist.items || []), newItem];
        const updatedPlaylist = {
          ...editingPlaylist,
          items: updatedItems,
          midiasCount: updatedItems.length
        };
        setEditingPlaylist(updatedPlaylist);
        setPlaylists(playlists.map(p => p.id === editingPlaylist.id ? updatedPlaylist : p));
        setIsMediaSelectorOpen(false);
      } catch (error) {
        console.error('Erro ao adicionar mídia à playlist:', error);
        alert('Erro ao adicionar mídia à playlist: ' + error.message);
      }
    }
  };

  const removeMediaFromPlaylist = async (indexToRemove) => {
    if (editingPlaylist) {
      try {
        const itemToRemove = editingPlaylist.items[indexToRemove];
        await playlistService.removeItemFromPlaylist(itemToRemove.id);
        
        const updatedItems = (editingPlaylist.items || []).filter((_, index) => index !== indexToRemove);
        const updatedPlaylist = {
          ...editingPlaylist,
          items: updatedItems,
          midiasCount: updatedItems.length
        };
        setEditingPlaylist(updatedPlaylist);
        setPlaylists(playlists.map(p => p.id === editingPlaylist.id ? updatedPlaylist : p));
      } catch (error) {
        console.error('Erro ao remover mídia da playlist:', error);
        alert('Erro ao remover mídia da playlist: ' + error.message);
      }
    }
  };

  const addTV = async () => {
    if (newTvCode && newTvName) {
      try {
        const newTV = await tvService.addTV({
          code: newTvCode,
          name: newTvName,
          orientation: newTvOrientation, // Save orientation
          playlist_id: parseInt(newTvPlaylist) || null // Save playlist ID
        });
        
        setTvs([...tvs, newTV]);
        setNewTvCode('');
        setNewTvName('');
        setNewTvPlaylist('');
        setNewTvOrientation('horizontal');
      } catch (error) {
        console.error('Erro ao adicionar TV:', error);
        alert('Erro ao adicionar TV: ' + error.message);
      }
    }
  };

  const updateTvPlaylist = async (tvId, playlistId) => {
    try {
      await tvService.updateTVPlaylist(tvId, playlistId);
      setTvs(tvs.map(t => t.id === tvId ? { ...t, playlist_id: parseInt(playlistId) || null } : t));
    } catch (error) {
      console.error('Erro ao atualizar playlist da TV:', error);
      alert('Erro ao atualizar playlist da TV: ' + error.message);
    }
  };

  const deleteTV = async (tvId) => {
    if (confirm('Tem certeza que deseja excluir esta TV?')) {
      setTvs(tvs.filter(t => t.id !== tvId));
    }
  };

  const toggleTvStatus = async (tvId) => {
    try {
      const updatedTv = await tvService.toggleTVStatus(tvId);
      setTvs(tvs.map(t => t.id === tvId ? updatedTv : t));
    } catch (error) {
      console.error('Erro ao alternar status da TV:', error);
      alert('Erro ao alternar status da TV: ' + error.message);
    }
  };

  const updateTvTransition = (tvId, transition) => {
    setTvs(tvs.map(tv => tv.id === tvId ? { ...tv, transition } : tv));
  };

  const updateTvTicker = (tvId, ticker) => {
    setTvs(tvs.map(tv => tv.id === tvId ? { ...tv, ticker } : tv));
  };

  const updateTvBanner = (tvId, bannerUrl) => {
    setTvs(tvs.map(tv => tv.id === tvId ? { ...tv, bannerUrl } : tv));
  };

  const handleBannerUpload = (tvId, e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateTvBanner(tvId, url);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      console.log('Tentando fazer login com email:', loginEmail);
      
      // Primeiro, tenta fazer login com o Supabase Auth
      const loginData = await authService.signIn(loginEmail, loginPassword);
      
      if (loginData.error) {
        console.error('Erro de autenticação:', loginData.error);
        setLoginError(loginData.error.message || 'E-mail ou senha inválidos.');
        return;
      }
      
      console.log('Login no Auth bem-sucedido, dados do usuário:', loginData.user);
      
      const supabaseUser = loginData.user;
      
      // Em seguida, busca os detalhes do usuário no banco de dados
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (userError) {
        console.log('Usuário não encontrado pelo ID, tentando buscar por email...');
        console.log('Erro ao buscar por ID:', userError);
        
        // Se o usuário não existe na tabela personalizada, pode ser porque foi criado apenas no Auth
        // Neste caso, vamos tentar encontrar pelo email
        const { data: userDataByEmail, error: userEmailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', supabaseUser.email)
          .single();

        if (userEmailError) {
          console.error('Erro ao buscar dados do usuário por email:', userEmailError);
          console.log('Tentando criar usuário na tabela personalizada...');
          
          // Se o usuário não existir nem por ID nem por email, vamos tentar criar um registro
          // Isso pode acontecer se o usuário foi criado no Auth mas não na tabela personalizada
          const { data: newUser, error: createUserError } = await supabase
            .from('users')
            .insert([{
              id: supabaseUser.id,
              email: supabaseUser.email,
              name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0], // Nome do metadata ou baseado no email
              password_hash: null, // Não armazenamos a senha novamente
              status: 'active',
              role: 'user',
              created_at: new Date().toISOString()
            }])
            .select()
            .single();
            
          if (createUserError && createUserError.code !== '23505') { // 23505 é erro de chave duplicada
            console.error('Erro ao criar usuário na tabela personalizada:', createUserError);
            setLoginError('Erro ao acessar os dados do usuário. Contate o administrador.');
            return;
          }
          
          // Se o erro foi de chave duplicada, significa que o usuário foi criado entre o tempo da verificação e da inserção
          // Nesse caso, tentamos buscar novamente
          if (createUserError && createUserError.code === '23505') {
            const { data: finalUserData, error: finalUserError } = await supabase
              .from('users')
              .select('*')
              .eq('email', supabaseUser.email)
              .single();
              
            if (finalUserError) {
              console.error('Erro ao buscar usuário após tentativa de criação:', finalUserError);
              setLoginError('Erro ao acessar os dados do usuário. Contate o administrador.');
              return;
            }
            
            setCurrentUser({
              id: finalUserData.id,
              email: finalUserData.email,
              name: finalUserData.name,
              role: finalUserData.role
            });
          } else {
            // Usuário criado com sucesso
            setCurrentUser({
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              role: newUser.role
            });
          }
        } else {
          // Usuário encontrado por email
          console.log('Usuário encontrado por email:', userDataByEmail);
          setCurrentUser({
            id: userDataByEmail.id,
            email: userDataByEmail.email,
            name: userDataByEmail.name,
            role: userDataByEmail.role
          });
        }
      } else {
        // Usuário encontrado por ID
        console.log('Usuário encontrado por ID:', userData);
        // Carregar dados do usuário do banco de dados
        setCurrentUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role
        });
      }
      
      console.log('Login bem-sucedido, redirecionando para dashboard');
      setCurrentPage('dashboard');
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error('Erro de login completo:', error);
      setLoginError(error.message || 'E-mail ou senha inválidos.');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setCurrentPage('login');
    } catch (error) {
      console.error('Erro de logout:', error);
    }
  };

  const toggleUserStatus = (userId) => {
    if (currentUser.role !== 'admin') return;
    setUsers(users.map(u =>
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  const deleteUser = (userId) => {
    if (currentUser.role !== 'admin') return;
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const addNewUser = () => {
    if (newUserEmail && newUserName && newUserPassword && currentUser.role === 'admin') {
      // Esta funcionalidade precisaria ser implementada com chamadas ao Supabase
      // para criar usuários, o que geralmente é feito no lado do servidor por segurança
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Modern Background Decorations */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="w-full max-w-md relative z-10">
          {/* Login Card with Glassmorphism */}
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-8 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-slate-950 p-5 rounded-2xl mb-4 border border-white/10 shadow-xl">
                  <Monitor className="w-10 h-10 text-cyan-400" />
                </div>
              </div>
              <h1 className="text-3xl font-black text-white text-center mb-2 tracking-tight">JJ MÍDIA</h1>
              <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-2"></div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em] text-center">Gestão de Mídia Indoor</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm group-hover:border-white/10"
                    placeholder="admin@jjmidia.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm group-hover:border-white/10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {loginError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold text-center py-3 rounded-xl animate-shake">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="group relative w-full mt-4"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative flex items-center justify-center bg-cyan-500 group-hover:bg-cyan-400 text-slate-950 font-black py-4 px-6 rounded-xl transition-all uppercase tracking-widest text-xs">
                  Acessar Sistema
                </div>
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <p className="text-center mt-8 text-slate-600 text-[10px] font-medium uppercase tracking-widest">
            &copy; 2026 JJ Mídia Indoor &bull; Tecnologia de Ponta
          </p>
        </div>
      </div>
    );
  }

  const stats = {
    medias: medias.filter(m => m.user_id === currentUser.id).length,
    playlists: playlists.length,
    tvs: tvs.length,
    users: users.length
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 lg:w-72 flex-col bg-slate-950/50 backdrop-blur-xl border-r border-white/5">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-900 p-3 rounded-xl border border-white/10">
                <Monitor className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="font-black text-white text-lg">JJ MÍDIA</h2>
              <p className="text-xs text-slate-500 font-bold">{currentUser.name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'medias', label: 'Mídias', icon: Play },
            { id: 'playlists', label: 'Playlists', icon: List },
            { id: 'tvs', label: 'Monitores', icon: Monitor },
            { id: 'users', label: 'Usuários', icon: Users }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                currentPage === item.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="absolute left-0 top-0 h-full w-64 bg-slate-950/90 backdrop-blur-xl border-r border-white/5 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8">
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-slate-900 p-3 rounded-xl border border-white/10">
                    <Monitor className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h2 className="font-black text-white text-lg">JJ MÍDIA</h2>
                  <p className="text-xs text-slate-500 font-bold">{currentUser.name}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'medias', label: 'Mídias', icon: Play },
                { id: 'playlists', label: 'Playlists', icon: List },
                { id: 'tvs', label: 'Monitores', icon: Monitor },
                { id: 'users', label: 'Usuários', icon: Users }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    currentPage === item.id
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="absolute bottom-6 left-0 right-0 p-4 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Page header */}
        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-black text-white capitalize">{currentPage}</h1>
          <p className="text-slate-500 text-sm">Gerencie seu conteúdo de mídia digital</p>
        </div>

        {/* Stats - only show on dashboard */}
        {currentPage === 'dashboard' && (
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-5 border border-white/5">
                <div className="text-2xl font-black text-cyan-400">{value}</div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                  {key === 'medias' && 'Mídias'}
                  {key === 'playlists' && 'Playlists'}
                  {key === 'tvs' && 'Monitores'}
                  {key === 'users' && 'Usuários'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic page content */}
        <div className="p-6">
          {currentPage === 'dashboard' && (
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5">
              <h2 className="text-xl font-black text-white mb-4">Visão Geral</h2>
              <p className="text-slate-400">Bem-vindo ao sistema de gestão de mídia indoor. Use o menu lateral para navegar entre as diferentes seções.</p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/50 rounded-xl p-5 border border-white/5">
                  <h3 className="font-black text-white mb-3">Últimas Mídias</h3>
                  <div className="space-y-3">
                    {medias.slice(0, 3).map(media => (
                      <div key={media.id} className="flex items-center space-x-3 p-3 bg-slate-900/50 rounded-lg">
                        <div className="bg-slate-800 rounded-lg p-2">
                          {media.type === 'image' ? (
                            <Play className="w-5 h-5 text-cyan-400" />
                          ) : (
                            <Play className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{media.title}</div>
                          <div className="text-xs text-slate-500">{media.created_at}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-slate-950/50 rounded-xl p-5 border border-white/5">
                  <h3 className="font-black text-white mb-3">Próximas TVs a reproduzir</h3>
                  <div className="space-y-3">
                    {tvs.slice(0, 3).map(tv => (
                      <div key={tv.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                        <div>
                          <div className="font-medium text-white text-sm">{tv.name}</div>
                          <div className="text-xs text-slate-500">Código: {tv.code}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          tv.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {tv.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'medias' && (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Painel de Categorias */}
              <div className="w-full md:w-64 lg:w-72 flex-shrink-0 mb-6 md:mb-0">
                <div className="bg-slate-900/70 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Categorias</h3>
                  <div className="flex flex-col gap-2">
                    <button
                      className={`text-left px-4 py-2 rounded-xl font-bold transition-all ${selectedCategory === 'Geral' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-white/5'}`}
                      onClick={() => setSelectedCategory('Geral')}
                    >
                      Geral
                    </button>
                    {categories.filter(cat => cat.name !== 'Geral').map(cat => (
                      <button
                        key={cat.id}
                        className={`text-left px-4 py-2 rounded-xl font-bold transition-all ${selectedCategory === cat.name ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-white/5'}`}
                        onClick={() => setSelectedCategory(cat.name)}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder="Nova categoria..."
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm mb-2"
                    />
                    <button
                      onClick={addCategory}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-xl transition-all text-xs"
                    >
                      + Criar Categoria
                    </button>
                  </div>
                </div>
              </div>

              {/* Conteúdo principal: header + grid */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-white">Mídias</h2>
                    <p className="text-slate-500 text-sm">Gerencie suas mídias digitais</p>
                  </div>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="group relative flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 px-5 rounded-xl transition-all uppercase tracking-widest text-xs shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Mídia
                  </button>
                </div>

                {/* Tabs para orientação */}
                <div className="flex border-b border-white/10 gap-2">
                  {['horizontal', 'vertical'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setMediaTab(tab)}
                      className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                        mediaTab === tab
                          ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-900'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      {tab === 'horizontal' ? 'Horizontal' : 'Vertical'}
                    </button>
                  ))}
                </div>

                {/* Grid de mídias */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {medias
                    .filter(media => media.orientation === mediaTab)
                    .filter(media => selectedCategory === 'Geral' || (media.category?.name === selectedCategory || media.category_id === selectedCategory))
                    .map(media => (
                      <div key={media.id} className="bg-slate-900/80 rounded-2xl overflow-hidden border border-white/10 group shadow-xl flex flex-col">
                        <div className="relative">
                          {media.type === 'image' ? (
                            <img 
                              src={media.url} 
                              alt={media.title} 
                              className="w-full h-40 object-cover"
                            />
                          ) : (
                            <div className="w-full h-40 bg-slate-800 flex items-center justify-center">
                              <Play className="w-10 h-10 text-purple-500" />
                            </div>
                          )}
                          <span className="absolute top-2 left-2 bg-slate-800/80 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow">{media.category?.name || 'GERAL'}</span>
                          <button
                            onClick={() => deleteMedia(media.id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/90 backdrop-blur rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <h3 className="font-bold text-white truncate mb-1">{media.title}</h3>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-slate-500 font-mono">{media.file_path ? media.file_path.split('/').pop() : 'arquivo'}</span>
                            <span className="text-xs text-slate-500">{media.size ? (media.size / 1024 / 1024).toFixed(2) + ' MB' : ''}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {currentPage === 'playlists' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">Gerenciamento de Playlists</h2>
                  <p className="text-slate-500 text-sm">Crie e organize playlists para seus monitores</p>
                </div>
                <button
                  onClick={() => document.getElementById('add-playlist-modal')?.classList.remove('hidden')}
                  className="group relative flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 px-5 rounded-xl transition-all uppercase tracking-widest text-xs"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Playlist
                </button>
              </div>

              {/* Playlists grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map(playlist => (
                  <div key={playlist.id} className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-5 border border-white/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white">{playlist.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{playlist.items?.length || 0} itens</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openPlaylistEditor(playlist)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePlaylist(playlist.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-slate-500 uppercase tracking-widest">Orientação</p>
                      <p className="text-sm text-white capitalize">{playlist.orientation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage === 'tvs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">Gerenciamento de Monitores</h2>
                  <p className="text-slate-500 text-sm">Configure e gerencie seus monitores digitais</p>
                </div>
                <button
                  onClick={() => document.getElementById('add-tv-modal')?.classList.remove('hidden')}
                  className="group relative flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 px-5 rounded-xl transition-all uppercase tracking-widest text-xs"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Monitor
                </button>
              </div>

              {/* TVs grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tvs.map(tv => (
                  <div key={tv.id} className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-5 border border-white/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white">{tv.name}</h3>
                        <p className="text-sm text-cyan-400 font-mono">{tv.code}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleTvStatus(tv.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            tv.status === 'active' 
                              ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10' 
                              : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            tv.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                        </button>
                        <button
                          onClick={() => deleteTV(tv.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-widest">Orientação</p>
                          <p className="text-sm text-white capitalize">{tv.orientation}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-widest">Status</p>
                          <p className={`text-sm font-bold ${
                            tv.status === 'active' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {tv.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 uppercase tracking-widest">Playlist Associada</p>
                        <select
                          value={tv.playlist_id || ''}
                          onChange={(e) => updateTvPlaylist(tv.id, e.target.value)}
                          className="w-full mt-1 bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        >
                          <option value="">Nenhuma</option>
                          {playlists.map(playlist => (
                            <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">Gerenciamento de Usuários</h2>
                  <p className="text-slate-500 text-sm">Controle de acesso e permissões</p>
                </div>
                <button
                  onClick={() => document.getElementById('add-user-modal')?.classList.remove('hidden')}
                  className="group relative flex items-center justify-center bg-green-500 hover:bg-green-400 text-slate-950 font-black py-3 px-5 rounded-xl transition-all uppercase tracking-widest text-xs"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Usuário
                </button>
              </div>

              {/* Users table */}
              <div className="overflow-x-auto">
                <table className="w-full bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/5">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-slate-400 font-bold text-xs uppercase tracking-widest">Nome</th>
                      <th className="text-left py-4 px-6 text-slate-400 font-bold text-xs uppercase tracking-widest">E-mail</th>
                      <th className="text-left py-4 px-6 text-slate-400 font-bold text-xs uppercase tracking-widest">Cargo</th>
                      <th className="text-left py-4 px-6 text-slate-400 font-bold text-xs uppercase tracking-widest">Status</th>
                      <th className="text-right py-4 px-6 text-slate-400 font-bold text-xs uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-white/5 last:border-b-0">
                        <td className="py-4 px-6 font-medium text-white">{user.name}</td>
                        <td className="py-4 px-6 text-slate-400">{user.email}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => toggleUserStatus(user.id)}
                              className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Modais */}
      {/* Modal de upload de mídia */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white">Adicionar Nova Mídia</h3>
                <button 
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setNewMediaTitle('');
                    setNewMediaUrl('');
                    setNewMediaCategory('Geral');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Título</label>
                <input
                  type="text"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  placeholder="Nome da mídia"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Arquivo</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="w-full bg-slate-800/50 border border-dashed border-white/20 rounded-xl px-4 py-8 text-center text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <p className="text-sm text-slate-500">Arraste e solte ou clique para selecionar</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tipo</label>
                  <select
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  >
                    <option value="image">Imagem</option>
                    <option value="video">Vídeo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                  <select
                    value={newMediaCategory}
                    onChange={(e) => setNewMediaCategory(e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/10 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setNewMediaTitle('');
                  setNewMediaUrl('');
                  setNewMediaCategory('Geral');
                }}
                className="px-5 py-3 rounded-xl border border-white/20 text-slate-300 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addMedia}
                className="group relative px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all"
              >
                Adicionar Mídia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Importando o ícone de upload que estava faltando
import { Upload } from 'lucide-react';