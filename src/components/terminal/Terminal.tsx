import { useState, useRef, useEffect } from 'react';

const COMMANDS: Record<string, string> = {
  help: `Comandos disponibles:
  whoami      - Quien soy
  experience  - Experiencia laboral
  projects    - Proyectos
  skills      - Tech stack
  contact     - Contacto
  clear       - Limpiar terminal
  sudo hire-me - ???`,

  whoami: `
  Enrique Ríos Santos
  Senior Tech Engineer -> AI Engineer

  10+ years building software across banking,
  SaaS & public administration.
  Now diving deep into AI engineering.

  Location: Fuengirola, Malaga, Spain`,

  experience: `
  [2024-Present] Senior Tech Engineer
                 Allfunds Bank (via Innusual)
                 Java, Sybase, PL/SQL

  [2021-2024]   Senior Developer
                 Tenant Evaluation
                 Java, Spring Boot, AWS, K8s, Angular

  [2015-2021]   Mobile/Backend Developer
                 Grupo AL
                 Java Spring, Android, Cordova

  [2014-2015]   ABAP Developer (Intern)
                 CEMOSA
                 SAP, ABAP IV`,

  exp: '', // alias, handled below

  projects: `
  * TravelMap    - SvelteKit + NestJS + PostGIS
                   github.com/EnriqueRS/travelmap

  * RunApp       - Next.js + PostgreSQL
                   github.com/EnriqueRS/runapp

  * AntimoleBot  - Hono + Cloudflare Workers
                   github.com/EnriqueRS/antimolebot

  -> github.com/EnriqueRS (30+ repos)`,

  'ls projects': '', // alias

  skills: `
  Core Stack:
    Java, Spring Boot, Python, TypeScript,
    Node.js, React, Docker, Kubernetes,
    AWS, REST APIs, MySQL, PostgreSQL

  AI / ML Stack:
    LLM Integration, AI Agents, RAG,
    Prompt Engineering, LangChain,
    HuggingFace, MLOps, Vector DB`,

  stack: '', // alias

  contact: `
  GitHub:   github.com/EnriqueRS
  LinkedIn: linkedin.com/in/enrique-rios-santos-906666b
  Email:    enriquers85@gmail.com`,

  'sudo hire-me': `
  [sudo] password for recruiter: ********
  Permission granted.
  Sending CV to your inbox...
  Done. Let's build something great together.`,

  'cat /etc/motivation': `
  while (alive) {
    eat();
    sleep();
    code();
    repeat();
  }
  // Also: run, travel, and fight garden moles.`,
};

COMMANDS.exp = COMMANDS.experience;
COMMANDS['ls projects'] = COMMANDS.projects;
COMMANDS.stack = COMMANDS.skills;

interface Line {
  type: 'input' | 'output' | 'system';
  text: string;
}

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Welcome message
  useEffect(() => {
    const welcome = [
      { type: 'system' as const, text: '  Welcome to erios-terminal v1.0.0' },
      { type: 'system' as const, text: '  Type "help" for available commands.' },
      { type: 'system' as const, text: '' },
    ];
    setLines(welcome);
  }, []);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    const newLines: Line[] = [...lines, { type: 'input', text: `$ ${input}` }];

    if (cmd === 'clear') {
      setLines([]);
      setInput('');
      return;
    }

    if (cmd === '') {
      setLines(newLines);
      setInput('');
      return;
    }

    const response = COMMANDS[cmd];
    if (response !== undefined) {
      newLines.push({ type: 'output', text: response });
    } else {
      newLines.push({ type: 'output', text: `  command not found: ${cmd}` });
    }

    setLines(newLines);
    setInput('');
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '750px',
        height: '70vh',
        maxHeight: '550px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(5, 10, 5, 0.88)',
        border: '1px solid rgba(0, 255, 136, 0.15)',
        backdropFilter: 'blur(12px)',
        fontFamily: "'Geist Mono', monospace",
        fontSize: '13px',
        color: '#00ff88',
        overflow: 'hidden',
        boxShadow: '0 0 60px rgba(0, 255, 136, 0.05), inset 0 0 60px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Title bar */}
      <div style={{
        padding: '0.6rem 1rem',
        borderBottom: '1px solid rgba(0, 255, 136, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '11px',
        color: 'rgba(0, 255, 136, 0.5)',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88' }} />
        <span>erios@portfolio:~</span>
      </div>

      {/* Output */}
      <div ref={outputRef} style={{
        flex: 1,
        overflow: 'auto',
        padding: '1rem',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            color: line.type === 'input' ? '#00ff88' : line.type === 'system' ? 'rgba(0, 255, 136, 0.6)' : '#b0ffb0',
            opacity: line.type === 'system' ? 0.7 : 1,
          }}>
            {line.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        padding: '0.8rem 1rem',
        borderTop: '1px solid rgba(0, 255, 136, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{ color: '#00ff88' }}>$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#00ff88',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            caretColor: showCursor ? '#00ff88' : 'transparent',
          }}
        />
      </form>

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        zIndex: 20,
      }} />
    </div>
  );
}
