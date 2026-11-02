import { useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Boxes, Braces, Check, Code2, ExternalLink, GitBranch, Github, Layers3, Menu, ShieldCheck, Sparkles, Terminal, Workflow, X } from 'lucide-react';

type Project = {
  number: string;
  name: string;
  category: string;
  description: string;
  details: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  url: string;
  note?: string;
  icon: 'workflow' | 'books' | 'board';
};

const projects: Project[] = [
  {
    number: '01', name: 'BenchFlow', category: 'Operations · Reliability',
    description: 'A repair workflow where permission, inventory, quality, and handoff stay accountable.',
    details: 'Permission-aware operations, atomic inventory reservations, idempotency, and traceable decisions.',
    tags: ['Python', 'SQLite', 'Workflow Design', 'Testing'],
    image: 'https://raw.githubusercontent.com/matthewfreeman821/benchflow/main/docs/images/repair-docket.png',
    imageAlt: 'BenchFlow fictional repair docket interface',
    url: 'https://github.com/matthewfreeman821/benchflow', icon: 'workflow'
  },
  {
    number: '02', name: 'Shelf Sense', category: 'Local-first · Data Ownership',
    description: 'A personal library that keeps books, notes, and backups on the user’s own computer.',
    details: 'SQLite persistence, assisted barcode/OCR entry, import/export, and deliberate recovery.',
    tags: ['Python', 'SQLite', 'OCR', 'Local-first'],
    image: 'https://raw.githubusercontent.com/matthewfreeman821/shelf-sense/main/docs/screenshots/library-desktop.png',
    imageAlt: 'Shelf Sense fictional desktop library interface',
    url: 'https://github.com/matthewfreeman821/shelf-sense', icon: 'books'
  },
  {
    number: '03', name: "Author’s Board", category: 'Creative Tools · In development',
    description: 'A visual workspace for fiction writers to connect characters, places, and events.',
    details: 'Spatial references, relationships, and clear separation between story canon and calculated information.',
    tags: ['Python', 'SQLite', 'JavaScript', 'In development'],
    url: 'https://github.com/matthewfreeman821/authors-board',
    note: 'Public overview available. Source and product screenshots are being prepared for release.', icon: 'board'
  }
];

const skills = [
  { heading: '01 / Interface', icon: <Layers3 size={21}/>, items: 'React · TypeScript · JavaScript · Accessible UI' },
  { heading: '02 / Services', icon: <Braces size={21}/>, items: 'Java · Spring Boot · REST APIs · SQL' },
  { heading: '03 / Systems', icon: <Boxes size={21}/>, items: 'AWS · Redis · Docker · CI/CD · Authentication' },
  { heading: '04 / AI workflow', icon: <Sparkles size={21}/>, items: 'Code agents · Review · Test design · Validation' },
];

const aiSteps = [
  { title: 'Frame the problem', sub: 'Scope, constraints and acceptance criteria' },
  { title: 'Explore solutions', sub: 'Architecture, alternatives and tradeoffs' },
  { title: 'Build with agents', sub: 'Accelerate implementation with context' },
  { title: 'Validate the result', sub: 'Review, test and verify behavior' },
];

