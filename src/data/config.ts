export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  category: 'System' | 'Frontend' | 'Language';
  featured: boolean;
}

export interface Technology {
  name: string;
  category: 'Core' | 'Languages' | 'Tools';
  proficiency: number; // 0-100
  description: string;
}

export interface PortfolioConfig {
  personal: {
    name: string;
    logo: string;
    role: string;
    location: string;
    experienceStartYear: number;
    github: string;
    currentStack: string[];
    interests: string[];
    favoriteLanguages: string[];
    bio: string;
    tagline: string;
    detailedBio: string;
  };
  technologies: Technology[];
  projects: Project[];
  meta: {
    title: string;
    description: string;
    siteUrl: string;
  };
}

export const portfolioConfig: PortfolioConfig = {
  personal: {
    name: "Matheus Henrique",
    logo: "λ",
    role: "Software Developer",
    location: "Brazil",
    experienceStartYear: 2017,
    github: "https://github.com/mxthevs",
    currentStack: ["React", "TypeScript"],
    interests: ["Functional Programming", "Full Stack Architecture", "Web Performance Optimization", "Distributed Systems", "UI Design"],
    favoriteLanguages: ["TypeScript", "Rust", "OCaml"],
    tagline: "Bridging the gap between rigorous systems and fluid user interfaces.",
    bio: "I build scalable interfaces, clean architectures, and high-performance experiences with a strong engineering mindset, combining the rigor of functional systems with expressive visual details.",
    detailedBio: "Since 2017, I've been engineering digital systems with a deep focus on developer experience, UI fidelity, and performance. I believe software engineering is a craft—one that demands the mathematical safety of compilers and the intuitive elegance of human-centric interfaces. Whether compiling syntax trees or optimizing rendering layers, my goal is always absolute precision."
  },
  technologies: [
    { name: "React", category: "Core", proficiency: 95, description: "Advanced component architecture, hooks, state machines, and fine-grained rendering optimization." },
    { name: "TypeScript", category: "Core", proficiency: 95, description: "Type-level programming, custom utility types, and strict static safety across full-stack applications." },
    { name: "Rust", category: "Languages", proficiency: 88, description: "Systems programming, concurrency, memory safety without garbage collection, and WebAssembly compilation." },
    { name: "OCaml", category: "Languages", proficiency: 80, description: "Functional paradigm, strong static algebraic types, compiler construction, and formal pattern matching." },
    { name: "Node.js", category: "Tools", proficiency: 90, description: "Backend infrastructure, event-driven microservices, high-throughput APIs, and custom tooling." },
    { name: "Tailwind", category: "Core", proficiency: 98, description: "Fluid and modular utility-first styling, precise custom design system mappings, and sub-pixel alignment." },
    { name: "Next.js", category: "Core", proficiency: 92, description: "Server components, streaming rendering architectures, ISR/SSR setups, and optimized assets." },
    { name: "Vite", category: "Tools", proficiency: 95, description: "Fast, modern bundler architectures, customized asset pipelines, and zero-config builds." },
    { name: "Three.js", category: "Core", proficiency: 85, description: "Custom 3D WebGL mathematical geometry rendering, particle physics systems, and custom shader development." },
    { name: "Git", category: "Tools", proficiency: 92, description: "Distributed version control, multi-developer rebase strategies, and customized hooks." },
    { name: "GitHub", category: "Tools", proficiency: 90, description: "CI/CD action automation pipelines, collaborative review architectures, and release management." }
  ],
  projects: [
    {
      id: "aether",
      title: "Aether Compiler",
      description: "A self-hosting compiler for an expressive, statically-typed functional language, compiled targeting WebAssembly and LLVM.",
      longDescription: "Aether is a custom-designed functional programming language featuring algebraic data types, type inference, and tail-call optimization. The compiler pipeline is entirely built in Rust and produces optimized, lightweight WebAssembly or native binaries.",
      technologies: ["Rust", "WebAssembly", "LLVM", "TypeScript"],
      githubUrl: "https://github.com/mxthevs/aether-compiler",
      category: "Language",
      featured: true
    },
    {
      id: "halcyon",
      title: "Halcyon VM",
      description: "A register-based virtual machine and high-performance bytecode interpreter built entirely in OCaml.",
      longDescription: "Halcyon is a zero-dependency, register-based execution engine that executes custom compiled functional bytecode. Built with OCaml to leverage high-performance pattern matching and algebraic safety, reaching speeds on par with industrial interpreters.",
      technologies: ["OCaml", "Compiler Design", "Dune"],
      githubUrl: "https://github.com/mxthevs/halcyon-vm",
      category: "System",
      featured: true
    },
    {
      id: "spectral",
      title: "Spectral Canvas",
      description: "A GPU-accelerated graphic and canvas vector engine built for real-time 60-FPS vector calculation and asset manipulation.",
      longDescription: "Spectral Canvas is a React-based spatial canvas interface backed by custom WebGL shaders. Designed to handle thousands of high-fidelity vector nodes smoothly by moving math and drawing computations off the CPU main thread onto the GPU.",
      technologies: ["React", "TypeScript", "Three.js", "WebGL"],
      githubUrl: "https://github.com/mxthevs/spectral-canvas",
      category: "Frontend",
      featured: true
    },
    {
      id: "vesper",
      title: "Vesper DB",
      description: "An embeddable, append-only key-value database engine in Rust featuring full ACID transactions.",
      longDescription: "Vesper is a lightweight storage engine focused on write performance and extreme database stability. It utilizes a log-structured merge-tree (LSM Tree) layout with a custom compaction filter, providing absolute safety via a write-ahead log.",
      technologies: ["Rust", "Storage Engines", "Concurrency"],
      githubUrl: "https://github.com/mxthevs/vesper-db",
      category: "System",
      featured: true
    }
  ],
  meta: {
    title: "Matheus Henrique | Software Developer",
    description: "Personal portfolio of Matheus Henrique. Software Developer specializing in React, TypeScript, Rust, and functional systems design.",
    siteUrl: "https://mxthevs.github.io"
  }
};
