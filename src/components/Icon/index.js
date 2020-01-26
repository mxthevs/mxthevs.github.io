import React from 'react';

const Icon = ({ component: Component, size, color }) => {
  return (
    <Component size={size} color={color}/>
  );
};

export default Icon;
