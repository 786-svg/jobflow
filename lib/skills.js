// lib/skills.js
// Curated skill taxonomy. Each entry: { name, aliases }.

export const SKILLS = {
  languages: [
    { name: 'javascript', aliases: ['js', 'ecmascript'] },
    { name: 'typescript', aliases: ['ts'] },
    { name: 'python', aliases: ['py'] },
    { name: 'java', aliases: [] },
    { name: 'kotlin', aliases: [] },
    { name: 'swift', aliases: [] },
    { name: 'go', aliases: ['golang'] },
    { name: 'rust', aliases: [] },
    { name: 'c++', aliases: ['cpp'] },
    { name: 'c#', aliases: ['csharp', '.net'] },
    { name: 'ruby', aliases: [] },
    { name: 'php', aliases: [] },
    { name: 'scala', aliases: [] },
    { name: 'sql', aliases: [] },
    { name: 'bash', aliases: ['shell'] },
    { name: 'html', aliases: [] },
    { name: 'css', aliases: [] },
  ],
  frontend: [
    { name: 'react', aliases: ['reactjs'] },
    { name: 'vue', aliases: ['vuejs'] },
    { name: 'angular', aliases: [] },
    { name: 'svelte', aliases: ['sveltekit'] },
    { name: 'next.js', aliases: ['nextjs'] },
    { name: 'nuxt', aliases: ['nuxtjs'] },
    { name: 'redux', aliases: [] },
    { name: 'tailwind', aliases: ['tailwindcss'] },
    { name: 'webpack', aliases: [] },
    { name: 'vite', aliases: [] },
  ],
  backend: [
    { name: 'node.js', aliases: ['nodejs', 'node'] },
    { name: 'express', aliases: [] },
    { name: 'django', aliases: [] },
    { name: 'flask', aliases: [] },
    { name: 'fastapi', aliases: [] },
    { name: 'rails', aliases: ['ruby on rails'] },
    { name: 'spring', aliases: ['spring boot'] },
    { name: 'graphql', aliases: [] },
    { name: 'rest', aliases: ['restful'] },
    { name: 'grpc', aliases: [] },
    { name: 'microservices', aliases: [] },
  ],
  data: [
    { name: 'postgres', aliases: ['postgresql'] },
    { name: 'mysql', aliases: [] },
    { name: 'mongodb', aliases: ['mongo'] },
    { name: 'redis', aliases: [] },
    { name: 'elasticsearch', aliases: ['elastic'] },
    { name: 'kafka', aliases: [] },
    { name: 'spark', aliases: [] },
    { name: 'airflow', aliases: [] },
    { name: 'dbt', aliases: [] },
    { name: 'snowflake', aliases: [] },
    { name: 'bigquery', aliases: [] },
    { name: 'databricks', aliases: [] },
    { name: 'pandas', aliases: [] },
    { name: 'numpy', aliases: [] },
  ],
  ml: [
    { name: 'pytorch', aliases: [] },
    { name: 'tensorflow', aliases: ['tf'] },
    { name: 'scikit-learn', aliases: ['sklearn'] },
    { name: 'huggingface', aliases: ['hugging face'] },
    { name: 'llm', aliases: ['large language model'] },
    { name: 'rag', aliases: ['retrieval augmented generation'] },
    { name: 'computer vision', aliases: [] },
    { name: 'nlp', aliases: [] },
    { name: 'mlops', aliases: [] },
  ],
  cloud: [
    { name: 'aws', aliases: ['amazon web services'] },
    { name: 'gcp', aliases: ['google cloud'] },
    { name: 'azure', aliases: [] },
    { name: 'kubernetes', aliases: ['k8s'] },
    { name: 'docker', aliases: [] },
    { name: 'terraform', aliases: [] },
    { name: 'ansible', aliases: [] },
    { name: 'ci/cd', aliases: ['cicd'] },
    { name: 'jenkins', aliases: [] },
    { name: 'github actions', aliases: [] },
    { name: 'lambda', aliases: [] },
  ],
  tools: [
    { name: 'git', aliases: [] },
    { name: 'jira', aliases: [] },
    { name: 'linux', aliases: [] },
    { name: 'datadog', aliases: [] },
    { name: 'prometheus', aliases: [] },
    { name: 'grafana', aliases: [] },
  ],
  mobile: [
    { name: 'ios', aliases: [] },
    { name: 'android', aliases: [] },
    { name: 'react native', aliases: [] },
    { name: 'flutter', aliases: [] },
    { name: 'swiftui', aliases: [] },
  ],
  soft: [
    { name: 'leadership', aliases: [] },
    { name: 'mentoring', aliases: [] },
    { name: 'agile', aliases: ['scrum'] },
    { name: 'stakeholder management', aliases: [] },
  ],
  domains: [
    { name: 'fintech', aliases: [] },
    { name: 'healthcare', aliases: [] },
    { name: 'e-commerce', aliases: ['ecommerce'] },
    { name: 'saas', aliases: [] },
    { name: 'cybersecurity', aliases: ['infosec'] },
  ],
};

let _index = null;
function buildIndex() {
  if (_index) return _index;
  const index = new Map();
  const categories = new Map();
  for (const [cat, entries] of Object.entries(SKILLS)) {
    for (const e of entries) {
      index.set(e.name, e.name);
      for (const a of e.aliases) index.set(a, e.name);
      categories.set(e.name, cat);
    }
  }
  _index = { index, categories };
  return _index;
}

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractSkills(text) {
  if (!text) return { skills: [], categories: {} };
  const { index, categories } = buildIndex();
  const lower = ' ' + String(text).toLowerCase().replace(/[^\w\s+#./-]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const found = new Set();
  for (const [alias, canonical] of index.entries()) {
    const pat = new RegExp(`(?<![\\w])${escapeReg(alias)}(?![\\w])`, 'i');
    if (pat.test(lower)) found.add(canonical);
  }
  const skills = [...found];
  const byCategory = {};
  for (const s of skills) {
    const c = categories.get(s) || 'other';
    (byCategory[c] = byCategory[c] || []).push(s);
  }
  return { skills, categories: byCategory };
}
