import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Send, 
  Trash2, 
  MessageSquare, 
  ListTodo, 
  Sparkles,
  Clock,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { getCoachResponse } from './services/geminiService';
import { Task, Message } from './types';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hey there! I'm your Task Coach. Ready to conquer your day? Tell me what's on your plate, or just say hi!",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addTask = (title: string) => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      priority: 'medium',
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await getCoachResponse(input, history);
    
    const coachMessage: Message = {
      id: crypto.randomUUID(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, coachMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen max-w-7xl mx-auto overflow-hidden bg-[#f5f5f5]">
      {/* Sidebar - Task List */}
      <aside className="w-80 border-r border-gray-200 bg-white flex flex-col hidden md:flex">
        <div className="p-6 border-bottom border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-black p-2 rounded-xl">
              <ListTodo className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-semibold text-xl tracking-tight">Daily Tasks</h1>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Add a quick task..."
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask(newTaskTitle)}
            />
            <button 
              onClick={() => addTask(newTaskTitle)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {tasks.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 px-4"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">No tasks yet. Ask the coach for some ideas!</p>
                </motion.div>
              ) : (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      task.completed 
                        ? 'bg-gray-50 border-transparent opacity-60' 
                        : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
                    }`}
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                      )}
                    </button>
                    <span className={`flex-1 text-sm font-medium truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {task.title}
                    </span>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>{tasks.filter(t => t.completed).length} of {tasks.length} completed</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-white md:bg-transparent">
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Coach AI</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                  message.role === 'user' ? 'bg-gray-100' : 'bg-black'
                }`}>
                  {message.role === 'user' ? (
                    <span className="text-xs font-bold text-gray-600">ME</span>
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  message.role === 'user' 
                    ? 'bg-black text-white rounded-tr-none' 
                    : 'bg-white border border-gray-100 shadow-sm rounded-tl-none text-gray-800'
                }`}>
                  {message.text}
                  <div className={`mt-2 text-[10px] ${message.role === 'user' ? 'text-gray-400' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm p-4 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 bg-white md:bg-transparent">
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
              <AnimatePresence>
                {input.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-black text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-2"
                  >
                    Coach is listening
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-2 bg-white/50 animate-pulse" />
                      <div className="w-0.5 h-3 bg-white animate-pulse" />
                      <div className="w-0.5 h-2 bg-white/50 animate-pulse" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative group">
              <input
                type="text"
                placeholder="Ask for advice, break down a task, or just chat..."
                className="w-full pl-6 pr-14 py-4 bg-white border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                  input.trim() && !isLoading 
                    ? 'bg-black text-white shadow-md hover:scale-105 active:scale-95' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <p className="mt-3 text-center text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
              Powered by Gemini 3 Flash • Stay Focused • Stay Productive
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Task Overlay Toggle (Optional, but let's keep it simple for now) */}
      <div className="md:hidden fixed bottom-24 right-6 z-20">
        <button className="w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
          <ListTodo className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

