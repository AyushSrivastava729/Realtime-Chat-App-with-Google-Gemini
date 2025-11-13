import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import { getWebContainer } from '../config/webContainer'

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
  const { user } = useContext(UserContext)
  const [project, setProject] = useState(location.state.project)
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const messageBox = useRef()
  const [fileTree, setFileTree] = useState({})
  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [runProcess, setRunProcess] = useState(null)

  // Dynamic panel widths
  const [leftWidth, setLeftWidth] = useState(300)
  const [centerWidth, setCenterWidth] = useState(500)
  const [rightWidth, setRightWidth] = useState(400)
  const resizerRef = useRef(null)
  const resizingRef = useRef(false)
  const resizePanel = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingRef.current || !resizePanel.current) return
      const dx = e.movementX
      if (resizePanel.current === 'left-center') {
        setLeftWidth((prev) => Math.max(200, prev + dx))
        setCenterWidth((prev) => Math.max(200, prev - dx))
      } else if (resizePanel.current === 'center-right') {
        setCenterWidth((prev) => Math.max(200, prev + dx))
        setRightWidth((prev) => Math.max(200, prev - dx))
      }
    }

    const handleMouseUp = () => {
      resizingRef.current = false
      resizePanel.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const handleResizerMouseDown = (panel) => {
    resizingRef.current = true
    resizePanel.current = panel
  }

  const handleUserClick = (id) => {
    setSelectedUserId((prev) => {
      const updated = new Set(prev)
      if (updated.has(id)) updated.delete(id)
      else updated.add(id)
      return updated
    })
  }

  const addCollaborators = () => {
    axios
      .put('/projects/add-user', {
        projectId: project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data)
        setIsModalOpen(false)
      })
      .catch(console.log)
  }

  const send = () => {
    sendMessage('project-message', { message, sender: user })
    setMessages((prev) => [...prev, { sender: user, message }])
    setMessage('')
  }

  const WriteAiMessage = (message) => {
    const messageObject = JSON.parse(message)
    return (
      <div className="overflow-auto bg-slate-900 text-white rounded-lg p-3">
        <Markdown
          children={messageObject.text}
          options={{ overrides: { code: SyntaxHighlightedCode } }}
        />
      </div>
    )
  }

  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost'

    if (isLocal && !webContainer) {
      getWebContainer()
        .then((container) => setWebContainer(container))
        .catch(console.error)
    }

    initializeSocket(project._id)
    receiveMessage('project-message', (data) => {
      setMessages((prev) => [...prev, data])
    })

    axios
      .get(`/projects/get-project/${project._id}`)
      .then((res) => {
        setProject(res.data.project)
        setFileTree(res.data.project.fileTree || {})
      })
      .catch(console.log)

    axios.get('/users/all').then((res) => setUsers(res.data.users)).catch(console.log)
  }, [])

  const saveFileTree = (ft) => {
    axios
      .put('/projects/update-file-tree', {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => console.log('File tree saved'))
      .catch(console.log)
  }

  return (
    <main className="h-screen w-screen flex bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      {/* Left panel */}
      <section
        className="flex flex-col bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700"
        style={{ width: leftWidth }}
      >
        <header className="flex justify-between items-center p-3 bg-gray-200 dark:bg-gray-700 shadow-sm">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm font-medium hover:text-blue-600"
          >
            Add collaborator
          </button>
        </header>

        <div className="flex-grow p-3 overflow-y-auto flex flex-col gap-2 scrollbar-hide">
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

        <div className="flex items-center border-t border-gray-300 dark:border-gray-700 p-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow p-2 bg-transparent outline-none"
            placeholder="Enter message..."
          />
          <button
            onClick={send}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            Send
          </button>
        </div>
      </section>

      {/* Resizer */}
      <div
        ref={resizerRef}
        onMouseDown={() => handleResizerMouseDown('left-center')}
        className="w-1 cursor-col-resize bg-gray-400 dark:bg-gray-600"
      ></div>

      {/* Center panel */}
      <section className="flex flex-col" style={{ width: centerWidth }}>
        {/* File Explorer */}
        <div className="flex border-b border-gray-300 dark:border-gray-700">
          <div className="bg-gray-200 dark:bg-gray-800 w-64 p-2">
            {Object.keys(fileTree).map((file, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentFile(file)
                  setOpenFiles((prev) => [...new Set([...prev, file])])
                }}
                className={`block w-full text-left px-2 py-1 hover:bg-blue-100 dark:hover:bg-blue-900 ${
                  currentFile === file
                    ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                    : ''
                }`}
              >
                {file}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="flex flex-col flex-grow">
            <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
              <div className="flex gap-2">
                {openFiles.map((file, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentFile(file)}
                    className={`px-2 py-1 rounded-t-md ${
                      currentFile === file
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-200'
                    }`}
                  >
                    {file}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-grow overflow-auto p-2 bg-gray-50 dark:bg-gray-900">
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
                  />
                </pre>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Resizer */}
      <div
        ref={resizerRef}
        onMouseDown={() => handleResizerMouseDown('center-right')}
        className="w-1 cursor-col-resize bg-gray-400 dark:bg-gray-600"
      ></div>

      {/* Right panel */}
      {iframeUrl && webContainer && (
        <section className="flex flex-col border-l border-gray-300 dark:border-gray-700" style={{ width: rightWidth }}>
          <input
            type="text"
            value={iframeUrl}
            onChange={(e) => setIframeUrl(e.target.value)}
            className="p-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 text-sm outline-none"
          />
          <iframe src={iframeUrl} className="flex-grow w-full"></iframe>
        </section>
      )}
    </main>
  )
}

export default Project
