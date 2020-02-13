import React, { useState, useEffect} from 'react';

const Icon = ({ component: Component, size, color, hoverColor }) => {
  const [iconColor, setIconColor] = useState(null);

  useEffect(() => {
    setIconColor(color);
  }, [color]);

  function handleMouseOver() {
    if(hoverColor) {
      setIconColor(hoverColor);
    }
  }

  function handleMouseLeave() {
    if(hoverColor) {
      setIconColor(color);
    }
  }

  return (
    <Component 
      size={size} 
      color={iconColor}
      onFocus={handleMouseOver}
      onBlur={handleMouseLeave}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default Icon;
