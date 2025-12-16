const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configurar diretório de uploads
const uploadDir = path.join(__dirname, '../../uploads');
const subDirs = ['vehicles', 'drivers', 'documents', 'incidents'];

// Criar diretórios se não existirem
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
subDirs.forEach(dir => {
  const subDir = path.join(uploadDir, dir);
  if (!fs.existsSync(subDir)) {
    fs.mkdirSync(subDir, { recursive: true });
  }
});

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.params.category || 'documents';
    const dest = path.join(uploadDir, category);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Tipos permitidos
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Upload de arquivo único
router.post('/:category', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const fileUrl = `/uploads/${req.params.category}/${req.file.filename}`;

    res.json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
  }
});

// Upload de múltiplos arquivos
router.post('/:category/multiple', authenticateToken, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${req.params.category}/${file.filename}`
    }));

    res.json(files);
  } catch (error) {
    console.error('Erro no upload múltiplo:', error);
    res.status(500).json({ error: 'Erro ao fazer upload dos arquivos' });
  }
});

// Deletar arquivo
router.delete('/:category/:filename', authenticateToken, (req, res) => {
  try {
    const { category, filename } = req.params;
    const filePath = path.join(uploadDir, category, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'Arquivo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ error: 'Erro ao excluir arquivo' });
  }
});

// Listar arquivos de uma categoria
router.get('/:category', authenticateToken, (req, res) => {
  try {
    const { category } = req.params;
    const dirPath = path.join(uploadDir, category);

    if (!fs.existsSync(dirPath)) {
      return res.json([]);
    }

    const files = fs.readdirSync(dirPath).map(filename => {
      const filePath = path.join(dirPath, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        url: `/uploads/${category}/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime
      };
    });

    res.json(files);
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
});

// Error handler para multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 10MB' });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

module.exports = router;
