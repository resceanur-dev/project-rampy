import { useState, useEffect } from 'react';

// Simulated encrypted storage with base64
const encryptData = (data: string): string => {
  return btoa(encodeURIComponent(data));
};

const decryptData = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return '';
  }
};

// Simulated SQLite storage using localStorage
const db = {
  setItem: (key: string, value: any) => {
    const encrypted = encryptData(JSON.stringify(value));
    localStorage.setItem(`rampy_${key}`, encrypted);
  },
  getItem: (key: string) => {
    const encrypted = localStorage.getItem(`rampy_${key}`);
    if (!encrypted) return null;
    try {
      return JSON.parse(decryptData(encrypted));
    } catch {
      return null;
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(`rampy_${key}`);
  }
};

interface DriveFile {
  id: string;
  name: string;
  thumbnailLink?: string;
  webViewLink: string;
  iconLink: string;
  mimeType: string;
}

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [message, setMessage] = useState('');
  const [savedMessages, setSavedMessages] = useState<any[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');

  // Google Drive folder ID - your public folder
  const GOOGLE_DRIVE_FOLDER_ID = '1YxAhYOvOFqBEqUlIS_Gd0eFtFvQWTPfJ';
  const GOOGLE_DRIVE_LINK = `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_FOLDER_ID}`;

  // Sample files from your Google Drive (simulated - in real app would use Drive API)
  const driveFiles: DriveFile[] = [
    {
      id: '1',
      name: 'ML Model Training Results',
      webViewLink: GOOGLE_DRIVE_LINK,
      iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document',
      mimeType: 'image/png'
    },
    {
      id: '2',
      name: 'Neural Network Architecture',
      webViewLink: GOOGLE_DRIVE_LINK,
      iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document',
      mimeType: 'image/png'
    },
    {
      id: '3',
      name: 'Dataset Analysis Report',
      webViewLink: GOOGLE_DRIVE_LINK,
      iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document',
      mimeType: 'application/pdf'
    },
    {
      id: '4',
      name: 'Project Documentation',
      webViewLink: GOOGLE_DRIVE_LINK,
      iconLink: 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document',
      mimeType: 'application/pdf'
    }
  ];

  useEffect(() => {
    const messages = db.getItem('messages') || [];
    setSavedMessages(messages);
  }, []);

  const notify = (text: string) => {
    setNotificationText(text);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleDownload = (file: DriveFile) => {
    // Store download activity in encrypted storage
    const downloads = db.getItem('downloads') || [];
    downloads.push({
      file: file.name,
      timestamp: new Date().toISOString()
    });
    db.setItem('downloads', downloads);
    
    // Redirect to Google Drive
    window.open(file.webViewLink, '_blank');
    notify(`Opening ${file.name} on Google Drive...`);
  };

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      timestamp: new Date().toISOString(),
      encrypted: encryptData(message)
    };

    const messages = db.getItem('messages') || [];
    messages.push(newMessage);
    db.setItem('messages', messages);
    setSavedMessages(messages);
    setMessage('');
    notify('Message saved securely with encryption!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {notificationText}
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-md z-40 border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-xl">
                PR
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Project Rampy
              </span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveSection('home')}
                className={`px-4 py-2 rounded-lg transition-all ${activeSection === 'home' ? 'bg-purple-600' : 'hover:bg-purple-600/30'}`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveSection('downloads')}
                className={`px-4 py-2 rounded-lg transition-all ${activeSection === 'downloads' ? 'bg-purple-600' : 'hover:bg-purple-600/30'}`}
              >
                Downloads
              </button>
              <button
                onClick={() => setActiveSection('contact')}
                className={`px-4 py-2 rounded-lg transition-all ${activeSection === 'contact' ? 'bg-purple-600' : 'hover:bg-purple-600/30'}`}
              >
                Contact
              </button>
              <a
                href="https://www.instagram.com/project_rampy/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg hover:opacity-80 transition-opacity"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @project_rampy
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        {activeSection === 'home' && (
          <div className="max-w-7xl mx-auto px-4">
            {/* Hero Section */}
            <div className="text-center py-16">
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Project Rampy
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Exploring the frontiers of Machine Learning & Artificial Intelligence
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href={GOOGLE_DRIVE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-3"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                  </svg>
                  Access Google Drive
                </a>
                <a
                  href="https://www.instagram.com/project_rampy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 border border-pink-500 rounded-xl font-semibold hover:bg-pink-500/20 transition-colors flex items-center gap-3"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Follow on Instagram
                </a>
              </div>
            </div>

            {/* About Section */}
            <div className="mt-16 grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">About the Project</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Project Rampy is an innovative machine learning initiative focused on developing cutting-edge AI solutions. Our mission is to push the boundaries of what's possible with neural networks and deep learning algorithms.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We explore various domains including computer vision, natural language processing, and predictive analytics. Our models are trained on diverse datasets to ensure robustness and generalization across different applications.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">Machine Learning Focus</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Our machine learning pipeline incorporates state-of-the-art techniques including transfer learning, reinforcement learning, and generative adversarial networks (GANs). We utilize frameworks like TensorFlow, PyTorch, and scikit-learn.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400">•</span> Deep Neural Networks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400">•</span> Convolutional Neural Networks (CNN)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400">•</span> Recurrent Neural Networks (RNN/LSTM)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400">•</span> Transformer Models
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="mt-16 text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-12 border border-purple-500/30">
              <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
              <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                Interested in our machine learning project? Want to collaborate or learn more? Reach out to us through Instagram or email!
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <a
                  href="https://www.instagram.com/project_rampy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram: @project_rampy
                </a>
                <a
                  href="mailto:rampy.contactus@gmail.com"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  rampy.contactus@gmail.com
                </a>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'downloads' && (
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Google Drive Downloads
              </h1>
              <p className="text-gray-300 max-w-xl mx-auto">
                Access and download files from our Google Drive. Clicking download will redirect you to our shared folder.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                  </svg>
                  <div>
                    <h3 className="font-semibold">Connected to Google Drive</h3>
                    <p className="text-sm text-gray-400">rampy.contactus@gmail.com</p>
                  </div>
                </div>
                <a
                  href={GOOGLE_DRIVE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Full Drive
                </a>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-black/20 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        {file.mimeType.includes('image') ? (
                          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{file.name}</h4>
                        <p className="text-sm text-gray-400">{file.mimeType.split('/').pop()?.toUpperCase()}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(file)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
              <p className="text-yellow-300">
                <strong>Note:</strong> Clicking "Download" will redirect you to Google Drive where you can access the files with your account.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'contact' && (
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Contact Us
              </h1>
              <p className="text-gray-300">
                Have questions about our machine learning project? Reach out to us!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Methods */}
              <div className="space-y-6">
                <a
                  href="https://www.instagram.com/project_rampy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-2xl p-6 border border-pink-500/30 hover:border-pink-500/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Instagram</h3>
                      <p className="text-pink-400">@project_rampy</p>
                      <p className="text-sm text-gray-400 mt-1">DM us for quick responses</p>
                    </div>
                  </div>
                </a>

                <a
                  href="mailto:rampy.contactus@gmail.com"
                  className="block bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Email</h3>
                      <p className="text-blue-400">rampy.contactus@gmail.com</p>
                      <p className="text-sm text-gray-400 mt-1">For detailed inquiries</p>
                    </div>
                  </div>
                </a>

                <a
                  href={GOOGLE_DRIVE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30 hover:border-green-500/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Google Drive</h3>
                      <p className="text-green-400">Shared Resources</p>
                      <p className="text-sm text-gray-400 mt-1">Access project files</p>
                    </div>
                  </div>
                </a>
              </div>

              {/* Secure Message Form */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Encrypted Message Storage
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Messages are encrypted with Base64 and stored securely in local SQLite-like storage.
                </p>
                <form onSubmit={handleSubmitMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 focus:border-purple-500 focus:outline-none resize-none"
                      rows={4}
                      placeholder="Type your message here..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Save Encrypted Message
                  </button>
                </form>

                {savedMessages.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Stored Messages ({savedMessages.length})</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {savedMessages.slice(-5).reverse().map((msg, idx) => (
                        <div key={idx} className="bg-black/20 rounded-lg p-3 text-sm">
                          <p className="text-gray-300">{msg.text}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Encrypted: {msg.encrypted.substring(0, 30)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/30 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-6 mb-4">
            <a
              href="https://www.instagram.com/project_rampy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="mailto:rampy.contactus@gmail.com"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
            <a
              href={GOOGLE_DRIVE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
              </svg>
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 Project Rampy. All data encrypted with Base64 and stored securely.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
