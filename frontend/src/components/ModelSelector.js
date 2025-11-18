import React, { useState } from 'react';
import './ModelSelector.css';
import api from '../api';

function ModelSelector({ models, selectedModel, onSelectModel, onRefreshModels }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPullDialog, setShowPullDialog] = useState(false);
  const [modelToPull, setModelToPull] = useState('');
  const [pullProgress, setPullProgress] = useState('');
  const [isPulling, setIsPulling] = useState(false);

  const popularModels = [
    { name: 'llama2', desc: 'Meta Llama 2 (7B)' },
    { name: 'llama2:13b', desc: 'Meta Llama 2 (13B)' },
    { name: 'mistral', desc: 'Mistral 7B' },
    { name: 'codellama', desc: 'Code Llama 7B' },
    { name: 'phi', desc: 'Microsoft Phi-2 (2.7B)' },
    { name: 'neural-chat', desc: 'Intel Neural Chat' },
    { name: 'starling-lm', desc: 'Starling LM 7B' },
    { name: 'gemma:2b', desc: 'Google Gemma 2B' },
  ];

  const handlePullModel = async () => {
    if (!modelToPull.trim()) return;

    setIsPulling(true);
    setPullProgress('Starting download...');

    try {
      await api.pullModel(modelToPull, (progress) => {
        if (progress.status === 'downloading') {
          const percent = progress.completed && progress.total
            ? Math.round((progress.completed / progress.total) * 100)
            : 0;
          setPullProgress(`Downloading: ${percent}%`);
        } else if (progress.status === 'success') {
          setPullProgress('Model downloaded successfully!');
          setTimeout(() => {
            setShowPullDialog(false);
            setModelToPull('');
            setPullProgress('');
            onRefreshModels();
          }, 1500);
        } else if (progress.status === 'error') {
          setPullProgress(`Error: ${progress.message}`);
        } else if (progress.status) {
          setPullProgress(progress.status);
        }
      });
    } catch (error) {
      setPullProgress(`Error: ${error.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div className="model-selector">
      <button
        className="model-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="model-icon">🧠</span>
        <span className="model-name">{selectedModel || 'Select Model'}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="model-dropdown">
          <div className="model-dropdown-header">
            <h3>Select Model</h3>
            <button
              className="pull-model-btn"
              onClick={() => {
                setShowPullDialog(true);
                setIsOpen(false);
              }}
            >
              + Pull New Model
            </button>
          </div>

          <div className="model-list">
            {models.length === 0 ? (
              <div className="no-models">
                <p>No models installed</p>
                <p className="no-models-hint">Pull a model to get started</p>
              </div>
            ) : (
              models.map((model) => (
                <div
                  key={model.name}
                  className={`model-item ${selectedModel === model.name ? 'active' : ''}`}
                  onClick={() => {
                    onSelectModel(model.name);
                    setIsOpen(false);
                  }}
                >
                  <div className="model-info">
                    <div className="model-item-name">{model.name}</div>
                    <div className="model-item-size">
                      {(model.size / 1024 / 1024 / 1024).toFixed(2)} GB
                    </div>
                  </div>
                  {selectedModel === model.name && (
                    <span className="check-mark">✓</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showPullDialog && (
        <div className="modal-overlay" onClick={() => !isPulling && setShowPullDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Pull New Model</h2>
            <p className="modal-desc">
              Enter a model name from Ollama library or select from popular models below
            </p>

            <input
              type="text"
              value={modelToPull}
              onChange={(e) => setModelToPull(e.target.value)}
              placeholder="e.g., llama2, mistral, codellama"
              className="model-input"
              disabled={isPulling}
            />

            <div className="popular-models">
              <h3>Popular Models</h3>
              <div className="popular-models-grid">
                {popularModels.map((model) => (
                  <button
                    key={model.name}
                    className="popular-model-btn"
                    onClick={() => setModelToPull(model.name)}
                    disabled={isPulling}
                  >
                    <div className="popular-model-name">{model.name}</div>
                    <div className="popular-model-desc">{model.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {pullProgress && (
              <div className="pull-progress">
                {pullProgress}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setShowPullDialog(false)}
                disabled={isPulling}
              >
                Cancel
              </button>
              <button
                className="modal-btn primary"
                onClick={handlePullModel}
                disabled={!modelToPull.trim() || isPulling}
              >
                {isPulling ? 'Downloading...' : 'Pull Model'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModelSelector;
