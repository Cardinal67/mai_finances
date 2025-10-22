import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const ThemeBuilder = () => {
  const { theme, updateTheme, selectPreset, resetTheme, exportTheme, presets } = useTheme();
  const { success, error } = useToast();
  const [themeName, setThemeName] = useState(theme.name);
  const [colors, setColors] = useState(theme.colors);
  const [saving, setSaving] = useState(false);

  // Sync local state when global theme changes
  useEffect(() => {
    setThemeName(theme.name);
    setColors(theme.colors);
  }, [theme]);

  const handleColorChange = (colorKey, value) => {
    setColors({ ...colors, [colorKey]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTheme({
        name: themeName,
        colors: colors
      });
      success('Theme saved successfully!');
    } catch (err) {
      console.error('Failed to save theme:', err);
      error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handlePresetSelect = (presetName) => {
    selectPreset(presetName);
    setThemeName(presetName.charAt(0).toUpperCase() + presetName.slice(1));
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (!imported.colors) {
            error('Invalid theme file - missing colors');
            return;
          }
          await updateTheme({
            name: imported.name || 'Imported Theme',
            colors: imported.colors
          });
          success('Theme imported successfully!');
        } catch (err) {
          console.error('Failed to import theme:', err);
          error('Invalid theme file');
        }
      };
      reader.readAsText(file);
    }
  };

  const colorFields = [
    { key: 'primary', label: 'Primary Color', description: 'Main brand color (buttons, links)' },
    { key: 'secondary', label: 'Secondary Color', description: 'Accent color' },
    { key: 'background', label: 'Background Color', description: 'Page background' },
    { key: 'card', label: 'Card Background', description: 'Card and panel backgrounds' },
    { key: 'textPrimary', label: 'Primary Text', description: 'Main text color' },
    { key: 'textSecondary', label: 'Secondary Text', description: 'Muted text color' },
    { key: 'success', label: 'Success Color', description: 'Success messages and indicators' },
    { key: 'warning', label: 'Warning Color', description: 'Warning messages' },
    { key: 'error', label: 'Error Color', description: 'Error messages and alerts' },
    { key: 'border', label: 'Border Color', description: 'Borders and dividers' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🎨 Custom Theme Builder</h2>
        <p className="text-sm text-gray-600">Customize the look and feel of Mai Finances to match your style.</p>
      </div>

      {/* Preset Themes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-primary-500 transition-colors capitalize"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Theme Name</label>
        <input
          type="text"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="My Custom Theme"
        />
      </div>

      {/* Color Pickers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {colorFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                {field.label}
              </label>
              <p className="text-xs text-gray-500">{field.description}</p>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={colors[field.key]}
                  onChange={(e) => handleColorChange(field.key, e.target.value)}
                  className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colors[field.key]}
                  onChange={(e) => handleColorChange(field.key, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <button
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
              className="px-4 py-2 rounded-md font-medium"
            >
              Primary Button
            </button>
            <button
              style={{ backgroundColor: colors.secondary, color: '#ffffff' }}
              className="px-4 py-2 rounded-md font-medium"
            >
              Secondary Button
            </button>
          </div>
          <div
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            className="border rounded-lg p-4"
          >
            <h4 style={{ color: colors.textPrimary }} className="font-semibold mb-2">
              Sample Card
            </h4>
            <p style={{ color: colors.textSecondary }} className="text-sm">
              This is how your cards will look with the selected colors.
            </p>
          </div>
          <div className="flex space-x-3">
            <div
              style={{ backgroundColor: colors.success, color: '#ffffff' }}
              className="px-3 py-1 rounded-full text-sm"
            >
              Success
            </div>
            <div
              style={{ backgroundColor: colors.warning, color: '#ffffff' }}
              className="px-3 py-1 rounded-full text-sm"
            >
              Warning
            </div>
            <div
              style={{ backgroundColor: colors.error, color: '#ffffff' }}
              className="px-3 py-1 rounded-full text-sm"
            >
              Error
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
        >
          {saving ? 'Saving...' : 'Save Theme'}
        </button>
        <button
          onClick={exportTheme}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
        >
          📥 Export Theme
        </button>
        <label className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium cursor-pointer inline-block">
          📤 Import Theme
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
        <button
          onClick={resetTheme}
          className="px-6 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 font-medium"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default ThemeBuilder;

