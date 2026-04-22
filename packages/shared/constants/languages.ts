export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', ext: ['.js', '.mjs', '.cjs'] },
  { id: 'typescript', label: 'TypeScript', ext: ['.ts', '.tsx'] },
  { id: 'python', label: 'Python', ext: ['.py', '.pyw'] },
  { id: 'rust', label: 'Rust', ext: ['.rs'] },
  { id: 'go', label: 'Go', ext: ['.go'] },
  { id: 'cpp', label: 'C++', ext: ['.cpp', '.cc', '.cxx', '.h', '.hpp'] },
  { id: 'c', label: 'C', ext: ['.c'] },
  { id: 'java', label: 'Java', ext: ['.java'] },
  { id: 'kotlin', label: 'Kotlin', ext: ['.kt', '.kts'] },
  { id: 'swift', label: 'Swift', ext: ['.swift'] },
  { id: 'ruby', label: 'Ruby', ext: ['.rb'] },
  { id: 'php', label: 'PHP', ext: ['.php'] },
  { id: 'csharp', label: 'C#', ext: ['.cs'] },
  { id: 'haskell', label: 'Haskell', ext: ['.hs', '.lhs'] },
  { id: 'elixir', label: 'Elixir', ext: ['.ex', '.exs'] },
  { id: 'solidity', label: 'Solidity', ext: ['.sol'] },
  { id: 'sql', label: 'SQL', ext: ['.sql'] },
  { id: 'bash', label: 'Bash', ext: ['.sh', '.bash'] },
  { id: 'zig', label: 'Zig', ext: ['.zig'] },
  { id: 'lua', label: 'Lua', ext: ['.lua'] },
  { id: 'scala', label: 'Scala', ext: ['.scala'] },
  { id: 'r', label: 'R', ext: ['.r', '.R'] },
  { id: 'dart', label: 'Dart', ext: ['.dart'] },
  { id: 'assembly', label: 'Assembly', ext: ['.asm', '.s'] },
  { id: 'brainfuck', label: 'Brainfuck', ext: ['.bf'] },
  { id: 'cobol', label: 'COBOL', ext: ['.cob', '.cbl'] },
] as const;

export type LanguageId = (typeof SUPPORTED_LANGUAGES)[number]['id'];

export const CODE_FILE_EXTENSIONS = SUPPORTED_LANGUAGES.flatMap((l) => l.ext);

export const DEMO_SLUGS = [
  'fibonacci-recursion',
  'quicksort-race',
  'async-promise-chain',
  'dijkstra-shortest-path',
  'linked-list-cpp',
] as const;

export type DemoSlug = (typeof DEMO_SLUGS)[number];

export const STEP_TYPE_COLORS: Record<string, string> = {
  variable_declaration: '#60A5FA',
  variable_assignment: '#60A5FA',
  function_call: '#A78BFA',
  function_return: '#F472B6',
  loop_start: '#34D399',
  loop_iteration: '#34D399',
  loop_end: '#34D399',
  conditional: '#FBBF24',
  array_operation: '#FB923C',
  object_mutation: '#E879F9',
  class_instantiation: '#C084FC',
  recursion: '#F43F5E',
  async_await: '#2DD4BF',
  io_operation: '#38BDF8',
  error: '#FF2D55',
  comment_or_noop: '#5A5F75',
};
