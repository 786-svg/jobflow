/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F0E6',
        paperdark: '#EBE4D2',
        ink: '#1C1814',
        ink2: '#3C342C',
        rule: '#1C181430',
        rulesoft: '#1C18141A',
        coral: '#C44A2C',
        coraldim: '#C44A2C20',
        leaf: '#3A6B3A',
        leafdim: '#3A6B3A18',
        amber: '#A6701E',
        amberdim: '#A6701E18',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        label: '0.16em',
      },
    },
  },
  plugins: [],
};
