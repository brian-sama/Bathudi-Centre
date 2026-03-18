import React, { useState } from 'react';
import { Page, BroadcastMessage } from '../../types';

interface BroadcastMessagesProps {
  onNavigate: (page: Page) => void;
}

const BroadcastMessages: React.FC<BroadcastMessagesProps> = ({ onNavigate }) => {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([
    {
      id: 1,
      title: 'Welcome New Students',
      message: 'Welcome all new students joining us this semester!',
      sender: 'Principal',
      sent_at: '2024-10-25T09:00:00',
      recipients: 45,
      read_count: 38
    },
    {
      id: 2,
      title: 'Holiday Schedule',
      message: 'Important information about the upcoming holiday schedule',
      sender: 'Admin',
      sent_at: '2024-10-20T14:30:00',
      recipients: 120,
      read_count: 89
    }
  ]);

  const [newBroadcast, setNewBroadcast] = useState({
    title: '',
    message: '',
    sender: 'Admin'
  });

  const handleSendBroadcast = () => {
    if (!newBroadcast.title.trim() || !newBroadcast.message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const broadcast: BroadcastMessage = {
      id: broadcasts.length + 1,
      title: newBroadcast.title,
      message: newBroadcast.message,
      sender: newBroadcast.sender,
      sent_at: new Date().toISOString(),
      recipients: 120,
      read_count: 0
    };

    setBroadcasts([broadcast, ...broadcasts]);
    setNewBroadcast({ title: '', message: '', sender: 'Admin' });
    alert('Broadcast message sent successfully!');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header>
        <h1 className="text-2xl lg:text-3xl font-orbitron font-bold text-white mb-2">
          Broadcast Messages
        </h1>
        <p className="text-gray-400">
          Send broadcast messages to all students
        </p>
      </header>

      {/* Broadcast Form */}
      <div className="glass p-6 rounded-xl border border-white/5">
        <h2 className="text-lg font-bold text-white mb-4">New Broadcast Message</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Sender Name
            </label>
            <input
              type="text"
              value={newBroadcast.sender}
              onChange={(e) => setNewBroadcast({...newBroadcast, sender: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
              placeholder="Enter sender name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newBroadcast.title}
              onChange={(e) => setNewBroadcast({...newBroadcast, title: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
              placeholder="Enter message title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Message
            </label>
            <textarea
              value={newBroadcast.message}
              onChange={(e) => setNewBroadcast({...newBroadcast, message: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 min-h-[150px]"
              placeholder="Enter your broadcast message"
            />
          </div>

          <button
            onClick={handleSendBroadcast}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl font-bold transition-all"
          >
            Send Broadcast Message
          </button>
        </div>
      </div>

      {/* Broadcast History */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/3">
          <h2 className="text-lg font-bold text-white">Broadcast History</h2>
          <p className="text-sm text-gray-400 mt-1">
            {broadcasts.length} broadcast(s) sent
          </p>
        </div>

        <div className="divide-y divide-white/5">
          {broadcasts.map((broadcast) => (
            <div key={broadcast.id} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg">{broadcast.title}</h3>
                  <p className="text-gray-400 text-sm">From: {broadcast.sender}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(broadcast.sent_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <p className="text-gray-300">{broadcast.message}</p>
              </div>
              
              <div className="flex justify-between text-sm text-gray-400">
                <span>Recipients: {broadcast.recipients} students</span>
                <span>Read: {broadcast.read_count} ({Math.round((broadcast.read_count / broadcast.recipients) * 100)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BroadcastMessages;
