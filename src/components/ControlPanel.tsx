import { useState } from 'react';
import './ControlPanel.css';

interface MatchConfig {
  intensity: number;
  max_correction: number;
  smoothing_factor: number;
  use_psychoacoustic: boolean;
  preserve_dynamics: boolean;
}

interface ControlPanelProps {
  config: MatchConfig;
  onChange: (config: MatchConfig) => void;
}

export function ControlPanel({ config, onChange }: ControlPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateConfig = (updates: Partial<MatchConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="control-panel">
      <h3>Match Settings</h3>

      <div className="control-section">
        <div className="control-group">
          <label>
            <span className="label-text">Match Intensity</span>
            <span className="label-value">{(config.intensity * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.intensity}
            onChange={(e) => updateConfig({ intensity: parseFloat(e.target.value) })}
            className="slider"
          />
          <div className="slider-labels">
            <span>Subtle</span>
            <span>Moderate</span>
            <span>Aggressive</span>
          </div>
          <p className="help-text">
            {config.intensity < 0.4 && '🎵 Minimal changes - preserves original character'}
            {config.intensity >= 0.4 && config.intensity < 0.7 && '⚖️ Balanced matching - recommended'}
            {config.intensity >= 0.7 && '⚡ Strong correction - maximum similarity'}
          </p>
        </div>

        <div className="control-group">
          <label>
            <span className="label-text">Maximum Correction</span>
            <span className="label-value">±{config.max_correction.toFixed(1)} dB</span>
          </label>
          <input
            type="range"
            min="3"
            max="12"
            step="0.5"
            value={config.max_correction}
            onChange={(e) => updateConfig({ max_correction: parseFloat(e.target.value) })}
            className="slider"
          />
          <div className="slider-labels">
            <span>±3 dB</span>
            <span>±6 dB</span>
            <span>±12 dB</span>
          </div>
          <p className="help-text">
            Limits how much each frequency band can be adjusted
          </p>
        </div>

        <div className="control-group">
          <label>
            <span className="label-text">Smoothing</span>
            <span className="label-value">{(config.smoothing_factor * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.smoothing_factor}
            onChange={(e) => updateConfig({ smoothing_factor: parseFloat(e.target.value) })}
            className="slider"
          />
          <div className="slider-labels">
            <span>Sharp</span>
            <span>Smooth</span>
          </div>
          <p className="help-text">
            Higher values create gentler transitions between frequencies
          </p>
        </div>
      </div>

      <button 
        className="btn-text"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? '▼' : '▶'} Advanced Options
      </button>

      {showAdvanced && (
        <div className="control-section advanced">
          <div className="toggle-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={config.use_psychoacoustic}
                onChange={(e) => updateConfig({ use_psychoacoustic: e.target.checked })}
              />
              <span className="toggle-switch" />
              <span className="toggle-text">
                <strong>Psychoacoustic Weighting</strong>
                <small>Prioritize frequencies humans hear best (1-4 kHz)</small>
              </span>
            </label>
          </div>

          <div className="toggle-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={config.preserve_dynamics}
                onChange={(e) => updateConfig({ preserve_dynamics: e.target.checked })}
              />
              <span className="toggle-switch" />
              <span className="toggle-text">
                <strong>Preserve Dynamic Range</strong>
                <small>Avoid over-compression of natural dynamics</small>
              </span>
            </label>
          </div>

          <div className="preset-buttons">
            <h4>Presets</h4>
            <div className="preset-grid">
              <button
                className="btn-preset"
                onClick={() => onChange({
                  intensity: 0.3,
                  max_correction: 3.0,
                  smoothing_factor: 0.7,
                  use_psychoacoustic: true,
                  preserve_dynamics: true,
                })}
              >
                🎵 Subtle
              </button>
              <button
                className="btn-preset"
                onClick={() => onChange({
                  intensity: 0.7,
                  max_correction: 6.0,
                  smoothing_factor: 0.5,
                  use_psychoacoustic: true,
                  preserve_dynamics: true,
                })}
              >
                ⚖️ Balanced
              </button>
              <button
                className="btn-preset"
                onClick={() => onChange({
                  intensity: 0.9,
                  max_correction: 9.0,
                  smoothing_factor: 0.3,
                  use_psychoacoustic: true,
                  preserve_dynamics: false,
                })}
              >
                ⚡ Aggressive
              </button>
              <button
                className="btn-preset"
                onClick={() => onChange({
                  intensity: 0.6,
                  max_correction: 6.0,
                  smoothing_factor: 0.8,
                  use_psychoacoustic: true,
                  preserve_dynamics: true,
                })}
              >
                🎸 Guitar
              </button>
              <button
                className="btn-preset"
                onClick={() => onChange({
                  intensity: 0.5,
                  max_correction: 4.0,
                  smoothing_factor: 0.6,
                  use_psychoacoustic: true,
                  preserve_dynamics: true,
                })}
              >
                🎤 Vocals
              </button>
              <button
                className="btn-preset"
                onClick={() => onChange({
                  intensity: 0.8,
                  max_correction: 8.0,
                  smoothing_factor: 0.4,
                  use_psychoacoustic: false,
                  preserve_dynamics: false,
                })}
              >
                🎛️ Mastering
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
