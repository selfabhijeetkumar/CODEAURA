export declare const SUPPORTED_LANGUAGES: readonly [{
    readonly id: "javascript";
    readonly label: "JavaScript";
    readonly ext: readonly [".js", ".mjs", ".cjs"];
}, {
    readonly id: "typescript";
    readonly label: "TypeScript";
    readonly ext: readonly [".ts", ".tsx"];
}, {
    readonly id: "python";
    readonly label: "Python";
    readonly ext: readonly [".py", ".pyw"];
}, {
    readonly id: "rust";
    readonly label: "Rust";
    readonly ext: readonly [".rs"];
}, {
    readonly id: "go";
    readonly label: "Go";
    readonly ext: readonly [".go"];
}, {
    readonly id: "cpp";
    readonly label: "C++";
    readonly ext: readonly [".cpp", ".cc", ".cxx", ".h", ".hpp"];
}, {
    readonly id: "c";
    readonly label: "C";
    readonly ext: readonly [".c"];
}, {
    readonly id: "java";
    readonly label: "Java";
    readonly ext: readonly [".java"];
}, {
    readonly id: "kotlin";
    readonly label: "Kotlin";
    readonly ext: readonly [".kt", ".kts"];
}, {
    readonly id: "swift";
    readonly label: "Swift";
    readonly ext: readonly [".swift"];
}, {
    readonly id: "ruby";
    readonly label: "Ruby";
    readonly ext: readonly [".rb"];
}, {
    readonly id: "php";
    readonly label: "PHP";
    readonly ext: readonly [".php"];
}, {
    readonly id: "csharp";
    readonly label: "C#";
    readonly ext: readonly [".cs"];
}, {
    readonly id: "haskell";
    readonly label: "Haskell";
    readonly ext: readonly [".hs", ".lhs"];
}, {
    readonly id: "elixir";
    readonly label: "Elixir";
    readonly ext: readonly [".ex", ".exs"];
}, {
    readonly id: "solidity";
    readonly label: "Solidity";
    readonly ext: readonly [".sol"];
}, {
    readonly id: "sql";
    readonly label: "SQL";
    readonly ext: readonly [".sql"];
}, {
    readonly id: "bash";
    readonly label: "Bash";
    readonly ext: readonly [".sh", ".bash"];
}, {
    readonly id: "zig";
    readonly label: "Zig";
    readonly ext: readonly [".zig"];
}, {
    readonly id: "lua";
    readonly label: "Lua";
    readonly ext: readonly [".lua"];
}, {
    readonly id: "scala";
    readonly label: "Scala";
    readonly ext: readonly [".scala"];
}, {
    readonly id: "r";
    readonly label: "R";
    readonly ext: readonly [".r", ".R"];
}, {
    readonly id: "dart";
    readonly label: "Dart";
    readonly ext: readonly [".dart"];
}, {
    readonly id: "assembly";
    readonly label: "Assembly";
    readonly ext: readonly [".asm", ".s"];
}, {
    readonly id: "brainfuck";
    readonly label: "Brainfuck";
    readonly ext: readonly [".bf"];
}, {
    readonly id: "cobol";
    readonly label: "COBOL";
    readonly ext: readonly [".cob", ".cbl"];
}];
export type LanguageId = (typeof SUPPORTED_LANGUAGES)[number]['id'];
export declare const CODE_FILE_EXTENSIONS: (".js" | ".mjs" | ".cjs" | ".ts" | ".tsx" | ".py" | ".pyw" | ".rs" | ".go" | ".cpp" | ".cc" | ".cxx" | ".h" | ".hpp" | ".c" | ".java" | ".kt" | ".kts" | ".swift" | ".rb" | ".php" | ".cs" | ".hs" | ".lhs" | ".ex" | ".exs" | ".sol" | ".sql" | ".sh" | ".bash" | ".zig" | ".lua" | ".scala" | ".r" | ".R" | ".dart" | ".asm" | ".s" | ".bf" | ".cob" | ".cbl")[];
export declare const DEMO_SLUGS: readonly ["fibonacci-recursion", "quicksort-race", "async-promise-chain", "dijkstra-shortest-path", "linked-list-cpp"];
export type DemoSlug = (typeof DEMO_SLUGS)[number];
export declare const STEP_TYPE_COLORS: Record<string, string>;
//# sourceMappingURL=languages.d.ts.map