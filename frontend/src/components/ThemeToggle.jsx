import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, basculerTheme } = useTheme();
  return (
    <button onClick={basculerTheme} className="erp-icon-btn" aria-label="Changer de thème">
      {theme === 'clair' ? '🌙' : '☀️'}
    </button>
  );
}
