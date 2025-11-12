import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import { getWebContainer } from '../config/webcontainer'

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)

  React.useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
}

const Project = () => {
  const location = useLocation()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(new Set())
  const [project, setProject] = useState(location.state.project)
  const [message, setMessage] = useState('')
  const { user } = useContext(UserContext)
  const messageBox = React.createRef()

  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [fileTree, setFileTree] = useState({})
  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [runProcess, setRunProcess] = useState(null)

  const handleUserClick = (id) => {
    setSelectedUserId(prev => {
      const updated = new Set(prev)
      if (updated.has(id)) updated.delete(id)
      else updated.add(id)
      return updated
    })
  }

  function addCollaborators() {
    axios
      .put('/projects/add-user', {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data)
        setIsModalOpen(false)
      })
      .catch((err) => console.log(err))
  }

  const send = () => {
    sendMessage('project-message', { message, sender: user })
    setMessages((prev) => [...prev, { sender: user, message }])
    setMessage('')
  }

  function WriteAiMessage(message) {
    const messageObject = JSON.parse(message)
    return (
      <div className="overflow-auto bg-slate-900 text-white rounded-lg p-3">
        <Markdown
          children={messageObject.text}
          options={{
            overrides: { code: SyntaxHighlightedCode },
          }}
        />
      </div>
    )
  }

  useEffect(() => {
    initializeSocket(project._id)

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container)
        console.log('container started')
      })
    }

    receiveMessage('project-message', (data) => {
      if (data.sender._id === 'ai') {
        const message = JSON.parse(data.message)
        webContainer?.mount(message.fileTree)
        if (message.fileTree) setFileTree(message.fileTree || {})
        setMessages((prev) => [...prev, data])
      } else setMessages((prev) => [...prev, data])
    })

    axios.get(`/projects/get-project/${location.state.project._id}`).then((res) => {
      setProject(res.data.project)
      setFileTree(res.data.project.fileTree || {})
    })

    axios.get('/users/all').then((res) => setUsers(res.data.users)).catch(console.log)
  }, [])

  function saveFileTree(ft) {
    axios
      .put('/projects/update-file-tree', {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err))
  }

  return (
    <main className="h-screen w-screen flex bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      {/* Left Panel (Chat + Collaborators) */}
      <section className="left relative flex flex-col min-w-96 bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700">
        {/* Header */}
        <header className="flex justify-between items-center p-3 bg-gray-200 dark:bg-gray-700 shadow-sm sticky top-0 z-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm font-medium hover:text-blue-600"
          >
            <i className="ri-add-fill"></i> Add collaborator
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
          >
            <i className="ri-group-fill text-lg"></i>
          </button>
        </header>

        {/* Messages */}
        <div className="conversation-area flex flex-col flex-grow overflow-hidden">
          <div
            ref={messageBox}
            className="flex-grow p-3 overflow-y-auto flex flex-col gap-2 scrollbar-hide"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${
                  msg.sender._id === user._id.toString()
                    ? 'ml-auto bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                } rounded-lg p-2 max-w-[75%]`}
              >
                <small className="block text-xs opacity-70">{msg.sender.email}</small>
                <div className="mt-1 text-sm">
                  {msg.sender._id === 'ai' ? WriteAiMessage(msg.message) : msg.message}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center border-t border-gray-300 dark:border-gray-700">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow p-2 px-4 bg-transparent outline-none"
              placeholder="Enter message..."
            />
            <button
              onClick={send}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        {/* Collaborator Side Panel */}
        <div
          className={`absolute inset-0 bg-gray-100 dark:bg-gray-800 transform transition-transform duration-300 ${
            isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <header className="flex justify-between items-center p-3 bg-gray-200 dark:bg-gray-700">
            <h1 className="font-semibold text-lg">Collaborators</h1>
            <button onClick={() => setIsSidePanelOpen(false)}>
              <i className="ri-close-fill text-lg"></i>
            </button>
          </header>
          <div className="flex flex-col gap-2 p-3 overflow-y-auto">
            {project.users?.map((user, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <i className="ri-user-fill"></i>
                </div>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right Side (Code Editor + Preview) */}
      <section className="flex flex-grow h-full">
        {/* File Explorer */}
        <div className="explorer bg-gray-200 dark:bg-gray-800 w-64 border-r border-gray-300 dark:border-gray-700">
          <div className="p-2 font-semibold text-sm text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700">
            Files
          </div>
          <div>
            {Object.keys(fileTree).map((file, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentFile(file)
                  setOpenFiles((prev) => [...new Set([...prev, file])])
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 ${
                  currentFile === file
                    ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                    : ''
                }`}
              >
                {file}
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 p-2">
            <div className="flex gap-2">
              {openFiles.map((file, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentFile(file)}
                  className={`px-4 py-1 rounded-t-md ${
                    currentFile === file
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-200'
                  }`}
                >
                  {file}
                </button>
              ))}
            </div>
            <button
              onClick={async () => {
                await webContainer.mount(fileTree)
                const installProcess = await webContainer.spawn('npm', ['install'])
                installProcess.output.pipeTo(
                  new WritableStream({ write(chunk) { console.log(chunk) } })
                )
                if (runProcess) runProcess.kill()
                const tempRunProcess = await webContainer.spawn('npm', ['start'])
                tempRunProcess.output.pipeTo(
                  new WritableStream({ write(chunk) { console.log(chunk) } })
                )
                setRunProcess(tempRunProcess)
                webContainer.on('server-ready', (port, url) => setIframeUrl(url))
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Run
            </button>
          </div>

          {/* Code Area */}
          <div className="flex-grow overflow-auto bg-gray-50 dark:bg-gray-900 p-3">
            {fileTree[currentFile] && (
              <pre className="hljs">
                <code
                  className="hljs outline-none"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updated = e.target.innerText
                    const ft = {
                      ...fileTree,
                      [currentFile]: { file: { contents: updated } },
                    }
                    setFileTree(ft)
                    saveFileTree(ft)
                  }}
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(
                      'javascript',
                      fileTree[currentFile].file.contents
                    ).value,
                  }}
                  style={{
                    whiteSpace: 'pre-wrap',
                    paddingBottom: '20rem',
                  }}
                />
              </pre>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {iframeUrl && webContainer && (
          <div className="w-96 flex flex-col border-l border-gray-300 dark:border-gray-700">
            <input
              type="text"
              value={iframeUrl}
              onChange={(e) => setIframeUrl(e.target.value)}
              className="p-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 text-sm outline-none"
            />
            <iframe src={iframeUrl} className="flex-grow w-full"></iframe>
          </div>
        )}
      </section>

      {/* Collaborator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Select Users</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2">
                <i className="ri-close-fill text-lg"></i>
              </button>
            </header>
            <div className="flex flex-col gap-2 mb-20 max-h-96 overflow-auto">
              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleUserClick(u._id)}
                  className={`flex items-center gap-3 p-2 cursor-pointer rounded-md ${
                    selectedUserId.has(u._id)
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <i className="ri-user-fill"></i>
                  </div>
                  <p className="text-sm">{u.email}</p>
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default Project
