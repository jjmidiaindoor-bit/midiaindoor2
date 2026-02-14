import React, { useState } from 'react';
import { Users, BarChart3, Play, Monitor, LogOut, Menu, X, Plus, Trash2, List, Download } from 'lucide-react';
import { useStoredState } from './src/lib/hatch';
import { db } from './src/lib/db';

export default function VideSystem() {
    // Estados de Login
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

    const [currentUser, setCurrentUser] = useStoredState('currentUser', null);
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
    const [users, setUsers] = useStoredState('users', [
        { id: 1, email: 'josetecnico21@gmail.com', name: 'Administrador', password: 'tenderbr0@@', status: 'active', role: 'admin', createdAt: '22/01/2026' },
        { id: 2, email: 'usuario@exemplo.com', name: 'Usuário Teste', password: '123', status: 'active', role: 'user', createdAt: '10/01/2026' }
    ]);
    const [playlists, setPlaylists] = useStoredState('playlists', [
        { id: 1, name: 'Playlist Principal', midiasCount: 5, createdAt: '15/01/2026' },
        { id: 2, name: 'Comerciais', midiasCount: 3, createdAt: '10/01/2026' }
    ]);
    const [tvs, setTvs] = useStoredState('tvs', [
        { id: 1, code: 'ABC123', name: 'TV Recepção', status: 'active', createdAt: '20/01/2026', transition: 'smooth', ticker: '', bannerUrl: '' },
        { id: 2, code: 'DEF456', name: 'TV Sala Espera', status: 'active', createdAt: '18/01/2026', transition: 'smooth', ticker: '', bannerUrl: '' }
    ]);
    const [categories, setCategories] = useStoredState('categories', [
        { id: 1, name: 'Geral' },
        { id: 2, name: 'pollgreen' },
        { id: 3, name: 'fdfd' }
    ]);
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

    // Load Medias from DB on Mount
    React.useEffect(() => {
        const loadMedias = async () => {
            try {
                const loadedMedias = await db.getAllMedias();
                // Create ObjectURLs for display if necessary, or simple ensure url is valid.
                // Since we might save the Blob directly, we need to create URLs on load?
                // Actually, let's keep it simple: We will save the Blob in DB, but for the 'url' property in state, we need a valid URL.
                // However, creating URLs for ALL medias at once might be memory heavy.
                // Better approach: Save the Blob in DB. When loading, create local URL?
                // For simplicity in this "mock" environment, let's assume valid URLs are persisted if they are external,
                // but for uploads, they are Blobs.

                // Let's iterate and create URLs for blobs if needed (omitted for speed unless we see issues, 
                // but actually we need to convert stored Blob back to URL to display).

                const mediasWithUrls = loadedMedias.map(m => {
                    if (m.blob && !m.url.startsWith('blob:') && !m.url.startsWith('data:')) {
                        // This is a reload case. We need to recreate the object URL from the Blob.
                        // But we can't easily check if URL is stale.
                        // Simplest: Always create new URL from Blob if it exists.
                        return { ...m, url: URL.createObjectURL(m.blob) };
                    }
                    return m;
                });
                setMedias(mediasWithUrls);
            } catch (error) {
                console.error("Failed to load medias", error);
            }
        };
        loadMedias();
    }, []);

    // Player Logic
    React.useEffect(() => {
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
    React.useEffect(() => {
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
        if (newMediaTitle && newMediaUrl) {
            const newMedia = {
                id: Date.now(),
                userId: currentUser.id,
                title: newMediaTitle,
                type: newMediaType,
                orientation: mediaTab,
                category: newMediaCategory,
                url: newMediaUrl, // Keep the ObjectURL for current session
                blob: window.tempUploadFile, // Save the actual file blob
                createdAt: new Date().toLocaleDateString('pt-BR')
            };

            // Optimistic update
            setMedias([...medias, newMedia]);

            // Save to DB
            try {
                await db.addMedia(newMedia);
            } catch (err) {
                console.error("Error saving media to DB", err);
                alert("Erro ao salvar mídia no banco de dados local.");
            }

            setNewMediaTitle('');
            setNewMediaUrl('');
            setNewMediaCategory('Geral');
            window.tempUploadFile = null;
            setIsUploadModalOpen(false);
        }
    };

    const addCategory = () => {
        if (newCategoryName && !categories.find(c => c.name === newCategoryName)) {
            const newCategory = {
                id: Date.now(),
                name: newCategoryName
            };
            setCategories([...categories, newCategory]);
            setNewCategoryName('');
        }
    };

    const deleteMedia = async (mediaId) => {
        if (confirm('Tem certeza que deseja excluir esta mídia?')) {
            const media = medias.find(m => m.id === mediaId);
            setMedias(medias.filter(m => m.id !== mediaId));

            // Remove from DB
            try {
                await db.deleteMedia(mediaId);
                if (media && media.url && media.url.startsWith('blob:')) {
                    URL.revokeObjectURL(media.url);
                }
            } catch (err) {
                console.error("Error deleting media from DB", err);
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

    const updateItemDuration = (index, newDuration) => {
        if (editingPlaylist) {
            const updatedItems = [...editingPlaylist.items];
            updatedItems[index].duration = newDuration;
            const updatedPlaylist = { ...editingPlaylist, items: updatedItems };
            setEditingPlaylist(updatedPlaylist);
            setPlaylists(playlists.map(p => p.id === editingPlaylist.id ? updatedPlaylist : p));
        }
    };

    const addPlaylist = () => {
        if (newPlaylistName) {
            const newPlaylist = {
                id: Math.max(...playlists.map(p => p.id), 0) + 1,
                name: newPlaylistName,
                orientation: newPlaylistOrientation,
                midiasCount: 0,
                items: [],
                createdAt: new Date().toLocaleDateString('pt-BR')
            };
            setPlaylists([...playlists, newPlaylist]);
            setNewPlaylistName('');
            setNewPlaylistOrientation('horizontal');
        }
    };

    const deletePlaylist = (playlistId) => {
        setPlaylists(playlists.filter(p => p.id !== playlistId));
    };

    const addMediaToPlaylist = (mediaId) => {
        if (editingPlaylist) {
            const media = medias.find(m => m.id === mediaId);
            const duration = media.type === 'video' ? 'video' : 10;

            const updatedItems = [...(editingPlaylist.items || []), { mediaId, duration }];

            const updatedPlaylist = {
                ...editingPlaylist,
                items: updatedItems,
                midiasCount: updatedItems.length
            };
            setEditingPlaylist(updatedPlaylist);
            setPlaylists(playlists.map(p => p.id === editingPlaylist.id ? updatedPlaylist : p));
            setIsMediaSelectorOpen(false);
        }
    };

    const removeMediaFromPlaylist = (indexToRemove) => {
        if (editingPlaylist) {
            const updatedItems = (editingPlaylist.items || []).filter((_, index) => index !== indexToRemove);
            const updatedPlaylist = {
                ...editingPlaylist,
                items: updatedItems,
                midiasCount: updatedItems.length
            };
            setEditingPlaylist(updatedPlaylist);
            setPlaylists(playlists.map(p => p.id === editingPlaylist.id ? updatedPlaylist : p));
        }
    };

    const addTV = () => {
        if (newTvCode && newTvName) {
            const newTV = {
                id: Math.max(...tvs.map(t => t.id), 0) + 1,
                code: newTvCode,
                name: newTvName,
                orientation: newTvOrientation, // Save orientation
                playlistId: parseInt(newTvPlaylist) || null, // Save playlist ID
                status: 'active',
                createdAt: new Date().toLocaleDateString('pt-BR')
            };
            setTvs([...tvs, newTV]);
            setNewTvCode('');
            setNewTvName('');
            setNewTvPlaylist('');
            setNewTvOrientation('horizontal');
        }
    };

    const updateTvPlaylist = (tvId, playlistId) => {
        setTvs(tvs.map(t => t.id === tvId ? { ...t, playlistId: parseInt(playlistId) || null } : t));
    };

    const deleteTV = (tvId) => {
        setTvs(tvs.filter(t => t.id !== tvId));
    };

    const toggleTvStatus = (tvId) => {
        setTvs(tvs.map(t =>
            t.id === tvId ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t
        ));
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

    const handleLogin = (e) => {
        e.preventDefault();
        setLoginError('');

        const normalizedEmail = loginEmail.toLowerCase().trim();
        const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

        if (user && user.password === loginPassword) {
            if (user.status === 'active') {
                setCurrentUser(user);
                setCurrentPage('dashboard');
                setLoginEmail('');
                setLoginPassword('');
            } else {
                setLoginError('Usuário desativado. Contate o administrador.');
            }
        } else {
            setLoginError('E-mail ou senha inválidos.');
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

    const deleteUser = (userId) => {
        if (currentUser.role !== 'admin') return;
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            setUsers(users.filter(u => u.id !== userId));
        }
    };

    const addNewUser = () => {
        if (newUserEmail && newUserName && newUserPassword && currentUser.role === 'admin') {
            const newUser = {
                id: Math.max(...users.map(u => u.id), 0) + 1,
                email: newUserEmail.toLowerCase().trim(),
                name: newUserName,
                password: newUserPassword,
                address: newUserAddress,
                status: 'active',
                role: 'user',
                createdAt: new Date().toLocaleDateString('pt-BR')
            };
            setUsers([...users, newUser]);
            setNewUserEmail('');
            setNewUserName('');
            setNewUserPassword('');
            setNewUserAddress('');
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
        medias: medias.filter(m => m.userId === currentUser.id).length,
        playlists: playlists.length,
        tvs: tvs.length,
        users: users.length
    };

    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden">
            {/* Sidebar */}
            <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-64 bg-slate-900 border-r border-slate-800 fixed md:relative h-screen z-40 transition-all duration-300`}>
                <div className="flex items-center gap-2 mb-8 px-6 pt-6">
                    <div className="bg-cyan-500 p-1.5 rounded-lg shadow-lg shadow-cyan-500/20">
                        <Monitor className="w-6 h-6 text-slate-900" />
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter uppercase">JJ Mídia</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden ml-auto">
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 px-4">
                    <button
                        onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${currentPage === 'dashboard' ? 'bg-cyan-500 text-slate-900 font-bold shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
                    >
                        <BarChart3 className="w-5 h-5" /> Painel
                    </button>
                    <button
                        onClick={() => { setCurrentPage('medias'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${currentPage === 'medias' ? 'bg-cyan-500 text-slate-900 font-bold shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
                    >
                        <Play className="w-5 h-5" /> Mídias
                    </button>
                    <button
                        onClick={() => { setCurrentPage('playlists'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${currentPage === 'playlists' ? 'bg-cyan-500 text-slate-900 font-bold shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
                    >
                        <List className="w-5 h-5" /> Listas de reprodução
                    </button>
                    <button
                        onClick={() => { setCurrentPage('tvs'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${currentPage === 'tvs' ? 'bg-cyan-500 text-slate-900 font-bold shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
                    >
                        <Monitor className="w-5 h-5" /> TVs
                    </button>
                    <button
                        onClick={() => { setCurrentPage('open-tv'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${currentPage === 'open-tv' ? 'bg-cyan-500 text-slate-900 font-bold shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
                    >
                        <Monitor className="w-5 h-5" /> Abrir Tela
                    </button>

                    <div className="border-t border-slate-800/50 pt-4 mt-4">
                        <p className="text-slate-600 text-[10px] font-black px-4 mb-3 uppercase tracking-widest">ADMINISTRAÇÃO</p>
                        <button
                            onClick={() => { setCurrentPage('users'); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${currentPage === 'users' ? 'bg-cyan-500 text-slate-900 font-bold shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
                        >
                            <Users className="w-5 h-5" /> Usuários
                        </button>
                    </div>
                </nav>

                <div className="border-t border-slate-800/50 p-4">
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-3 shadow-inner">
                        <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] mb-1.5">Usuário Ativo</p>
                        <p className="text-white font-bold text-sm truncate">{currentUser.name}</p>
                        <p className="text-cyan-500/60 text-[10px] font-bold tracking-tight uppercase">{currentUser.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent rounded-lg transition-all font-bold text-sm"
                    >
                        <LogOut className="w-4 h-4" /> Sair
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
                                            <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-[11px] font-bold uppercase tracking-wider">E-mail</th>
                                            <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-[11px] font-bold uppercase tracking-wider">Status</th>
                                            <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-[11px] font-bold uppercase tracking-wider">Cadastro</th>
                                            <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-[11px] font-bold uppercase tracking-wider">Ações</th>
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
                                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${user.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-700/50 text-slate-500 border-slate-700'}`}>
                                                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-slate-400 text-xs font-medium tracking-tight">
                                                    {user.createdAt}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="flex gap-2">
                                                        {currentUser.role === 'admin' && user.id !== currentUser.id && (
                                                            <button
                                                                onClick={() => toggleUserStatus(user.id)}
                                                                className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-tighter transition-all ${user.status === 'active' ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-900 shadow-lg shadow-yellow-500/10' : 'bg-green-500 hover:bg-green-600 text-slate-900'}`}
                                                            >
                                                                {user.status === 'active' ? 'Desativar' : 'Ativar'}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => alert(`A senha de ${user.email} é: ${user.password}`)}
                                                            className="px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-tighter bg-cyan-500 hover:bg-cyan-600 text-slate-900 transition-all shadow-lg shadow-cyan-500/10"
                                                        >
                                                            Senha
                                                        </button>
                                                        {currentUser.role === 'admin' && user.id !== currentUser.id && (
                                                            <button
                                                                onClick={() => deleteUser(user.id)}
                                                                className="px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-tighter bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-500/10"
                                                            >
                                                                Excluir
                                                            </button>
                                                        )}
                                                    </div>
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
                                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-4"
                            />
                            <input
                                type="password"
                                placeholder="Senha"
                                value={newUserPassword}
                                onChange={(e) => setNewUserPassword(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-4"
                            />
                            <input
                                type="text"
                                placeholder="Endereço"
                                value={newUserAddress}
                                onChange={(e) => setNewUserAddress(e.target.value)}
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
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <h2 className="text-3xl font-bold text-white">Gerenciar Mídias</h2>
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Adicionar Mídia
                            </button>
                        </div>

                        {/* Orientation Tabs */}
                        <div className="flex gap-4 mb-8 border-b border-slate-700">
                            <button
                                onClick={() => setMediaTab('horizontal')}
                                className={`pb-4 px-4 font-medium transition ${mediaTab === 'horizontal' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-slate-400 hover:text-white'}`}
                            >
                                TV Horizontal (16:9)
                            </button>
                            <button
                                onClick={() => setMediaTab('vertical')}
                                className={`pb-4 px-4 font-medium transition ${mediaTab === 'vertical' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-slate-400 hover:text-white'}`}
                            >
                                TV Vertical (9:16)
                            </button>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Categories Sidebar */}
                            <div className="w-full lg:w-64 flex-shrink-0">
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-xl">
                                    <h3 className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-6">Categorias</h3>
                                    <div className="space-y-2 mb-8">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.name)}
                                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat.name ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-6 border-t border-slate-700">
                                        <input
                                            type="text"
                                            placeholder="Nova categoria..."
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 mb-3 focus:border-cyan-500 outline-none transition-all"
                                        />
                                        <button
                                            onClick={addCategory}
                                            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all border border-slate-600"
                                        >
                                            + Criar Categoria
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Media Content */}
                            <div className="flex-1">
                                {/* Media Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {medias.filter(m =>
                                        m.orientation === mediaTab &&
                                        (selectedCategory === 'Geral' || m.category === selectedCategory) &&
                                        (m.userId === currentUser.id)
                                    ).map(media => (
                                        <div key={media.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden group shadow-lg hover:shadow-cyan-500/5 transition-all duration-300">
                                            <div className={`relative bg-slate-900 flex items-center justify-center overflow-hidden h-48`}>
                                                {media.type === 'video' ? (
                                                    <video src={media.url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={media.url} alt={media.title} className="w-full h-full object-cover" />
                                                )}
                                                <div className="absolute top-2 left-2">
                                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-black/60 text-white border border-white/10 backdrop-blur-md">
                                                        {media.category || 'Geral'}
                                                    </span>
                                                </div>
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button onClick={() => deleteMedia(media.id)} className="p-3 bg-red-500/90 rounded-full text-white hover:bg-red-500 transition-all transform hover:scale-110">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                {media.type === 'video' && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:hidden">
                                                        <Play className="w-10 h-10 text-cyan-500/80 fill-cyan-500/20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <h3 className="text-white font-bold text-sm truncate mb-1" title={media.title}>{media.title}</h3>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-slate-500 text-[11px] font-medium">{media.createdAt}</p>
                                                    <span className="text-[10px] uppercase font-black text-slate-600 tracking-tighter">
                                                        {media.type === 'video' ? 'VÍDEO' : 'IMAGEM'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Empty State */}
                                    {medias.filter(m => m.orientation === mediaTab && (selectedCategory === 'Geral' || m.category === selectedCategory)).length === 0 && (
                                        <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-800/20">
                                            <Play className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                            <p className="text-lg font-medium text-slate-600">Nenhuma mídia encontrada nesta categoria.</p>
                                            <p className="text-sm text-slate-700">Adicione uma nova mídia para começar.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Upload Modal */}
                        {isUploadModalOpen && (
                            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                                <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
                                    <h3 className="text-xl font-bold text-white mb-4">Nova Mídia ({mediaTab === 'horizontal' ? 'Horizontal' : 'Vertical'})</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Título</label>
                                            <input
                                                type="text"
                                                value={newMediaTitle}
                                                onChange={(e) => setNewMediaTitle(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm"
                                                placeholder="Ex: Propaganda Natal"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-slate-400 mb-2">Categoria</label>
                                            <select
                                                value={newMediaCategory}
                                                onChange={(e) => setNewMediaCategory(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-600 rounded p-2.5 text-white text-sm outline-none focus:border-cyan-500"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-slate-400 mb-2">Tipo de Tela</label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setMediaTab('horizontal')}
                                                    className={`flex-1 py-2 text-xs rounded border transition ${mediaTab === 'horizontal' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-600 text-slate-400'}`}
                                                >
                                                    Horizontal (16:9)
                                                </button>
                                                <button
                                                    onClick={() => setMediaTab('vertical')}
                                                    className={`flex-1 py-2 text-xs rounded border transition ${mediaTab === 'vertical' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-600 text-slate-400'}`}
                                                >
                                                    Vertical (9:16)
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Arquivo</label>
                                            <div className="border border-slate-600 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-slate-700/50 transition relative">
                                                <input
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    onChange={handleFileUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="text-slate-300 text-sm">
                                                    {newMediaUrl ? 'Arquivo selecionado!' : 'Clique para selecionar'}
                                                </div>
                                                <div className="text-slate-500 text-xs mt-1">.jpg, .png, .mp4 (Max 5MB)</div>
                                            </div>
                                        </div>

                                        {newMediaUrl && (
                                            <div className="mt-2 rounded overflow-hidden border border-slate-600 bg-black flex justify-center">
                                                {newMediaType === 'video' ? (
                                                    <video src={newMediaUrl} className={`object-contain ${mediaTab === 'horizontal' ? 'h-32 w-full' : 'h-48 w-auto'}`} controls />
                                                ) : (
                                                    <img src={newMediaUrl} className={`object-contain ${mediaTab === 'horizontal' ? 'h-32 w-full' : 'h-48 w-auto'}`} />
                                                )}
                                            </div>
                                        )}

                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={addMedia}
                                                disabled={!newMediaTitle || !newMediaUrl}
                                                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Salvar Mídia
                                            </button>
                                            <button
                                                onClick={() => setIsUploadModalOpen(false)}
                                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                <Plus className="w-5 h-5" /> Nova Lista ({playlistTab === 'horizontal' ? 'H' : 'V'})
                            </button>
                        </div>

                        {/* Playlist Tabs */}
                        <div className="flex gap-4 mb-8 border-b border-slate-700">
                            <button
                                onClick={() => setPlaylistTab('horizontal')}
                                className={`pb-4 px-4 font-medium transition ${playlistTab === 'horizontal' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-slate-400 hover:text-white'}`}
                            >
                                TV Horizontal (16:9)
                            </button>
                            <button
                                onClick={() => setPlaylistTab('vertical')}
                                className={`pb-4 px-4 font-medium transition ${playlistTab === 'vertical' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-slate-400 hover:text-white'}`}
                            >
                                TV Vertical (9:16)
                            </button>
                        </div>

                        {playlists.filter(p => (p.orientation || 'horizontal') === playlistTab).length === 0 ? (
                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
                                <Play className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400 mb-4">Nenhuma playlist {playlistTab === 'horizontal' ? 'horizontal' : 'vertical'} cadastrada</p>
                                <button
                                    onClick={() => {
                                        setNewPlaylistOrientation(playlistTab);
                                        setCurrentPage('add-playlist');
                                    }}
                                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-6 rounded transition"
                                >
                                    + Criar primeira playlist
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {playlists.filter(p => (p.orientation || 'horizontal') === playlistTab).map(playlist => (
                                    <div key={playlist.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-white font-semibold">{playlist.name}</h3>
                                            <span className="text-[10px] uppercase font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                                                {playlist.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm mb-4">{playlist.midiasCount} mídias</p>
                                        <p className="text-slate-500 text-xs mb-4">Criado em: {playlist.createdAt}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openPlaylistEditor(playlist)}
                                                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition text-center"
                                            >
                                                Gerenciar
                                            </button>
                                            <button
                                                onClick={() => deletePlaylist(playlist.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
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
                            <label className="block text-slate-400 text-sm mb-2">Nome da Playlist</label>
                            <input
                                type="text"
                                placeholder="Ex: Promoções Manhã"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-6"
                            />

                            <label className="block text-slate-400 text-sm mb-2">Orientação da Tela</label>
                            <div className="flex gap-4 mb-8">
                                <button
                                    onClick={() => setNewPlaylistOrientation('horizontal')}
                                    className={`flex-1 py-3 px-4 rounded border transition ${newPlaylistOrientation === 'horizontal' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
                                >
                                    Horizontal (16:9)
                                </button>
                                <button
                                    onClick={() => setNewPlaylistOrientation('vertical')}
                                    className={`flex-1 py-3 px-4 rounded border transition ${newPlaylistOrientation === 'vertical' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
                                >
                                    Vertical (9:16)
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { addPlaylist(); setCurrentPage('playlists'); }}
                                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition"
                                >
                                    Criar Playlist
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

                {/* Edit Playlist */}
                {currentPage === 'edit-playlist' && editingPlaylist && (
                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={() => setCurrentPage('playlists')}
                                className="bg-slate-800 p-2 rounded hover:bg-slate-700 text-white transition"
                            >
                                <Play className="w-5 h-5 rotate-180" />
                            </button>
                            <div>
                                <h2 className="text-3xl font-bold text-white">{editingPlaylist.name}</h2>
                                <span className="text-xs uppercase font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                                    {editingPlaylist.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsMediaSelectorOpen(true)}
                                className="ml-auto bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 px-4 rounded transition flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Adicionar Mídia
                            </button>
                        </div>

                        {/* Playlist Medias */}
                        <div className="space-y-4">
                            {(editingPlaylist.items || []).length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-lg">
                                    <p className="text-slate-500 mb-4">Esta playlist está vazia.</p>
                                    <button
                                        onClick={() => setIsMediaSelectorOpen(true)}
                                        className="text-cyan-400 hover:text-cyan-300 font-semibold"
                                    >
                                        Adicionar mídias agora
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {(editingPlaylist.items || []).map((item, index) => {
                                        const media = medias.find(m => m.id === item.mediaId);
                                        if (!media) return null;
                                        return (
                                            <div key={`${item.mediaId}-${index}`} className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex gap-4 items-center group relative">
                                                <div className={`relative bg-black rounded overflow-hidden flex-shrink-0 ${editingPlaylist.orientation === 'horizontal' ? 'w-24 h-16' : 'w-16 h-24'}`}>
                                                    {media.type === 'video' ? (
                                                        <video src={media.url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={media.url} alt={media.title} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-medium text-sm truncate mb-1">{media.title}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-500">{media.type === 'video' ? 'Vídeo' : 'Imagem'}</span>
                                                        <span className="text-slate-600">•</span>
                                                        {media.type === 'video' ? (
                                                            <span className="text-xs text-cyan-400 font-semibold bg-cyan-400/10 px-1.5 py-0.5 rounded">Auto</span>
                                                        ) : (
                                                            <div className="flex items-center gap-1 bg-slate-900 rounded px-1.5 py-0.5 border border-slate-700">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.duration}
                                                                    onChange={(e) => updateItemDuration(index, parseInt(e.target.value) || 10)}
                                                                    className="w-8 bg-transparent text-white text-xs text-center focus:outline-none"
                                                                />
                                                                <span className="text-[10px] text-slate-500">seg</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeMediaFromPlaylist(index)}
                                                    className="p-2 text-slate-500 hover:text-red-500 transition opacity-0 group-hover:opacity-100 absolute top-2 right-2 md:static md:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Media Selector Modal */}
                        {isMediaSelectorOpen && (
                            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                                <div className="bg-slate-800 rounded-xl p-6 w-full max-w-4xl border border-slate-700 max-h-[90vh] flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white">Selecionar Mídia ({editingPlaylist.orientation === 'vertical' ? 'Vertical' : 'Horizontal'})</h3>
                                        <button onClick={() => setIsMediaSelectorOpen(false)}>
                                            <X className="w-6 h-6 text-slate-400 hover:text-white" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto min-h-0 mb-6">
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {medias.filter(m => m.orientation === editingPlaylist.orientation && m.userId === currentUser.id).map(media => (
                                                <div
                                                    key={media.id}
                                                    onClick={() => addMediaToPlaylist(media.id)}
                                                    className="bg-slate-900 border border-slate-700 rounded-lg cursor-pointer hover:border-cyan-500 transition group relative"
                                                >
                                                    <div className={`bg-black flex items-center justify-center overflow-hidden ${editingPlaylist.orientation === 'horizontal' ? 'aspect-video' : 'aspect-[9/16]'}`}>
                                                        {media.type === 'video' ? (
                                                            <video src={media.url} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <img src={media.url} alt={media.title} className="w-full h-full object-cover" />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                                            <Plus className="w-8 h-8 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="p-2">
                                                        <p className="text-white text-xs truncate">{media.title}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {medias.filter(m => m.orientation === editingPlaylist.orientation && m.userId === currentUser.id).length === 0 && (
                                                <div className="col-span-full py-8 text-center text-slate-500">
                                                    <p>Nenhuma mídia {editingPlaylist.orientation} disponível.</p>
                                                    <button onClick={() => { setIsMediaSelectorOpen(false); setCurrentPage('medias'); }} className="text-cyan-400 text-sm mt-2 hover:underline">Ir para biblioteca de mídias</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TVs */}
                {currentPage === 'tvs' && (
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <h2 className="text-3xl font-bold text-white">TVs</h2>
                            <button
                                onClick={() => { setNewTvCode(generateTvCode()); setCurrentPage('add-tv'); }}
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
                                    onClick={() => { setNewTvCode(generateTvCode()); setCurrentPage('add-tv'); }}
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
                                                <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-[11px] font-bold uppercase tracking-wider">Código</th>
                                                <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-[11px] font-bold uppercase tracking-wider">Nome</th>
                                                <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-[11px] font-bold uppercase tracking-wider">Playlist</th>
                                                <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-[11px] font-bold uppercase tracking-wider">Transição</th>
                                                <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-[11px] font-bold uppercase tracking-wider">Status / Extras</th>
                                                <th className="px-4 md:px-6 py-4 text-left text-slate-400 text-[11px] font-bold uppercase tracking-wider">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {tvs.map(tv => (
                                                <tr key={tv.id} className="hover:bg-slate-700/30 transition border-b border-slate-700/50">
                                                    <td className="px-4 md:px-6 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-cyan-400 font-mono font-bold bg-cyan-400/10 px-2 py-1 rounded text-sm">{tv.code}</span>
                                                            <button onClick={() => navigator.clipboard.writeText(tv.code)} className="p-1 text-slate-500 hover:text-white transition">
                                                                <Play className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-6">
                                                        <div className="text-white font-medium mb-1">{tv.name}</div>
                                                        <span className="text-[10px] uppercase font-black text-slate-600 tracking-tighter">
                                                            {tv.orientation === 'vertical' ? 'VERTICAL' : 'HORIZONTAL'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-6">
                                                        <select
                                                            value={tv.playlistId || ''}
                                                            onChange={(e) => updateTvPlaylist(tv.id, e.target.value)}
                                                            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2 w-full max-w-[160px] outline-none focus:border-cyan-500"
                                                        >
                                                            <option value="">Sem playlist</option>
                                                            {playlists.filter(p => !p.orientation || !tv.orientation || p.orientation === tv.orientation).map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-6">
                                                        <select
                                                            value={tv.transition || 'smooth'}
                                                            onChange={(e) => updateTvTransition(tv.id, e.target.value)}
                                                            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2 w-full max-w-[140px] outline-none focus:border-cyan-500"
                                                        >
                                                            <option value="none">Corte Seco</option>
                                                            <option value="smooth">Suave (Fade)</option>
                                                            <option value="slide">Slide</option>
                                                            <option value="zoom">Zoom</option>
                                                            <option value="blur">Blur</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-6 min-w-[280px]">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${tv.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-700 text-slate-400'}`}>
                                                                    {tv.status === 'active' ? 'Ativa' : 'Inativa'}
                                                                </span>
                                                            </div>

                                                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 space-y-2">
                                                                <div>
                                                                    <label className="text-[9px] font-black text-slate-500 uppercase mb-1 block tracking-widest">Letreiro (Texto)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={tv.ticker || ''}
                                                                        onChange={(e) => updateTvTicker(tv.id, e.target.value)}
                                                                        placeholder="Digite o anúncio aqui..."
                                                                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-[11px] text-white outline-none focus:border-cyan-500"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[9px] font-black text-slate-500 uppercase mb-1 block tracking-widest">Banner (Imagem)</label>
                                                                    <div className="relative h-8 border border-slate-700 border-dashed rounded flex items-center justify-center bg-slate-900 overflow-hidden cursor-pointer hover:bg-slate-800 transition">
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(e) => handleBannerUpload(tv.id, e)}
                                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                                        />
                                                                        {tv.bannerUrl ? (
                                                                            <img src={tv.bannerUrl} className="w-full h-full object-cover opacity-50" />
                                                                        ) : (
                                                                            <span className="text-[10px] text-cyan-500">Clique para Subir Banner</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="pt-2">
                                                                    <label className="text-[9px] font-black text-slate-500 uppercase mb-1 block tracking-widest">Instalação TV Stick / Android</label>
                                                                    <div className="flex flex-col gap-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                const link = `${window.location.origin}/player?code=${tv.code}`;
                                                                                navigator.clipboard.writeText(link);
                                                                                alert('Link de instalação copiado!');
                                                                            }}
                                                                            className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold py-1.5 rounded border border-slate-700 flex items-center justify-center gap-2 transition"
                                                                        >
                                                                            <Monitor className="w-3 h-3" /> Link de Player
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                // Point to the correct new repository under the new account
                                                                                alert('Iniciando download do Instalador APK Universal...\n(Certifique-se de configurar o código ' + tv.code + ' após instalar)');
                                                                                window.open('https://github.com/jjmidiaindoor-bit/jj-midia-tv-app/releases/latest/download/jj-midia-universal.apk', '_blank');
                                                                            }}
                                                                            className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold py-1.5 rounded border border-cyan-500/30 flex items-center justify-center gap-2 transition"
                                                                        >
                                                                            <Download className="w-3 h-3" /> Baixar APK Universal
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-6">
                                                        <div className="text-slate-500 text-[10px] mb-3">{tv.createdAt}</div>
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={() => toggleTvStatus(tv.id)}
                                                                className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all tracking-tighter ${tv.status === 'active' ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-900' : 'bg-green-500 hover:bg-green-600 text-slate-900'}`}
                                                            >
                                                                {tv.status === 'active' ? 'Desativar' : 'Ativar'}
                                                            </button>
                                                            <button
                                                                onClick={() => deleteTV(tv.id)}
                                                                className="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase bg-red-500 hover:bg-red-600 text-white transition-all tracking-tighter"
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
                            <label className="block text-slate-400 text-sm mb-1">Código da TV (Automático)</label>
                            <input
                                type="text"
                                value={newTvCode}
                                readOnly
                                className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white font-mono text-center text-xl mb-4 opacity-70 cursor-not-allowed"
                            />
                            <input
                                type="text"
                                placeholder="Nome/Localização"
                                value={newTvName}
                                onChange={(e) => setNewTvName(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 mb-6"
                            />

                            <label className="block text-slate-400 text-sm mb-2">Orientação da Tela</label>
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={() => { setNewTvOrientation('horizontal'); setNewTvPlaylist(''); }}
                                    className={`flex-1 py-3 px-4 rounded border transition ${newTvOrientation === 'horizontal' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
                                >
                                    Horizontal (16:9)
                                </button>
                                <button
                                    onClick={() => { setNewTvOrientation('vertical'); setNewTvPlaylist(''); }}
                                    className={`flex-1 py-3 px-4 rounded border transition ${newTvOrientation === 'vertical' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
                                >
                                    Vertical (9:16)
                                </button>
                            </div>



                            <label className="block text-slate-400 text-sm mb-2">Playlist Padrão ({newTvOrientation === 'vertical' ? 'Vertical' : 'Horizontal'})</label>
                            <select
                                value={newTvPlaylist}
                                onChange={(e) => setNewTvPlaylist(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white mb-8"
                            >
                                <option value="">Selecionar Playlist</option>
                                {playlists.filter(p => p.orientation === newTvOrientation).map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>

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

                {/* Abrir Tela */}
                {currentPage === 'open-tv' && (
                    <div className="p-6 md:p-8">
                        <h2 className="text-3xl font-bold text-white mb-8">Abrir Tela</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            {/* Landscape Mode Card */}
                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                                <h3 className="text-white font-bold text-lg mb-8">Modo Paisagem</h3>

                                <div className="aspect-video bg-slate-900/80 rounded-xl mb-8 flex flex-col items-center justify-center border border-slate-700/50 border-dashed relative group">
                                    <Monitor className="w-16 h-16 text-cyan-500 mb-4 transition-transform group-hover:scale-110 duration-300" />
                                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Tela Horizontal (16:9)</p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Código da TV</label>
                                        <input
                                            type="text"
                                            placeholder="EX: ABC123"
                                            value={tvCodeInputHorizontal}
                                            onChange={(e) => setTvCodeInputHorizontal(e.target.value.toUpperCase())}
                                            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder-slate-600 text-center font-mono text-xl tracking-[0.3em] outline-none focus:border-cyan-500/50 transition-all shadow-inner"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => startPlayer('horizontal')}
                                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg text-sm border border-slate-600"
                                        >
                                            Abrir aqui
                                        </button>
                                        <button
                                            onClick={() => window.open(`/player?code=${tvCodeInputHorizontal}`, '_blank')}
                                            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/10 text-sm"
                                        >
                                            Nova janela
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Portrait Mode Card */}
                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                                <h3 className="text-white font-bold text-lg mb-8">Modo Retrato</h3>

                                <div className="aspect-video bg-slate-900/80 rounded-xl mb-8 flex flex-col items-center justify-center border border-slate-700/50 border-dashed relative group">
                                    <div style={{ transform: `rotate(${verticalRotation}deg)`, transition: 'transform 0.3s ease-in-out' }}>
                                        <Monitor className="w-14 h-14 text-cyan-500 mb-0 transition-transform group-hover:scale-110 duration-300" />
                                    </div>
                                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mt-4">Tela Vertical (9:16)</p>
                                </div>

                                {/* Rotation Selector */}
                                <div className="mb-6">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Orientação da Rotação</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setVerticalRotation(90)}
                                            className={`py-3 px-4 rounded-xl border transition ${verticalRotation === 90
                                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                                                    : 'bg-slate-700 border-slate-600 text-slate-400'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div style={{ transform: 'rotate(90deg)' }}>
                                                    <Monitor className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-semibold">Lado Esquerdo</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setVerticalRotation(270)}
                                            className={`py-3 px-4 rounded-xl border transition ${verticalRotation === 270
                                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                                                    : 'bg-slate-700 border-slate-600 text-slate-400'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div style={{ transform: 'rotate(270deg)' }}>
                                                    <Monitor className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-semibold">Lado Direito</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Código da TV</label>
                                        <input
                                            type="text"
                                            placeholder="EX: DEF456"
                                            value={tvCodeInputVertical}
                                            onChange={(e) => setTvCodeInputVertical(e.target.value.toUpperCase())}
                                            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder-slate-600 text-center font-mono text-xl tracking-[0.3em] outline-none focus:border-cyan-500/50 transition-all shadow-inner"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => startPlayer('vertical')}
                                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg text-sm border border-slate-600"
                                        >
                                            Abrir aqui
                                        </button>
                                        <button
                                            onClick={() => window.open(`/player?code=${tvCodeInputVertical}`, '_blank')}
                                            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/10 text-sm"
                                        >
                                            Nova janela
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Fullscreen Player Overlay */}
            {isPlaying && playingItems.length > 0 && (
                <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
                    <div className="absolute top-4 right-4 z-[110] flex gap-2">
                        <button
                            onClick={() => setRotation(r => (r + 90) % 360)}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white backdrop-blur-sm transition"
                            title="Girar Tela"
                        >
                            <Monitor className="w-6 h-6" /> {/* Reusing Monitor icon as rotate placeholder */}
                        </button>
                        <button
                            onClick={() => { setIsPlaying(false); setRotation(0); }}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white backdrop-blur-sm transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {(() => {
                        const item = playingItems[currentMediaIndex];
                        const media = medias.find(m => m.id === item.mediaId);

                        if (!media) return null;

                        return (
                            <div
                                className="w-full h-full flex items-center justify-center transition-opacity duration-1000 ease-in-out"
                                style={{
                                    opacity: opacity,
                                    transform: `rotate(${rotation}deg)`,
                                    transition: 'opacity 1s ease-in-out, transform 0.5s ease-in-out',
                                    width: rotation % 180 === 0 ? '100%' : '100vh',
                                    height: rotation % 180 === 0 ? '100%' : '100vw',
                                }}
                            >
                                {media.type === 'video' ? (
                                    <video
                                        src={media.url}
                                        className="w-full h-full object-contain"
                                        autoPlay
                                        muted
                                        playsInline
                                        onEnded={() => {
                                            // Immediate transition for video end could trigger here
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={media.url}
                                        alt={media.title}
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}

