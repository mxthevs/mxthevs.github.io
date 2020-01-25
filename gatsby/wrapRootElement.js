import React from "react";
import { ThemeProvider } from 'styled-components';

import dark from '../src/styles/themes/dark';

export function wrapRootElement ({ element }) {
  return <ThemeProvider theme={dark}>{element}</ThemeProvider>
}