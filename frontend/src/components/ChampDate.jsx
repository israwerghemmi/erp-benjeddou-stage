export default function ChampDate({ label, value, onChange, name, required = false, min, max }) {
    const handleChange = (e) => {
      onChange({ target: { name, value: e.target.value } });
    };
  
    return (
      <div className="erp-form-group">
        {label && <label className="erp-form-label">{label}</label>}
        <input
          type="date"
          name={name}
          value={value || ''}
          onChange={handleChange}
          className="erp-input"
          required={required}
          min={min}
          max={max}
        />
      </div>
    );
  }