function IconFor({ name }: { name: Project['icon'] }) {
  if (name === 'books') return <BookOpen size={33} strokeWidth={1.4} />;
  if (name === 'board') return <GitBranch size={33} strokeWidth={1.4} />;
  return <Workflow size={33} strokeWidth={1.4} />;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyProfile = async () => {
    try {
      await navigator.clipboard.writeText('https://github.com/matthewfreeman821');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = 'https://github.com/matthewfreeman821';
    }
  };
  return <>
    <div className="site-glow" aria-hidden="true" />
    <header className="header shell">
      <a className="brand" href="#home" aria-label="Matthew Freeman, back to top"><span className="brand-mark">MF<span>.</span></span><span className="brand-label">ENGINEERING / 2026</span></a>
      <button className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23}/> : <Menu size={23}/>}</button>
      <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Primary navigation">
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        <a href="#work" onClick={() => setMenuOpen(false)}>Selected work</a>
        <a href="#process" onClick={() => setMenuOpen(false)}>AI engineering</a>
        <a className="nav-contact" href="https://github.com/matthewfreeman821" target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={15}/></a>
      </nav>
    </header>

    <main>
      <section id="home" className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse"/> SENIOR SOFTWARE ENGINEER <span className="tiny-slash">/</span> FULL-STACK</div>
          <h1>Engineering the<br/><span>next iteration.</span></h1>
          <p>I'm <strong>Matthew Freeman.</strong> I build thoughtful software across interfaces, services, and systems—using AI deliberately, and engineering judgment throughout.</p>
          <div className="hero-actions"><a className="primary-button" href="#work">Explore my work <ArrowDownRight size={19}/></a><a className="text-button" href="https://github.com/matthewfreeman821" target="_blank" rel="noopener noreferrer"><Github size={20}/> GitHub profile <ArrowUpRight size={16}/></a></div>
          <div className="hero-small"><span>REACT / TYPESCRIPT</span><span>JAVA / SPRING BOOT</span><span>AWS / AI WORKFLOWS</span></div>
        </div>
        <div className="hero-visual" aria-label="Abstract system diagram illustration">
          <div className="visual-top"><span>ENGINEERING SYSTEMS</span><span className="live-dot">LIVE CONCEPT</span></div>
          <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
          <div className="visual-core"><Code2 size={42}/><span>BUILD</span></div>
          <div className="node node-a"><Terminal size={15}/> INTERFACE</div>
          <div className="node node-b"><ShieldCheck size={15}/> SERVICES</div>
          <div className="node node-c"><Sparkles size={15}/> AI ASSIST</div>
          <div className="node node-d"><GitBranch size={15}/> VALIDATE</div>
          <div className="visual-bottom"><span>DESIGN → IMPLEMENT → VERIFY</span><span>SYS.01</span></div>
        </div>
      </section>

      <section id="about" className="about shell section-space">
        <div className="section-heading"><span className="section-index">01 / ABOUT</span><h2>Beyond the <em>code.</em></h2></div>
        <div className="about-grid">
          <div className="about-statement"><p>Good engineering isn't just about writing code. It's about making the right decisions, understanding the tradeoffs, and knowing what to validate.</p><span className="micro-label">HOW I APPROACH THE WORK <ArrowRight size={15}/></span></div>
          <div className="about-detail"><p>My background spans React frontend leadership, Java/Spring Boot services, authentication, API integrations, and cloud architecture. I use AI-assisted tooling to move faster while retaining accountability for the outcome.</p><div className="metric"><strong>Full-stack</strong><span>From interface behavior to backend services and operational concerns</span></div><div className="metric"><strong>Engineering judgment</strong><span>Architecture, critical review, testing, and clear constraints</span></div></div>
        </div>
        <div className="skills-grid">{skills.map(skill => <div className="skill-card" key={skill.heading}><span className="skill-icon">{skill.icon}</span><h3>{skill.heading}</h3><p>{skill.items}</p></div>)}</div>
      </section>

      <section id="work" className="work-section section-space"><div className="shell"><div className="section-heading"><span className="section-index">02 / SELECTED WORK</span><h2>Things built with <em>intent.</em></h2><p className="section-intro">Three products, three different sets of constraints. Real engineering decisions, not placeholder demos.</p></div><div className="project-grid">
        {projects.map((project, index) => <article className={`project-card project-${index + 1}`} key={project.number}>
          <div className="project-image">
            {project.image ? <img src={project.image} alt={project.imageAlt} loading="lazy"/> : <div className="project-abstract"><div className="abstract-connector"/><IconFor name={project.icon}/><span>PROJECT IN DEVELOPMENT</span></div>}
            <span className="project-number">PROJECT / {project.number}</span>
          </div>
          <div className="project-body"><div className="project-category">{project.category}</div><div className="project-title-row"><h3>{project.name}</h3><a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Explore ${project.name} on GitHub`} className="circle-link"><ArrowUpRight size={23}/></a></div><p className="project-description">{project.description}</p><p className="project-details">{project.details}</p><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{project.note && <p className="project-note">{project.note}</p>}</div>
        </article>)}
      </div></div></section>

      <section id="process" className="ai-section shell section-space"><div className="section-heading"><span className="section-index">03 / AI × ENGINEERING</span><h2>AI is in the <em>workflow.</em><br/>Judgment is in the <em>driver's seat.</em></h2></div><div className="ai-grid"><div className="ai-copy"><div className="ai-symbol"><Sparkles size={32}/></div><p>I don't hide AI use. I use coding agents to explore, build, review, and test—but I don't outsource the responsibility to understand what the software does.</p><div className="ai-quote">“AI can accelerate the work. Engineering judgment determines its quality.”</div></div><div className="process-list">{aiSteps.map((step, i) => <div className="process-step" key={step.title}><span className="process-n">0{i+1}</span><div><h3>{step.title}</h3><p>{step.sub}</p></div><Check size={17}/></div>)}</div></div></section>

      <section className="cta-section shell section-space"><div className="cta-box"><div className="cta-top">LET'S BUILD SOMETHING USEFUL <ArrowUpRight size={18}/></div><h2>Complex systems.<br/><span>Clear thinking.</span></h2><p>Explore the code, architecture, and decisions behind my work.</p><div className="cta-actions"><a className="primary-button" href="https://github.com/matthewfreeman821" target="_blank" rel="noopener noreferrer"><Github size={19}/> Explore GitHub <ArrowUpRight size={18}/></a><button className="secondary-button" onClick={copyProfile}>{copied ? <Check size={18}/> : <ExternalLink size={18}/>} {copied ? 'Link copied' : 'Copy profile link'}</button></div></div></section>
    </main>
    <footer className="footer shell"><div><strong>MF<span>.</span></strong><span>© {new Date().getFullYear()} Matthew Freeman</span></div><div><span>ENGINEERED WITH INTENT</span><a href="#home">Back to top ↑</a></div></footer>
  </>;
}
