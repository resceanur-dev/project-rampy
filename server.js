const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const uploadsDir = 'D:\\project-rampy\\uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

app.use(express.static('public'));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/files', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.json([]);
    
    const fileInfos = files.map(file => {
      const stats = fs.statSync(path.join(uploadsDir, file));
      return {
        id: file,
        name: file.substring(file.indexOf('-') + 14),
        originalName: file.substring(file.indexOf('-') + 14),
        size: stats.size,
        uploadedAt: stats.birthtime
      };
    }).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    res.json(fileInfos);
  });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, file: req.file });
});

app.delete('/api/files/:id', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.id);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.get('/download/:id', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.id);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

app.listen(PORT, () => {
  console.log(`Project Rampy running at http://localhost:${PORT}`);
});
