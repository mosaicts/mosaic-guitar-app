import { useState } from 'react';
import './index.css';

const PasswordInput = ({ ...rest }) => {
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  return (
    <>
      <div className="password box">
        <input
          id="password-input"
          type={passwordVisibility ? 'text' : 'password'}
          required
          {...rest}
        />
        <button
          className="toggle visibility"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            setPasswordVisibility(!passwordVisibility);
          }}
        >
          <span className="material-symbols-outlined" id="visibility">
            {passwordVisibility ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </>
  );
};

export default PasswordInput;
