import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { langue, setLangue } = useLanguage();
  return (
    <select value={langue} onChange={(e) => setLangue(e.target.value)} className="erp-select-sm">
      <option value="fr">Français</option>
      <option value="en">English</option>
      <option value="ar">العربية</option>
    </select>
  );
}