import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Database, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

export function SettingsModal({ onClose }) {
  const { gasUrl, updateGasUrl } = useAuth();
  const [inputUrl, setInputUrl] = useState(gasUrl || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    updateGasUrl(inputUrl);
    onClose();
  };

  const handleClear = () => {
    setInputUrl('');
    updateGasUrl('');
    setTestResult({ success: true, message: 'Switched to Demo Local Mode.' });
  };

  const handleTestConnection = async () => {
    if (!inputUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter a Google Apps Script URL first.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(inputUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'ping' }),
      });
      const data = await response.json();
      if (data && data.success) {
        setTestResult({ success: true, message: 'Connection Successful! ' + data.message });
      } else {
        setTestResult({ success: false, message: data.message || 'API responded with error.' });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Could not connect. Ensure Web App is deployed with "Anyone" access and CORS enabled.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5e5ea] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#0071e3]" />
            <h3 className="font-semibold text-lg text-[#1d1d1f]">Backend Data Source</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#858585] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
              Google Apps Script Web App URL
            </label>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="apple-input font-mono text-xs"
            />
            <p className="mt-1 text-xs text-[#707070]">
              Leave empty to use built-in <strong className="text-[#1d1d1f]">Demo Local Mode</strong>.
            </p>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2.5 text-xs ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>{testResult.message}</div>
            </div>
          )}

          {/* Deployment Quick Guide */}
          <div className="p-3.5 bg-[#f5f5f7] rounded-xl border border-[#e5e5ea] text-xs text-[#474747] space-y-2">
            <div className="font-semibold text-[#1d1d1f] flex items-center justify-between">
              <span>Google Sheets Deployment Instructions</span>
              <span className="text-[10px] text-[#0071e3] font-normal">PRD §14-19</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[#707070] text-[11px] leading-relaxed">
              <li>Open your Google Sheet for PR Youth.</li>
              <li>Go to <strong>Extensions &gt; Apps Script</strong>.</li>
              <li>Copy code from <code className="bg-white px-1 py-0.5 rounded border border-gray-200">google-apps-script/Code.gs</code> and <code className="bg-white px-1 py-0.5 rounded border border-gray-200">Setup.gs</code>.</li>
              <li>Run <code className="bg-white px-1 py-0.5 rounded border border-gray-200">setupPRYouthSheets()</code> once in Apps Script to create sheets.</li>
              <li>Click <strong>Deploy &gt; New deployment</strong>, select <strong>Web app</strong>, set <em>Who has access</em> to <strong>Anyone</strong>.</li>
              <li>Paste the Web App URL above!</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 justify-end pt-4 border-t border-[#e5e5ea]">
          <button onClick={handleClear} className="apple-pill-button-outlined text-xs py-2 px-3">
            Use Local Demo
          </button>
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="apple-pill-button-outlined text-xs py-2 px-4"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button onClick={handleSave} className="apple-pill-button-filled text-xs py-2 px-5">
            Save &amp; Apply
          </button>
        </div>
      </div>
    </div>
  );
}
