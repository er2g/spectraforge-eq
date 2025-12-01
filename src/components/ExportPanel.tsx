import { useState } from 'react';
import './ExportPanel.css';

interface MatchResult {
  correction_profile: {
    bands: Array<{
      frequency: number;
      gain_db: number;
      bandwidth: number;
      confidence: number;
    }>;
  };
  quality_score: number;
  warnings: string[];
}

interface ExportPanelProps {
  matchResult: MatchResult;
  onExport: (format: string) => Promise<void>;
  onBack: () => void;
}

export function ExportPanel({ matchResult, onExport, onBack }: ExportPanelProps) {
  const [exporting, setExporting] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setExporting(true);
    setExportedFormat(null);
    try {
      await onExport(format);
      setExportedFormat(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-panel">
      <h2>Export EQ Settings</h2>

      <div className="export-summary">
        <div className="summary-card">
          <h3>Match Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Quality Score</span>
              <span className="summary-value quality">
                {(matchResult.quality_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Bands</span>
              <span className="summary-value">
                {matchResult.correction_profile.bands.length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Active Corrections</span>
              <span className="summary-value">
                {matchResult.correction_profile.bands.filter(b => Math.abs(b.gain_db) > 0.5).length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Max Correction</span>
              <span className="summary-value">
                {Math.max(...matchResult.correction_profile.bands.map(b => Math.abs(b.gain_db))).toFixed(1)} dB
              </span>
            </div>
          </div>
        </div>

        <div className="quick-view">
          <h4>EQ Band Summary</h4>
          <div className="bands-list">
            {matchResult.correction_profile.bands.map((band, i) => (
              <div key={i} className="band-row">
                <span className="band-freq">{formatFrequency(band.frequency)} Hz</span>
                <div className="band-bar">
                  <div 
                    className={`bar-fill ${band.gain_db > 0 ? 'boost' : 'cut'}`}
                    style={{ 
                      width: `${Math.abs(band.gain_db) / 12 * 100}%`,
                      marginLeft: band.gain_db > 0 ? '50%' : `${50 - (Math.abs(band.gain_db) / 12 * 50)}%`,
                    }}
                  />
                </div>
                <span className={`band-gain ${band.gain_db > 0 ? 'boost' : 'cut'}`}>
                  {band.gain_db > 0 ? '+' : ''}{band.gain_db.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="export-formats">
        <h3>Choose Export Format</h3>
        
        <div className="format-grid">
          <ExportCard
            icon="🎛️"
            title="REAPER FX Chain"
            description="Direct import into REAPER with ReaEQ configured"
            format="reaper"
            extension=".RfxChain"
            onExport={handleExport}
            exporting={exporting}
            exported={exportedFormat === 'reaper'}
            recommended
          />

          <ExportCard
            icon="📋"
            title="JSON Data"
            description="Structured data for custom integrations"
            format="json"
            extension=".json"
            onExport={handleExport}
            exporting={exporting}
            exported={exportedFormat === 'json'}
          />

          <ExportCard
            icon="📄"
            title="Text Report"
            description="Human-readable EQ settings list"
            format="txt"
            extension=".txt"
            onExport={handleExport}
            exporting={exporting}
            exported={exportedFormat === 'txt'}
          />
        </div>
      </div>

      <div className="export-instructions">
        <h4>📘 How to Use in REAPER</h4>
        <ol>
          <li>Export as <strong>REAPER FX Chain</strong></li>
          <li>In REAPER, select your track</li>
          <li>Click on the FX button</li>
          <li>Go to <strong>File → Import FX chain...</strong></li>
          <li>Select the exported .RfxChain file</li>
          <li>ReaEQ will be added with all settings configured ✨</li>
        </ol>
      </div>

      <div className="action-buttons">
        <button
          className="btn-secondary"
          onClick={onBack}
        >
          ← Back to Results
        </button>
      </div>

      {exportedFormat && (
        <div className="export-success">
          ✓ Exported successfully as {exportedFormat.toUpperCase()}
        </div>
      )}
    </div>
  );
}

interface ExportCardProps {
  icon: string;
  title: string;
  description: string;
  format: string;
  extension: string;
  onExport: (format: string) => Promise<void>;
  exporting: boolean;
  exported: boolean;
  recommended?: boolean;
}

function ExportCard({ 
  icon, 
  title, 
  description, 
  format, 
  extension, 
  onExport, 
  exporting,
  exported,
  recommended 
}: ExportCardProps) {
  return (
    <div className={`export-card ${recommended ? 'recommended' : ''} ${exported ? 'exported' : ''}`}>
      {recommended && <div className="recommended-badge">Recommended</div>}
      {exported && <div className="exported-badge">✓ Exported</div>}
      
      <div className="card-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
      <div className="card-extension">{extension}</div>
      
      <button
        className={`btn-export ${exported ? 'btn-success' : 'btn-primary'}`}
        onClick={() => onExport(format)}
        disabled={exporting}
      >
        {exporting ? 'Exporting...' : exported ? 'Export Again' : 'Export'}
      </button>
    </div>
  );
}

function formatFrequency(freq: number): string {
  if (freq >= 1000) {
    return `${(freq / 1000).toFixed(freq >= 10000 ? 0 : 1)}k`;
  }
  return `${freq.toFixed(0)}`;
}
