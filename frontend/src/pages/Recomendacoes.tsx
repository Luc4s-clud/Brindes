import { useState } from 'react';
import { recomendacoesService } from '../services/recomendacoes.service';
import api from '../services/api';
import './Recomendacoes.css';

function Recomendacoes() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    link: '',
    email: '',
    imagem: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imagem: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      alert('Informe o nome do brinde');
      return;
    }

    try {
      setSubmitting(true);
      let imagemUrl = '';

      // Upload da imagem se houver
      if (formData.imagem) {
        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('imagem', formData.imagem);

        const uploadResponse = await api.post('/upload/recomendacao', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        imagemUrl = uploadResponse.data.imagemUrl;
        setUploading(false);
      }

      // Criar recomendação
      await recomendacoesService.create({
        nome: formData.nome,
        descricao: formData.descricao || undefined,
        categoria: formData.categoria || undefined,
        link: formData.link || undefined,
        email: formData.email || undefined,
        imagemUrl: imagemUrl || undefined,
      });

      alert('Recomendação enviada com sucesso! Obrigado pela sua sugestão.');
      setFormData({
        nome: '',
        descricao: '',
        categoria: '',
        link: '',
        email: '',
        imagem: null,
      });
      setShowForm(false);
    } catch (error: any) {
      console.error('Erro ao criar recomendação:', error);
      alert(error.response?.data?.error || 'Erro ao enviar recomendação');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="recomendacoes">
      <div className="recomendacoes-header">
        <h1>Recomendar Brindes</h1>
        <p className="subtitle">
          Tem uma ideia de brinde que gostaria de ver no catálogo? Compartilhe conosco!
        </p>
      </div>

      {!showForm ? (
        <div className="recomendacoes-content">
          <div className="info-box">
            <h2>💡 Como funciona?</h2>
            <ul>
              <li>Envie sugestões de brindes que você gostaria de ver no catálogo</li>
              <li>Inclua nome, descrição, categoria e link (se disponível)</li>
              <li>Pode anexar uma imagem do produto</li>
              <li>As sugestões serão avaliadas pela equipe de Marketing</li>
            </ul>
          </div>

          <button className="btn-recomendar" onClick={() => setShowForm(true)}>
            + Nova Recomendação
          </button>
        </div>
      ) : (
        <div className="form-recomendacao">
          <h2>Nova Recomendação</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome do Brinde *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                placeholder="Ex: Caneta Personalizada"
              />
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={4}
                placeholder="Descreva o brinde, suas características, etc..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoria</label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ex: Vestuário, Tecnologia..."
                />
              </div>

              <div className="form-group">
                <label>Link do Produto</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-group">
              <label>Seu Email (opcional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
              />
            </div>

            <div className="form-group">
              <label>Imagem do Produto (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.imagem && (
                <p className="file-info">Arquivo selecionado: {formData.imagem.name}</p>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    nome: '',
                    descricao: '',
                    categoria: '',
                    link: '',
                    email: '',
                    imagem: null,
                  });
                }}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={submitting || uploading}>
                {uploading ? 'Enviando imagem...' : submitting ? 'Enviando...' : 'Enviar Recomendação'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Recomendacoes;

