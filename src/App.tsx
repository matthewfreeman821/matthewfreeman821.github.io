import { useState } from 'react';
import ReviewOps from './features/review-ops/ReviewOps';
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Boxes, Braces, Check, Code2, ExternalLink, GitBranch, Github, Layers3, Menu, ShieldCheck, Terminal, Workflow, X } from 'lucide-react';

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
  evidence?: { label: string; path: string }[];
  icon: 'workflow' | 'books' | 'board';
};

const projects: Project[] = [
  {
    number: '01', name: 'BenchFlow', category: 'Operations · Reliability',
    description: 'A repair workflow where permission, inventory, quality, and handoff stay accountable.',
    details: 'FastAPI → typed commands → SQLite transactions. Atomic reservations, revision checks, and idempotency keep retries and contention from silently corrupting work. A single Windows host is a deliberate operating limit.',
    evidence: [{label: 'Architecture & tradeoffs', path: 'ARCHITECTURE.md'}, {label: 'Concurrency & rollback tests', path: 'backend/tests/test_domains.py'}],
    tags: ['Python', 'SQLite', 'Workflow Design', 'Testing'],
    image: 'https://raw.githubusercontent.com/matthewfreeman821/benchflow/main/docs/images/repair-docket.png',
    imageAlt: 'BenchFlow fictional repair docket interface',
    url: 'https://github.com/matthewfreeman821/benchflow', icon: 'workflow'
  },
  {
    number: '02', name: 'Shelf Sense', category: 'Local-first · Data Ownership',
    description: 'A personal library that keeps books, notes, and backups on the user’s own computer.',
    details: 'Same-origin FastAPI and SQLite with local barcode decoding and optional Tesseract OCR. Recognition stays a suggestion until reviewed; CSV preview and full backup/restore protect user control. Loopback-only, with no multi-user identity model.',
    evidence: [{label: 'Architecture & boundaries', path: 'ARCHITECTURE.md'}, {label: 'Acceptance tests', path: 'tests/test_qa_acceptance.py'}, {label: 'Known limitations', path: 'LIMITATIONS.md'}],
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
  { heading: '03 / Systems', icon: <Boxes size={21}/>, items: 'PostgreSQL · Redis · Docker · CI/CD · Authentication' },
  { heading: '04 / AI operations', icon: <ShieldCheck size={21}/>, items: 'Copilot Enterprise · Agent orchestration · Review guardrails' },
];

const aiSteps = [
  { title: 'Establish the contract', sub: 'Acceptance criteria, codebase context, permissions, and non-negotiable constraints' },
  { title: 'Direct the work', sub: 'Use agents for implementation, investigation, testing, and bounded analysis' },
  { title: 'Challenge the output', sub: 'Compare independent reviews, investigate disagreements, reject unsupported findings' },
  { title: 'Own the release decision', sub: 'Validate against real behavior, trace evidence, and maintain engineering accountability' },
];

const engineeringCases = [
  {number: '01', track: 'PERFORMANCE / DELIVERED', title: 'Minutes to seconds with Redis',
    problem: 'An enterprise API workflow took more than five minutes to complete.',
    approach: 'Implemented Redis caching to reduce repeated work in the API workflow.',
    proof: 'Observed workflow duration improved to approximately three seconds. Owner-reported professional result; no public client benchmark or confidential implementation is included.'},
  {number: '02', track: 'INTEGRATIONS / DELIVERED', title: 'Payments, identity, and frontend ownership',
    problem: 'Enterprise application flows combine payment-provider behavior, account administration, and frontend reliability.',
    approach: 'Delivered PayPal and card-payment integrations, implemented administrative authentication and account management, and built frontend automated testing foundations.',
    proof: 'Professional delivery experience, alongside lead frontend/UI and React subject-matter responsibilities. Client source and internal evidence remain private.'},
  {number: '03', track: 'ARCHITECTURE / PROPOSAL', title: 'JWT validation at the API boundary',
    problem: 'Authentication at the gateway requires explicit trust boundaries and ownership of token validation.',
    approach: 'Designed an API Gateway/JWT-at-the-edge architectural proposal.',
    proof: 'Approved by the backend lead; broader review remains pending. This is a proposal, not a deployed architecture.'},
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
      <style>{`
        .eng-dossier{border-top:1px solid #2a3c4f}.dossier-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid #30465a}.dossier-case{padding:28px 25px;background:#101c2c;border-right:1px solid #30465a;min-width:0}.dossier-case:last-child{border-right:0}.dossier-head{display:flex;justify-content:space-between;gap:12px;color:#83d9f2;font:10px/1.5 'DM Mono',monospace;letter-spacing:.4px;border-bottom:1px solid #344d60;padding-bottom:18px}.dossier-case h3{font:600 27px/1.22 'Space Grotesk',sans-serif;letter-spacing:-.8px;min-height:100px}.dossier-block{border-top:1px solid #2a4052;padding:16px 0 5px}.dossier-block>span{color:#81def3;font:10px 'DM Mono',monospace;letter-spacing:1px}.dossier-block p{color:#b3c5d4;font-size:13px;line-height:1.75}.dossier-foot{display:flex;justify-content:space-between;gap:12px;color:#6d93a8;font:10px 'DM Mono',monospace;letter-spacing:.7px;padding-top:18px}.trajectory{border-top:1px solid #24384b}.trajectory-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid #405366}.trajectory-item{border-right:1px solid #405366;padding:25px 26px 16px 0;margin-right:25px}.trajectory-item:last-child{border-right:none;margin-right:0}.trajectory-item>span{display:block;font:10px 'DM Mono',monospace;letter-spacing:1px;color:#8cdef4;margin-bottom:23px}.trajectory-item strong{font:600 23px/1.3 'Space Grotesk',sans-serif}.trajectory-item p{font-size:13px;line-height:1.8;color:#9cb2c5}.circle-link{border-radius:0!important}.project-card:hover{transform:none!important}.orbit,.project-abstract:after{border-radius:0!important}.pulse{border-radius:0!important}
        @media(max-width:950px){.dossier-grid{grid-template-columns:1fr}.dossier-case{border-right:0;border-bottom:1px solid #30465a}.dossier-case:last-child{border:0}.dossier-case h3{min-height:0}.trajectory-grid{grid-template-columns:1fr}.trajectory-item{border-right:0;border-bottom:1px solid #405366;padding:22px 0;margin:0}}
        @media(max-width:680px){.dossier-foot{flex-direction:column}.eng-dossier{padding-top:72px}.dossier-case{padding:24px 18px}}
      `}</style>
    <div className="site-glow" aria-hidden="true" />
    <header className="header shell">
      <a className="brand" href="#home" aria-label="Matthew Freeman, back to top"><span className="brand-mark">MF<span>.</span></span><span className="brand-label">ENGINEERING / 2026</span></a>
      <button className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23}/> : <Menu size={23}/>}</button>
      <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Primary navigation">
        <a href="#about" onClick={() => setMenuOpen(false)}>Background</a>
        <a href="#engineering" onClick={() => setMenuOpen(false)}>Engineering</a>
        <a href="#work" onClick={() => setMenuOpen(false)}>Selected work</a>
        <a href="#process" onClick={() => setMenuOpen(false)}>AI operations</a>
        <a href="#review-ops" onClick={() => setMenuOpen(false)}>Review Ops</a>
        <a className="nav-contact" href="https://github.com/matthewfreeman821" target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={15}/></a>
      </nav>
    </header>

    <a className="skip-link" href="#main-content">Skip to content</a>
    <main id="main-content">
      <section id="home" className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse"/> SENIOR SOFTWARE ENGINEER <span className="tiny-slash">/</span> FULL-STACK</div>
          <h1>Systems.<br/><span>Decisions.</span><br/>Delivery.</h1>
          <p>I'm <strong>Matthew Freeman, Senior Software Engineer.</strong> I work across React and TypeScript interfaces, Java/Spring Boot services, and enterprise AI-assisted delivery. I care about boundaries, evidence, and what actually ships.</p>
          <div className="hero-actions"><a className="primary-button" href="#engineering">Explore engineering work <ArrowDownRight size={19}/></a><a className="text-button" href="https://github.com/matthewfreeman821" target="_blank" rel="noopener noreferrer"><Github size={20}/> GitHub profile <ArrowUpRight size={16}/></a></div>
          <p className="hero-proof">Redis caching: &gt;5 minutes → ~3 seconds in an enterprise API workflow. <a href="#engineering">Read the context</a></p><div className="hero-small"><span>ENTERPRISE ENGINEERING</span><span>REACT / TYPESCRIPT / JAVA</span><span>COPILOT SINCE 2023</span></div>
        </div>
        <div className="hero-visual" aria-label="Abstract system diagram illustration">
          <div className="visual-top"><span>ENGINEERING SYSTEMS</span><span className="live-dot">LIVE CONCEPT</span></div>
          <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
          <div className="visual-core"><Code2 size={42}/><span>BUILD</span></div>
          <div className="node node-a"><Terminal size={15}/> INTERFACE</div>
          <div className="node node-b"><ShieldCheck size={15}/> SERVICES</div>
          <div className="node node-c"><ShieldCheck size={15}/> AI OVERSIGHT</div>
          <div className="node node-d"><GitBranch size={15}/> VALIDATE</div>
          <div className="visual-bottom"><span>DESIGN → IMPLEMENT → VERIFY</span><span>SYS.01</span></div>
        </div>
      </section>

      <section id="about" className="about shell section-space">
        <div className="section-heading"><span className="section-index">01 / EXPERIENCE</span><h2>Built from <em>the ground up.</em></h2></div>
        <div className="about-grid">
          <div className="about-statement"><p>Senior Software Engineer at Cognizant Technology Solutions. I progressed from contractor to senior in approximately five years, including serving as a lead frontend/UI developer and React subject-matter expert.</p><span className="micro-label">FRONTEND LEADERSHIP / FULL-STACK DELIVERY <ArrowRight size={15}/></span></div>
          <div className="about-detail"><p>My enterprise work includes complex PayPal and card-payment integrations, administrative authentication and account management, frontend testing foundations, and backend cache-cleanup tooling. I pair frontend architecture with practical service and data-layer engineering.</p><div className="metric"><strong>5-year progression</strong><span>Contractor to Senior Software Engineer</span></div><div className="metric"><strong>Copilot since 2023</strong><span>Enterprise AI-assisted engineering, review, and validation</span></div></div>
        </div>
        <div className="skills-grid">{skills.map(skill => <div className="skill-card" key={skill.heading}><span className="skill-icon">{skill.icon}</span><h3>{skill.heading}</h3><p>{skill.items}</p></div>)}</div>
      </section>

      <section id="engineering" className="eng-dossier shell section-space">
        <div className="section-heading"><span className="section-index">02 / ENGINEERING DOSSIER</span><h2>The work behind <em>the decisions.</em></h2><p className="section-intro">Selected technical themes from enterprise engineering work, described at a high level to protect client systems. These are experience summaries, not public production code or fabricated performance claims.</p></div>
        <div className="dossier-grid">{engineeringCases.map(item => <article className="dossier-case" key={item.number}>
          <div className="dossier-head"><span>{item.number} / FIELD NOTES</span><span>{item.track}</span></div>
          <h3>{item.title}</h3>
          <div className="dossier-block"><span>ENGINEERING PROBLEM</span><p>{item.problem}</p></div>
          <div className="dossier-block"><span>TECHNICAL APPROACH</span><p>{item.approach}</p></div>
          <div className="dossier-block"><span>EVIDENCE &amp; VALIDATION</span><p>{item.proof}</p></div>
        </article>)}</div>
        <div className="dossier-foot"><span>PROFESSIONAL EXPERIENCE / SANITIZED</span><span>DELIVERED WORK / PROPOSALS EXPLICITLY DISTINGUISHED</span></div>
      </section>

      <section id="work" className="work-section section-space"><div className="shell"><div className="section-heading"><span className="section-index">03 / OPEN-SOURCE WORK</span><h2>Products with <em>constraints.</em></h2><p className="section-intro">Independent software projects built to explore ownership, reliability, local-first data, and pragmatic design. Separate from client work.</p></div><div className="project-grid">
        {projects.map((project, index) => <article className={`project-card project-${index + 1}`} key={project.number}>
          <div className="project-image">
            {project.image ? <img src={project.image} alt={project.imageAlt} loading="lazy"/> : <div className="project-abstract"><div className="abstract-connector"/><IconFor name={project.icon}/><span>PROJECT IN DEVELOPMENT</span></div>}
            <span className="project-number">PROJECT / {project.number}</span>
          </div>
          <div className="project-body"><div className="project-category">{project.category}</div><div className="project-title-row"><h3>{project.name}</h3><a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Explore ${project.name} on GitHub`} className="circle-link"><ArrowUpRight size={23}/></a></div><p className="project-description">{project.description}</p><p className="project-details">{project.details}</p><div className="project-evidence">{project.evidence?.map(link => <a key={link.path} href={`${project.url}/blob/main/${link.path}`} target="_blank" rel="noopener noreferrer">{link.label}</a>)}</div><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{project.note && <p className="project-note">{project.note}</p>}</div>
        </article>)}
      </div></div></section>

      <section id="process" className="ai-section shell section-space"><div className="section-heading"><span className="section-index">04 / AI ENGINEERING OPERATIONS</span><h2>Direct the agents.<br/><em>Own the outcome.</em></h2></div><div className="ai-grid"><div className="ai-copy"><div className="ai-symbol"><ShieldCheck size={32}/></div><p>I have used GitHub Copilot in enterprise engineering since 2023. My approach treats AI as a set of tools with explicit scope: bounded tasks, codebase context, restricted actions, independent review, and verification before acceptance.</p><div className="ai-quote">Multiple agents can propose a solution. Engineering judgment decides whether the evidence supports it.</div></div><div className="process-list">{aiSteps.map((step, i) => <div className="process-step" key={step.title}><span className="process-n">0{i+1}</span><div><h3>{step.title}</h3><p>{step.sub}</p></div><Check size={17}/></div>)}</div></div></section>

      <section className="trajectory shell section-space" id="trajectory">
        <div className="section-heading"><span className="section-index">05 / CAREER TRAJECTORY</span><h2>Experience is <em>earned.</em></h2></div>
        <div className="trajectory-grid"><div className="trajectory-item"><span>EDUCATION</span><strong>Mathematics &amp; Quantitative Sciences</strong><p>B.S. with a 4.0 GPA. A foundation in analytical reasoning and precise problem solving.</p></div><div className="trajectory-item"><span>SERVICE</span><strong>Nine years of military service</strong><p>Including deployment to Iraq. Experience with responsibility, teamwork, and accountability.</p></div><div className="trajectory-item"><span>PROGRESSION</span><strong>Senior Software Engineer</strong><p>Advanced from contractor to senior in approximately five years; full-stack work and AI-enabled engineering practices.</p></div></div>
      </section>

      <ReviewOps />
      <section className="cta-section shell section-space"><div className="cta-box"><div className="cta-top">LET'S BUILD SOMETHING USEFUL <ArrowUpRight size={18}/></div><h2>Complex systems.<br/><span>Clear thinking.</span></h2><p>Explore the code, architecture, and decisions behind my work.</p><div className="cta-actions"><a className="primary-button" href="https://github.com/matthewfreeman821" target="_blank" rel="noopener noreferrer"><Github size={19}/> Explore GitHub <ArrowUpRight size={18}/></a><button className="secondary-button" onClick={copyProfile}>{copied ? <Check size={18}/> : <ExternalLink size={18}/>} {copied ? 'Link copied' : 'Copy profile link'}</button></div></div></section>
    </main>
    <footer className="footer shell"><div><strong>MF<span>.</span></strong><span>© {new Date().getFullYear()} Matthew Freeman</span></div><div><span>ENGINEERED WITH INTENT</span><a href="#home">Back to top ↑</a></div></footer>
  </>;
}
