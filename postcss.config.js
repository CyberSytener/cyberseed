// postcss.config.js (ES Module Format)
import tailwindcss from '@tailwindcss/postcss'; 
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss, // или '@tailwindcss/postcss'
    autoprefixer,
    // ... другие плагины
  ],
};