import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import 'highlight.js/styles/tokyo-night-dark.css' // Switched to a cooler dark theme
import { getWebContainer } from '../config/webcontainer'

function SyntaxHighlightedCode(props) {
    const ref = useRef(null)
    useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)
            ref.current.removeAttribute('data-highlighted')
        }
    }, [props.className, props.children])
    return <code {...props} ref={ref} className={`${props.className} rounded-md`} />
}

const Project = () => {
    const location = useLocation()
    const { user } = useContext(UserContext)
    const messageBoxRef = useRef(null)

    const [activeTab, setActiveTab] = useState('chat')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [project, setProject] = useState(location.state?.project || {})
    const [message, setMessage] = useState('')
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [fileTree, setFileTree] = useState(location.state?.project?.fileTree || {})
    const [currentFile, setCurrentFile] = useState(null)
    const [openFiles, setOpenFiles] = useState([])
    const [webContainer, setWebContainer] = useState(null)
    const [iframeUrl, setIframeUrl] = useState(null)
    const [selectedUserId, setSelectedUserId] = useState(new Set())

    const handleUserClick = (id) => {
        setSelectedUserId(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    }

    const send = () => {
        if (!message.trim()) return;
        const msgPayload = { message, sender: user };
        sendMessage('project-message', msgPayload);
        setMessages(prev => [...prev, msgPayload]);
        setMessage("");
        setTimeout(scrollToBottom, 100);
    }

    const scrollToBottom = () => {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
        }
    }

    useEffect(() => {
        if (project._id) {
            initializeSocket(project._id);
            axios.get(`/projects/get-project/${project._id}`).then(res => {
                setProject(res.data.project);
                setFileTree(res.data.project.fileTree || {});
            });
        }
        getWebContainer().then(container => setWebContainer(container));
        receiveMessage('project-message', data => {
            if (data.sender._id === 'ai') {
                try {
                    const aiMsg = JSON.parse(data.message);
                    if (aiMsg.fileTree) setFileTree(aiMsg.fileTree);
                } catch (e) { console.error("AI JSON Parse error") }
            }
            setMessages(prev => [...prev, data]);
            setTimeout(scrollToBottom, 100);
        });
        axios.get('/users/all').then(res => setUsers(res.data.users || []));
    }, []);

    function WriteAiMessage(content) {
        try {
            const parsed = JSON.parse(content);
            return (
                <div className='bg-black/40 border border-white/10 text-zinc-300 rounded-xl p-4 mt-2 shadow-2xl backdrop-blur-md'>
                    <Markdown options={{ overrides: { code: SyntaxHighlightedCode } }}>{parsed.text}</Markdown>
                </div>
            );
        } catch { return <p className='leading-relaxed'>{content}</p>; }
    }

    return (
        <main className='h-screen w-screen flex flex-col md:flex-row bg-[#09090b] text-zinc-100 overflow-hidden font-sans selection:bg-indigo-500/30'>
            
            {/* MOBILE NAVIGATION - REFERENCE STYLE */}
            <div className='md:hidden flex justify-around bg-[#111114] border-b border-white/5 p-3 z-50 backdrop-blur-xl'>
                <button onClick={() => setActiveTab('chat')} className={`p-2 rounded-lg transition-all ${activeTab === 'chat' ? 'bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/50' : 'text-zinc-500'}`}><i className="ri-chat-3-line text-xl"></i></button>
                <button onClick={() => setActiveTab('explorer')} className={`p-2 rounded-lg transition-all ${activeTab === 'explorer' ? 'bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/50' : 'text-zinc-500'}`}><i className="ri-folder-line text-xl"></i></button>
                <button onClick={() => setActiveTab('preview')} className={`p-2 rounded-lg transition-all ${activeTab === 'preview' ? 'bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/50' : 'text-zinc-500'}`}><i className="ri-tv-line text-xl"></i></button>
            </div>

            {/* CHAT SECTION - DASHBOARD STYLE */}
            <section className={`${activeTab === 'chat' ? 'flex' : 'hidden'} md:flex flex-col h-full md:w-[400px] bg-[#0c0c0e] border-r border-white/5 shadow-2xl`}>
                <header className='p-6 flex justify-between items-center bg-[#111114]/50 backdrop-blur-md border-b border-white/5'>
                    <div>
                        <p className='text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold'>Project Workspace</p>
                        <h2 className='font-black text-xl bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent'>AI Chat</h2>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className='bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/20 transition-all'>
                        + Add Team
                    </button>
                </header>

                <div ref={messageBoxRef} className="flex-grow overflow-y-auto p-4 space-y-6 bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:20px_20px]">
                    {messages.map((msg, i) => {
                        const isMe = msg.sender._id === user._id;
                        const isAi = msg.sender._id === 'ai';
                        return (
                            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className='flex items-center gap-2 mb-1 px-1'>
                                    {!isMe && <div className={`w-2 h-2 rounded-full ${isAi ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-indigo-500'}`}></div>}
                                    <span className='text-[10px] font-bold text-zinc-500 uppercase tracking-wider'>{isAi ? 'Co-Pilot AI' : msg.sender.email.split('@')[0]}</span>
                                </div>
                                <div className={`group relative p-4 rounded-2xl text-sm transition-all shadow-xl ${
                                    isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 
                                    isAi ? 'w-full p-0' : 
                                    'bg-[#18181b] border border-white/5 text-zinc-300 rounded-tl-none hover:border-white/10'
                                }`}>
                                    {isAi ? WriteAiMessage(msg.message) : msg.message}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className='p-6 border-t border-white/5 bg-[#111114]/80 backdrop-blur-xl'>
                    <div className='flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5 focus-within:border-indigo-500/50 transition-all'>
                        <input 
                            value={message} 
                            onChange={e => setMessage(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && send()}
                            className='flex-grow bg-transparent px-4 py-2 text-sm outline-none placeholder:text-zinc-600' 
                            placeholder='Ask Co-Pilot anything...' 
                        />
                        <button onClick={send} className='bg-indigo-600 hover:bg-indigo-500 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)]'>
                            <i className="ri-send-plane-2-fill"></i>
                        </button>
                    </div>
                </div>
            </section>

            {/* EDITOR & PREVIEW SECTION */}
            <section className={`${activeTab !== 'chat' ? 'flex' : 'hidden'} md:flex flex-grow bg-[#09090b] overflow-hidden`}>
                
                {/* EXPLORER - CARD STYLE */}
                <div className={`${activeTab === 'explorer' ? 'w-full' : 'hidden lg:block w-72'} border-r border-white/5 bg-[#0c0c0e]`}>
                    <div className='p-6 border-b border-white/5 flex justify-between items-center'>
                        <span className='text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500'>Filesystem</span>
                    </div>
                    <div className="p-3 space-y-1">
                        {Object.keys(fileTree || {}).map(file => (
                            <div 
                                key={file} 
                                onClick={() => { setCurrentFile(file); setOpenFiles([...new Set([...openFiles, file])]); setActiveTab('editor') }} 
                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border border-transparent ${currentFile === file ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' : 'hover:bg-white/5 text-zinc-400'}`}
                            >
                                <i className={`ri-file-code-fill ${currentFile === file ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-300'}`}></i>
                                <span className='text-sm font-medium'>{file}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* EDITOR AREA */}
                <div className='flex-grow flex flex-col min-w-0 bg-[#09090b]'>
                    <div className='flex bg-[#0c0c0e] border-b border-white/5 overflow-x-auto no-scrollbar'>
                        {openFiles.map(f => (
                            <div 
                                key={f} 
                                onClick={() => setCurrentFile(f)} 
                                className={`group flex items-center gap-2 px-6 py-4 text-[11px] font-bold uppercase tracking-widest cursor-pointer border-r border-white/5 transition-all ${currentFile === f ? 'bg-[#09090b] text-white border-b-2 border-b-indigo-500' : 'text-zinc-500 hover:bg-white/5'}`}
                            >
                                <span>{f}</span>
                                <i className="ri-close-line opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all" onClick={(e) => {
                                    e.stopPropagation();
                                    const nextFiles = openFiles.filter(file => file !== f);
                                    setOpenFiles(nextFiles);
                                    if (currentFile === f) setCurrentFile(nextFiles[0] || null);
                                }}></i>
                            </div>
                        ))}
                    </div>
                    {currentFile ? (
                        <div className='flex-grow relative overflow-hidden group'>
                            <pre className='h-full p-8 overflow-auto font-mono text-[13px] leading-relaxed custom-scrollbar bg-[#09090b]'>
                                <code 
                                    contentEditable 
                                    suppressContentEditableWarning
                                    onBlur={e => {
                                        const ft = { ...fileTree, [currentFile]: { file: { contents: e.target.innerText } } };
                                        setFileTree(ft);
                                        axios.put('/projects/update-file-tree', { projectId: project._id, fileTree: ft });
                                    }}
                                    dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[currentFile]?.file?.contents || '').value }}
                                    className="outline-none block min-h-full"
                                />
                            </pre>
                        </div>
                    ) : (
                        <div className='flex-grow flex flex-col items-center justify-center text-zinc-700 bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:30px_30px]'>
                            <div className='w-20 h-20 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-4 shadow-2xl'>
                                <i className="ri-code-s-slash-line text-4xl opacity-20"></i>
                            </div>
                            <p className='text-xs font-bold uppercase tracking-widest opacity-40'>Open a file to start building</p>
                        </div>
                    )}
                </div>

                {/* PREVIEW PANEL */}
                {iframeUrl && (activeTab === 'preview' || window.innerWidth > 1200) && (
                    <div className='flex flex-col w-[450px] bg-[#0c0c0e] border-l border-white/5 animate-in slide-in-from-right duration-500'>
                        <div className='p-4 border-b border-white/5 bg-[#111114] flex items-center gap-3'>
                            <div className='flex gap-1.5'>
                                <div className='w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500/50'></div>
                                <div className='w-2.5 h-2.5 rounded-full bg-amber-500/40 border border-amber-500/50'></div>
                                <div className='w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-500/50'></div>
                            </div>
                            <div className='flex-grow bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-[10px] text-zinc-500 font-mono truncate'>
                                {iframeUrl}
                            </div>
                        </div>
                        <iframe src={iframeUrl} title="preview" className='flex-grow w-full bg-white' />
                    </div>
                )}
            </section>
            
            {/* COLLABORATOR MODAL - GLASSMORPHISM */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-[#111114] border border-white/10 rounded-[2rem] w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className='p-8 border-b border-white/5 flex justify-between items-center'>
                            <h2 className='text-2xl font-black'>Team Access</h2>
                            <button onClick={() => setIsModalOpen(false)} className='text-zinc-500 hover:text-white transition-all'><i className="ri-close-line text-2xl"></i></button>
                        </header>
                        <div className='p-6 space-y-3 max-h-96 overflow-auto'>
                            {users.map(u => (
                                <div 
                                    key={u._id} 
                                    onClick={() => handleUserClick(u._id)} 
                                    className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${selectedUserId.has(u._id) ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-black/20 border-transparent hover:border-white/10'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg ${selectedUserId.has(u._id) ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                        {u.email[0].toUpperCase()}
                                    </div>
                                    <span className={`font-semibold ${selectedUserId.has(u._id) ? 'text-indigo-400' : 'text-zinc-400'}`}>{u.email}</span>
                                    {selectedUserId.has(u._id) && <i className="ri-checkbox-circle-fill text-indigo-500 ml-auto text-xl"></i>}
                                </div>
                            ))}
                        </div>
                        <div className='p-8 bg-black/40 border-t border-white/5'>
                            <button onClick={() => setIsModalOpen(false)} className='w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black tracking-widest uppercase text-xs shadow-lg shadow-indigo-500/20 transition-all active:scale-95'>
                                Confirm Access
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Project;
