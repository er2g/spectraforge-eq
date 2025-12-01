import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { FileUploader } from './components/FileUploader';
import { FrequencyAnalyzer } from './components/FrequencyAnalyzer';
import { EQVisualization } from './components/EQVisualization';
import { ControlPanel } from './components/ControlPanel';
import { ExportPanel } from './components/ExportPanel';
import './App.css';

interface EQProfile {
  bands: Array<{
    frequency: number;
    gain_db: number;
    bandwidth: number;
    confidence: number;
  }>;
  overall_loudness: number;
  dynamic_range: number;
  spectral_centroid: number;
  spectral_rolloff: number;
}

interface MatchResult {
  correction_profile: EQProfile;
  reference_normalized: number[];
  input_normalized: number[];
  quality_score: number;
  warnings: string[];
}

interface MatchConfig {
  intensity: number;
  max_correction: number;
  smoothing_factor: number;
  use_psychoacoustic: boolean;
  preserve_dynamics: boolean;
}

type ProcessStep = 'upload' | 'analyze' | 'match' | 'export';

function App() {
  const [step, setStep] = useState<ProcessStep>('upload');
  const [referenceProfile, setReferenceProfile] = useState<EQProfile | null>(null);
  const [inputProfile, setInputProfile] = useState<EQProfile | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchConfig, setMatchConfig] = useState<MatchConfig>({
    intensity: 0.7,
    max_correction: 6.0,
    smoothing_factor: 0.5,
    use_psychoacoustic: true,
    preserve_dynamics: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadReference = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Audio Files',
          extensions: ['wav', 'mp3', 'flac', 'ogg', 'm4a', 'aac']
        }]
      });

      if (selected && typeof selected === 'string') {
        const profile = await invoke<EQProfile>('load_reference_audio', { 
          path: selected 
        });
        setReferenceProfile(profile);
      }
    } catch (err) {
      setError(`Reference load error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadInput = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Audio Files',
          extensions: ['wav', 'mp3', 'flac', 'ogg', 'm4a', 'aac']
        }]
      });

      if (selected && typeof selected === 'string') {
        const profile = await invoke<EQProfile>('load_input_audio', { 
          path: selected 
        });
        setInputProfile(profile);
        setStep('analyze');
      }
    } catch (err) {
      setError(`Input load error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateMatch = async () => {
    if (!referenceProfile || !inputProfile) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await invoke<MatchResult>('calculate_eq_match', {
        reference: referenceProfile,
        input: inputProfile,
        config: matchConfig,
      });
      
      setMatchResult(result);
      setStep('match');
    } catch (err) {
      setError(`Match calculation error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    if (!matchResult) return;

    try {
      const exported = await invoke<string>('export_eq_settings', {
        result: matchResult,
        format,
      });
      
      // Download file
      const blob = new Blob([exported], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eq-match.${format === 'reaper' ? 'RfxChain' : format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Export error: ${err}`);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎚️ Professional EQ Matcher</h1>
        <div className="step-indicator">
          <StepBadge active={step === 'upload'} completed={referenceProfile !== null}>
            1. Upload
          </StepBadge>
          <StepBadge active={step === 'analyze'} completed={inputProfile !== null}>
            2. Analyze
          </StepBadge>
          <StepBadge active={step === 'match'} completed={matchResult !== null}>
            3. Match
          </StepBadge>
          <StepBadge active={step === 'export'} completed={false}>
            4. Export
          </StepBadge>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {step === 'upload' && (
          <div className="upload-section">
            <FileUploader
              title="Reference Audio"
              subtitle="The sound you want to match"
              onLoad={handleLoadReference}
              loaded={referenceProfile !== null}
              loading={loading}
            />
            
            {referenceProfile && (
              <>
                <div className="arrow-down">↓</div>
                <FileUploader
                  title="Your Audio"
                  subtitle="The sound to be corrected"
                  onLoad={handleLoadInput}
                  loaded={inputProfile !== null}
                  loading={loading}
                />
              </>
            )}
          </div>
        )}

        {step === 'analyze' && referenceProfile && inputProfile && (
          <div className="analyze-section">
            <div className="profiles-comparison">
              <FrequencyAnalyzer
                title="Reference"
                profile={referenceProfile}
                color="#4ade80"
              />
              <FrequencyAnalyzer
                title="Your Audio"
                profile={inputProfile}
                color="#f87171"
              />
            </div>

            <ControlPanel
              config={matchConfig}
              onChange={setMatchConfig}
            />

            <button
              className="btn-primary btn-large"
              onClick={handleCalculateMatch}
              disabled={loading}
            >
              {loading ? 'Calculating...' : 'Calculate EQ Match'}
            </button>
          </div>
        )}

        {step === 'match' && matchResult && (
          <div className="match-section">
            <EQVisualization
              referenceProfile={referenceProfile!}
              inputProfile={inputProfile!}
              matchResult={matchResult}
            />

            <div className="match-quality">
              <h3>Match Quality</h3>
              <div className="quality-bar">
                <div 
                  className="quality-fill"
                  style={{ 
                    width: `${matchResult.quality_score * 100}%`,
                    backgroundColor: getQualityColor(matchResult.quality_score)
                  }}
                />
              </div>
              <span className="quality-score">
                {(matchResult.quality_score * 100).toFixed(0)}%
              </span>
            </div>

            {matchResult.warnings.length > 0 && (
              <div className="warnings">
                <h4>⚠️ Warnings</h4>
                <ul>
                  {matchResult.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="action-buttons">
              <button
                className="btn-secondary"
                onClick={() => setStep('analyze')}
              >
                ← Adjust Settings
              </button>
              <button
                className="btn-primary"
                onClick={() => setStep('export')}
              >
                Export Settings →
              </button>
            </div>
          </div>
        )}

        {step === 'export' && matchResult && (
          <ExportPanel
            matchResult={matchResult}
            onExport={handleExport}
            onBack={() => setStep('match')}
          />
        )}
      </main>
    </div>
  );
}

function StepBadge({ 
  active, 
  completed, 
  children 
}: { 
  active: boolean; 
  completed: boolean; 
  children: React.ReactNode;
}) {
  return (
    <div className={`step-badge ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}>
      {children}
    </div>
  );
}

function getQualityColor(score: number): string {
  if (score >= 0.8) return '#4ade80';
  if (score >= 0.6) return '#fbbf24';
  return '#f87171';
}

export default App;
