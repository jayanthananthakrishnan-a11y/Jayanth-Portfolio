/**
 * Dossier content model.
 *
 * A dossier is a drawer's worth of paper. It renders in two places from this
 * one source: the paged spread view (two pages at a time, page-turn nav) and
 * the Reading View (every page stacked and scrollable). Neither view knows
 * anything about the 3D room - see the ui/scene split note in the README.
 *
 * Pages are built from a small closed set of block types so the paper styling
 * lives in one place (ui/dossier/blocks.jsx) rather than in the content:
 *
 *   headline   - the name/title line that opens a record page
 *   fields     - label/value rows; a value may be `parts` for inline links;
 *                `columns: 2` lays short rows out side by side
 *   entry      - a dated role or project: title, org, meta, bullets; optional
 *                `links` (parts) sit level with the title, right-aligned
 *   chips      - a flat row of bordered tag chips
 *   chipGroups - labelled sections, each with its own row of chips
 *   listGroups - labelled sections of plain text lines
 *   image      - a framed image (src, alt, optional caption and maxHeight)
 *   table      - a ruled table: title, columns (key, label, align, wrap), rows
 *   text       - a single plain paragraph; `note: true` sets it as a
 *                smaller, lighter footnote
 *   contents   - an index of the dossier's own sheets, generated rather than
 *                written: one entry per `table` title, running on over the
 *                `continued` sheets after it; each entry turns to its sheet
 *
 * Any block may set `anchor: 'bottom'` to sit at the foot of its sheet, just
 * above the footer, with the free space above it rather than below.
 *
 * A page may set `compact: true` to tighten the spacing between its blocks,
 * for a sheet that would otherwise have to spill onto another one, or
 * `tight: true` to go a step further, inside the blocks as well. Neither
 * touches type size or leading. `fitSpacing: true` starts at normal spacing
 * and steps down to `compact`, then `tight`, only when the sheet would
 * otherwise scroll. `fitImages: true` lets its images size their
 * `maxHeight` in `cqh`, against the height the sheet has left in spread view.
 */

const LINKS = {
  linkedin: 'https://www.linkedin.com/in/prashanth-ananthakrishnan-469381284/',
  github: 'https://github.com/coolprash06',
}

/* -------------------------------------------------------------------------- */
/* PR-000 - My Resume                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Seven pages, not six.
 *
 * The brief sketched three spreads, which would have put both technical
 * projects - eight bullets between them - on a single left page. At the
 * line-height this archive reads at that page overflows badly. Splitting the
 * projects onto one page each costs a page and keeps every bullet intact,
 * which the brief preferred over compressing either project.
 *
 * Page 7 lands alone on the final spread; DossierView renders a closing plate
 * opposite it rather than a blank sheet.
 */
const MY_RESUME_PAGES = [
  {
    id: 'personnel-record',
    eyebrow: 'Sheet 01',
    title: 'Personnel Record',
    blocks: [
      { type: 'headline', text: 'Prashanth Ananthakrishnan' },
      {
        type: 'fields',
        items: [
          { label: 'Location', value: 'Dubai, UAE' },
          {
            label: 'Contact',
            parts: [
              { text: '+971509371705', href: 'tel:+971509371705' },
              {
                text: 'coolprash06@gmail.com',
                href: 'mailto:coolprash06@gmail.com',
              },
              { text: 'LinkedIn', href: LINKS.linkedin },
              { text: 'GitHub', href: LINKS.github },
            ],
          },
          {
            label: 'Education',
            value: 'BITS Pilani Dubai Campus',
            note: 'Bachelor of Engineering in Computer Science, 2024–2028',
          },
          { label: 'CGPA', value: '8.68 / 10.0' },
        ],
      },
    ],
  },
  {
    id: 'coursework',
    eyebrow: 'Sheet 02',
    title: 'Relevant Coursework',
    blocks: [
      {
        type: 'chips',
        items: [
          'Data Structures & Algorithms',
          'Database Systems',
          'Object Oriented Programming',
          'C Programming',
          'Operating Systems',
          'Theory of Computation',
          'Introduction to LLMs',
          'Logic in Computer Science',
          'Digital Design',
          'Microprocessors and Interfaces',
          'Principles of Programming Languages',
        ],
      },
    ],
  },
  {
    id: 'in-the-field',
    eyebrow: 'Sheet 03',
    title: 'In the Field',
    blocks: [
      {
        type: 'entry',
        title: 'AI & Innovation Intern',
        org: 'Exalogic Consulting',
        meta: 'June 2026 – July 2026',
        bullets: [
          'Developed a Company Analysis and Due Diligence Agent for the Sales Team',
          'Built a RAG pipeline covering chunking, embedding, and retrieval, using Qdrant to store and retrieve content by relevance',
          'Used SearXNG MCP, Fetch MCP, and Crawl4AI for web scraping',
        ],
      },
    ],
  },
  {
    id: 'the-toolkit',
    eyebrow: 'Sheet 04',
    title: 'The Toolkit',
    blocks: [
      {
        type: 'chipGroups',
        groups: [
          { label: 'Programming Languages', items: ['Java', 'C', 'Python'] },
          { label: 'Web Technologies', items: ['HTML', 'CSS', 'React.js'] },
          {
            label: 'Databases',
            items: ['SQL', 'Supabase', 'Qdrant (Vector Database)'],
          },
          {
            label: 'Tools',
            items: [
              'VS Code',
              'IntelliJ',
              'BlueJ',
              'Cursor',
              'Antigravity',
              'Replit',
              'Google AI Studio',
              'Codex',
              'Claude Code',
            ],
          },
          {
            label: 'AI/Agentic Tools',
            items: [
              'FastAPI',
              'MCP (SearXNG, Fetch)',
              'Crawl4AI',
              'Jina Embeddings',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'project-hackathon-hub',
    eyebrow: 'Sheet 05',
    title: 'Technical Projects',
    blocks: [
      {
        type: 'entry',
        title: 'BITS Hackathon Hub',
        org: 'Full-Stack Hackathon Management Platform',
        meta: 'React + Vite, Spring Boot, MySQL',
        bullets: [
          'Built a full-stack application for hackathon registration, team formation, mentor booking, and project evaluation',
          'Designed a normalized MySQL schema with 20+ tables, foreign keys, and many-to-many mapping tables',
          'Implemented triggers and stored procedures for core logic, including automatic team capacity checks, participant count sync, and evaluation scoring',
          'Built REST APIs in Spring Boot with JPA/Hibernate, connecting a React (Vite) frontend to reusable SQL views for leaderboards and dashboards',
        ],
      },
    ],
  },
  {
    id: 'project-campus-cafe',
    eyebrow: 'Sheet 06',
    title: 'Technical Projects',
    titleNote: 'continued',
    blocks: [
      {
        type: 'entry',
        title: 'Campus Cafe Ordering App',
        meta: 'Java, MySQL, JDBC',
        bullets: [
          'Developed a Java Swing desktop application for managing campus café operations',
          'Implemented role-based modules for students, administrators, and staff, supporting login/registration, canteen ordering, digital wallet payments, mess plan selection, order status updates, and catering request management',
          'Integrated a MySQL database using JDBC to manage students, menu items, orders, wallets, transactions, subscriptions, and catering requests',
          'Applied object-oriented programming principles to structure the system into modular components including database management, UI screens, orders, wallets, meal plans, and feedback handling',
        ],
      },
    ],
  },
  {
    id: 'achievements',
    eyebrow: 'Sheet 07',
    title: 'Achievements & Leadership',
    blocks: [
      {
        type: 'listGroups',
        groups: [
          {
            label: 'Hackathon wins',
            items: [
              '1st Place Winner, “What the Hack!” — ACM BITS Pilani, Dubai Chapter',
              'Winner Spotlight, “THINK AI ’25” — Microsoft Tech Club (MTC) & BITS Pilani Dubai',
              'Best Entry Winner — MTC x Oh Crop! Design Club (October 2025)',
            ],
          },
          {
            label: 'Leadership',
            items: [
              'GDGoC-BITS Dubai: Creative and Marketing Executive (2025)',
              'Linux Users Group BITS Dubai: Technical Executive (2026)',
            ],
          },
        ],
      },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/* PR-001 - Hackathons                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Built from the same blocks as the resume's project pages: an `entry` for
 * the name, subtitle and write-up, `fields` for the record rows, and the
 * links as a `fields` row of `parts`, the way the resume's contact row does
 * it.
 *
 * Cine404 runs to two sheets. A sheet never scrolls, so the record rows,
 * image and links continue on Sheet 02 under a "continued" heading, the same
 * way Technical Projects does in the resume.
 *
 * Love Toolkit is held to two sheets: the write-up and every record row on
 * Sheet 03, both prints and the links on Sheet 04. Both pages are `compact`
 * (tighter block spacing) and the short Dates / Team / Result rows share a
 * two-column grid, which is what lets that fit without cutting content.
 *
 * LegalVoice Bridge follows the Love Toolkit layout on Sheets 05 and 06:
 * write-up and record rows first, then the certificate and link.
 *
 * CodeImpact takes the same shape on Sheets 07 and 08, with no Result row
 * and no links. Its Team and Built with rows move to Sheet 08, as their own
 * two-column `fields` block under the certificate, so Sheet 07 does not
 * scroll. Any entry can do the same: a `fields` block renders the same on
 * either sheet, so rows move by moving the block.
 *
 * DebugMart follows Love Toolkit on Sheets 09 and 10, with no Result row:
 * write-up and record rows first, with the links carried on the `entry`
 * itself, level with the title; then the store print and certificate stacked.
 *
 * TriageAI follows Love Toolkit on Sheets 11 and 12, with no Brief, Result or
 * links: write-up and record rows first, then both prints stacked.
 *
 * The Hate Engine follows DebugMart on Sheets 13 and 14, with no Result or
 * Built with rows: write-up and record rows first, then the print and link.
 *
 * GovtTrack ERP follows LegalVoice Bridge on Sheets 15 and 16, with no Result
 * or links. Its print is a wide, short table, so it carries no `maxHeight`:
 * it is sized by width and its height follows the aspect ratio.
 *
 * NearbyNow follows Love Toolkit on Sheets 17 and 18, with no Result row:
 * write-up and record rows first, then both prints stacked and the links.
 *
 * Rush Hour follows NearbyNow on Sheets 19 and 20, with no Built with row:
 * the write-up, Brief, Dates and Result first, then the print with the
 * Organisers / Team rows and links under it. Sheet 20 is `fitImages`, so the
 * print gives way to the rows below it. At 1366×768 Sheet 19 still scrolls
 * slightly and the print shrinks to a thumbnail; that was accepted to keep
 * the entry to two sheets.
 */
/* What a `fitImages` sheet's block column (`cqh`) has left over the Rush Hour
   Organisers / Team rows and links: less those blocks and the `compact` gaps
   above them (15.375rem as measured), the frame's padding and hairline
   (1rem + 2px), and 1px so rounding can never tip it into a scrollbar. */
const RUSH_HOUR_PRINT = 'calc(100cqh - 16.375rem - 3px)'

const HACKATHONS_PAGES = [
  {
    id: 'cine404',
    eyebrow: 'Sheet 01',
    title: 'Design Competition · September 2025',
    blocks: [
      {
        type: 'entry',
        title: 'Cine404',
        org: '404: Creativity Not Found',
        bullets: [
          'Cine404 treats a missing page as corrupted film footage, putting the visitor in a control room to recover the lost scene.',
          'Built as a playful take on the 404 brief, it turns an error into something worth staying for.',
          'Named Best Entry by Microsoft Tech Club.',
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Brief',
            value:
              'Turn an ordinary 404 error page into something worth landing on.',
          },
        ],
      },
    ],
  },
  {
    id: 'cine404-continued',
    eyebrow: 'Sheet 02',
    title: 'Design Competition',
    titleNote: 'continued',
    blocks: [
      {
        type: 'fields',
        items: [
          {
            label: 'Organisers',
            value:
              'Microsoft Tech Club × Oh Crop!, BITS Pilani Dubai Campus',
          },
          {
            label: 'Team',
            value: 'Herobrine',
            note: 'Prashanth Ananthakrishnan & Chethan Devadiga',
          },
          { label: 'Result', value: 'Best Entry (Microsoft Tech Club)' },
        ],
      },
      {
        type: 'image',
        src: '/images/hackathons/cine404.png',
        alt: 'Cine404 error page',
        /* Keeps Sheet 02 on the page at a 935px-tall window. */
        maxHeight: '7rem',
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Links',
            parts: [
              { text: 'Live site', href: 'https://lnkd.in/dbCBacBV' },
              {
                text: 'LinkedIn post',
                href: 'https://www.linkedin.com/feed/update/urn:li:activity:7379168250133331968/',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'love-toolkit',
    eyebrow: 'Sheet 03',
    title: 'Hackathon · October 2025',
    compact: true,
    blocks: [
      {
        type: 'entry',
        title: 'Love Toolkit',
        org: 'What The Hack',
        bullets: ['Won 1st place at What The Hack.'],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Brief',
            value:
              'A hackathon for the worst ideas you can think of. The funniest, weirdest and most absurd entries win.',
          },
          {
            label: 'Organisers',
            value: 'ACM BITS Pilani Dubai Campus Student Chapter',
          },
        ],
      },
      {
        type: 'fields',
        columns: 2,
        items: [
          { label: 'Dates', value: '1–3 October 2025' },
          { label: 'Team', value: 'Solo' },
          { label: 'Result', value: '1st Place' },
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Built with',
            value: 'HTML, CSS, JavaScript · Deployed on Vercel',
          },
        ],
      },
    ],
  },
  {
    id: 'love-toolkit-continued',
    eyebrow: 'Sheet 04',
    title: 'Hackathon',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/hackathons/love-toolkit.png',
        alt: 'Love Toolkit web app',
        maxHeight: '11.5rem',
      },
      {
        type: 'image',
        src: '/images/hackathons/what-the-hack-mail.png',
        alt: 'Congratulations email from ACM BPDC for winning 1st place at What The Hack',
        maxHeight: '11.5rem',
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Links',
            parts: [
              {
                text: 'Live site',
                href: 'https://v0-love-toolkit-app-gamma.vercel.app/',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'legalvoice-bridge',
    eyebrow: 'Sheet 05',
    title: 'Hackathon · November 2025',
    compact: true,
    blocks: [
      {
        type: 'entry',
        title: 'LegalVoice Bridge',
        org: 'ThinkAI’25',
        bullets: [
          'Helps migrant families by using AI to turn complex visa rules and legal procedures into plain language, with Voice Time Capsules to keep families connected across distance.',
          'Won 2nd Prize at ThinkAI’25, out of 20+ teams.',
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Brief',
            value:
              'Identify a real-world problem and build an AI solution with meaningful impact.',
          },
        ],
      },
      {
        type: 'fields',
        columns: 2,
        items: [
          {
            label: 'Organisers',
            value: 'Microsoft Tech Club, BITS Pilani Dubai Campus',
          },
          { label: 'Dates', value: '17–18 November 2025' },
          { label: 'Team', value: 'Team Monster' },
          { label: 'Result', value: '2nd Prize' },
        ],
      },
    ],
  },
  {
    id: 'legalvoice-bridge-continued',
    eyebrow: 'Sheet 06',
    title: 'Hackathon',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/hackathons/thinkai-25-certificate.png',
        alt: 'Certificate of Achievement for winning Second Prize at ThinkAI’25',
        maxHeight: '16rem',
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Links',
            parts: [
              {
                text: 'LinkedIn post',
                href: 'https://www.linkedin.com/feed/update/urn:li:activity:7398322574134370304/',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'codeimpact',
    eyebrow: 'Sheet 07',
    title: 'Hackathon · January 2026',
    compact: true,
    blocks: [
      {
        type: 'entry',
        title: 'CodeImpact',
        org: 'The Bounty Challenge 2026',
        bullets: [
          'An IntelliJ plugin that shows developers the real impact of their code on performance, safety and architecture, right inside the IDE, before issues surface.',
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Brief',
            value:
              'JetBrains “Help the Developer” challenge: build an AI-powered, IDE-native tool that improves the developer experience.',
          },
          {
            label: 'Organisers',
            value: 'GDG University of Birmingham Dubai × JetBrains',
          },
        ],
      },
      {
        type: 'fields',
        columns: 2,
        items: [
          { label: 'Venue', value: 'University of Birmingham Dubai' },
          { label: 'Dates', value: '30 January – 1 February 2026' },
        ],
      },
    ],
  },
  {
    id: 'codeimpact-continued',
    eyebrow: 'Sheet 08',
    title: 'Hackathon',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/hackathons/bounty-challenge-2026-certificate.png',
        alt: 'Certificate of Participation for The Bounty Challenge 2026',
        maxHeight: '16rem',
      },
      {
        type: 'fields',
        columns: 2,
        items: [
          { label: 'Team', value: 'Team Alpha Arceus' },
          { label: 'Built with', value: 'Java · IntelliJ plugin' },
        ],
      },
    ],
  },
  {
    id: 'debugmart',
    eyebrow: 'Sheet 09',
    title: 'Challenge · March 2026',
    compact: true,
    tight: true,
    blocks: [
      {
        type: 'entry',
        title: 'DebugMart',
        org: 'Fix-It Forward',
        links: [
          { text: 'Live site', href: 'https://fix-it-forward-beta.vercel.app/' },
          { text: 'GitHub', href: 'https://github.com/coolprash06/DebugMart' },
        ],
        bullets: [
          'Rebuilt a deliberately broken, front-end-only e-commerce demo into a production-ready full-stack store, with Supabase Auth, a PostgreSQL order history, event analytics and a glassmorphism UI with dark/light mode.',
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Brief',
            value:
              'Take the “Broken, But Beautiful” e-commerce front-end and make it production-ready.',
          },
          {
            label: 'Organisers',
            value: 'ACM-W BITS Pilani Dubai Campus',
          },
        ],
      },
      {
        type: 'fields',
        columns: 2,
        items: [
          { label: 'Dates', value: '14–15 March 2026' },
          { label: 'Team', value: 'Solo' },
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Built with',
            value:
              'JavaScript, HTML, CSS · Supabase (Auth, PostgreSQL) · Vercel',
          },
        ],
      },
    ],
  },
  {
    id: 'debugmart-continued',
    eyebrow: 'Sheet 10',
    title: 'Challenge',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/hackathons/debugmart.png',
        alt: 'Fix-It Forward store homepage',
        maxHeight: '13rem',
      },
      {
        type: 'image',
        src: '/images/hackathons/fix-it-forward-certificate.png',
        alt: 'Certificate of Participation for the Fix-It-Forward challenge by ACM-W',
        maxHeight: '13rem',
      },
    ],
  },
  {
    id: 'triageai',
    eyebrow: 'Sheet 11',
    title: 'Hackathon · March 2026',
    compact: true,
    blocks: [
      {
        type: 'entry',
        title: 'TriageAI',
        org: 'Product Space Hackathon',
        bullets: [
          'An AI support-triage pipeline: Gemini 2.5 Flash labels every incoming ticket by urgency and sentiment, with its reasoning, before it reaches the database, and a real-time Neo-Brutalist admin dashboard shows the queue.',
        ],
      },
      {
        type: 'fields',
        items: [{ label: 'Organisers', value: 'Product Space' }],
      },
      {
        type: 'fields',
        columns: 2,
        items: [
          { label: 'Dates', value: '30 March 2026' },
          { label: 'Team', value: 'Prashanth Ananthakrishnan & Krish Anand' },
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Built with',
            value: 'React, Vite · Supabase · Google Gemini 2.5 Flash',
          },
        ],
      },
    ],
  },
  {
    id: 'triageai-continued',
    eyebrow: 'Sheet 12',
    title: 'Hackathon',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/hackathons/triageai-feedback.png',
        alt: 'TriageAI feedback form in dark mode',
        maxHeight: '11.5rem',
      },
      {
        type: 'image',
        src: '/images/hackathons/triageai-dashboard.png',
        alt: 'TriageAI admin dashboard',
        maxHeight: '11.5rem',
      },
    ],
  },
  {
    id: 'hate-engine',
    eyebrow: 'Sheet 13',
    title: 'Challenge · April 2026',
    compact: true,
    blocks: [
      {
        type: 'entry',
        title: 'The Hate Engine',
        org: 'IEEE BPDC Ugly Web Challenge 2026',
        bullets: [
          'A deliberately chaotic website full of annoying pop-ups, useless buttons and a terrible UI.',
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Brief',
            value: 'Create the most frustrating website possible.',
          },
          { label: 'Organisers', value: 'IEEE BPDC' },
        ],
      },
      {
        type: 'fields',
        columns: 2,
        items: [
          { label: 'Dates', value: 'April 2026' },
          { label: 'Team', value: 'Solo' },
        ],
      },
    ],
  },
  {
    id: 'hate-engine-continued',
    eyebrow: 'Sheet 14',
    title: 'Challenge',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/hackathons/hate-engine.png',
        alt: 'The Hate Engine landing page',
        maxHeight: '16rem',
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Links',
            parts: [
              {
                text: 'Live site',
                href: 'https://v0-worst-website-ever-ashen.vercel.app/',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'govttrack-erp',
    eyebrow: 'Sheet 15',
    title: 'Buildathon · April 2026',
    compact: true,
    blocks: [
      {
        type: 'entry',
        title: 'GovtTrack ERP',
        org: 'ACM × MTC Odoo Buildathon',
        bullets: [
          'An Odoo-based ERP that tracks public projects end to end, with delay detection, budget vs. spending, and citizen grievances linked directly into each project’s workflow.',
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Brief',
            value:
              'Public & Institutional ERP theme: improve transparency and accountability in governance systems.',
          },
        ],
      },
      {
        type: 'fields',
        columns: 2,
        items: [
          {
            label: 'Organisers',
            value: 'ACM BITS Pilani Dubai × Microsoft Tech Club',
          },
          { label: 'Dates', value: '8 April 2026' },
          { label: 'Team', value: 'Team Rocket' },
          { label: 'Built with', value: 'Odoo' },
        ],
      },
    ],
  },
  {
    id: 'govttrack-erp-continued',
    eyebrow: 'Sheet 16',
    title: 'Buildathon',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/hackathons/govttrack-erp.png',
        alt: 'GovtTrack ERP grievances list',
      },
    ],
  },
  {
    id: 'nearbynow',
    eyebrow: 'Sheet 17',
    title: 'Hackathon · September 2026',
    compact: true,
    blocks: [
      {
        type: 'entry',
        title: 'NearbyNow',
        org: 'ACM-W Vibe Coding Tournament',
        bullets: [
          'An offline-first app for discovering food, events, bars, parks and cafes around Dubai, with a live map, real distances from your location, saved spots, and a built-in arcade.',
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Brief',
            value:
              'A deliberately vague, contradictory “Broken Brief”: an app that works with no signal yet shows live updates from friends nearby. Interpret the gaps, then ship it.',
          },
        ],
      },
      {
        type: 'fields',
        columns: 2,
        items: [
          {
            label: 'Organisers',
            value: 'ACM-W BITS Pilani Dubai Campus',
          },
          { label: 'Dates', value: '9–10 September 2026' },
          { label: 'Team', value: 'Solo' },
          {
            label: 'Built with',
            value: 'React, Vite · Leaflet / OpenStreetMap · Vercel',
          },
        ],
      },
    ],
  },
  {
    id: 'nearbynow-continued',
    eyebrow: 'Sheet 18',
    title: 'Hackathon',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/hackathons/nearbynow.png',
        alt: 'NearbyNow app with map, search, arcade and results',
        maxHeight: '11.5rem',
      },
      {
        type: 'image',
        src: '/images/hackathons/broken-brief-certificate.png',
        alt: 'Certificate of Participation for the Broken Brief competition by ACM-W',
        maxHeight: '11.5rem',
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Links',
            parts: [
              {
                text: 'Live site',
                href: 'https://acm-w-broken-brief.vercel.app/',
              },
              {
                text: 'GitHub',
                href: 'https://github.com/coolprash06/ACM-W-Broken-Brief',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rush-hour',
    eyebrow: 'Sheet 19',
    title: 'MTC Mediathon · September 2026',
    fitSpacing: true,
    blocks: [
      {
        type: 'entry',
        title: 'Rush Hour',
        org: 'Mediathon 3.0',
        bullets: [
          'The team photographed campus rush moments and built the website as a CCTV security room: a dark monitoring room where three CRT screens play Morning, Afternoon and Peak Rush slideshows, and two filing cabinets hold photo drawers (Canteen, Student Lounge, Outdoor, Corridors, Mini Mart, Sports Complex).',
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Brief',
            value:
              'A photography and web development competition on the theme “Rush hour”.',
          },
        ],
      },
      {
        type: 'fields',
        columns: 2,
        items: [
          { label: 'Dates', value: 'Submitted 25 September 2026' },
          { label: 'Result', value: 'Best Website' },
        ],
      },
    ],
  },
  {
    id: 'rush-hour-continued',
    eyebrow: 'Sheet 20',
    title: 'MTC Mediathon',
    titleNote: 'continued',
    compact: true,
    fitImages: true,
    blocks: [
      {
        type: 'image',
        src: '/images/hackathons/rush-hour-security-room.png',
        alt: 'Rush Hour website: a dim security room with three CRT monitors, a green desk lamp and two filing cabinets of photo drawers.',
        maxHeight: RUSH_HOUR_PRINT,
      },
      {
        type: 'fields',
        columns: 2,
        items: [
          {
            label: 'Organisers',
            value:
              'Reflexions × Microsoft Tech Club, BITS Pilani Dubai Campus',
          },
          {
            label: 'Team',
            value: 'Team Monster',
            note: 'Krish Anand, Sanjit Kumar, Prashanth Ananthakrishnan & Chethan Devadiga',
          },
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Links',
            parts: [
              {
                text: 'Live site',
                href: 'https://coolprash06.github.io/Mediathon_Team_Monster/',
              },
              {
                text: 'GitHub',
                href: 'https://github.com/coolprash06/Mediathon_Team_Monster',
              },
              {
                text: 'Demo video',
                href: 'https://www.youtube.com/watch?v=ur4rpfRrtGA',
              },
              {
                text: 'Results announcement',
                href: 'https://www.instagram.com/p/Dd6ni09jot_/?img_index=4',
              },
            ],
          },
        ],
      },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/* PR-002 - Projects                                                          */
/* -------------------------------------------------------------------------- */

/* What a `fitImages` sheet's block column (`cqh`) has left under The Three
   Brains write-up: less the entry and the `compact` gap under it (15.875rem
   as measured), the frame's padding and hairline (1rem + 2px), and 1px so
   rounding can never tip it into a scrollbar. */
const THREE_BRAINS_PRINT = 'calc(100cqh - 16.875rem - 3px)'

/**
 * BITS Hackathon Hub follows the Hackathons layout on Sheets 01 and 02:
 * write-up and record rows first, then the print and the report link on a
 * continued sheet.
 *
 * AI Calendar App follows TriageAI on Sheets 03 and 04, with no Team, Result
 * or links: write-up and Built with first, then both prints stacked.
 *
 * Campus Café follows on Sheets 05 and 06 in the BITS Hackathon Hub layout,
 * without the Team and Built with rows: a sheet leaves out a `fields` block
 * it has nothing for rather than drawing it empty.
 *
 * The Three Brains follows on Sheets 07 and 08: the write-up with its
 * per-query print straight under it, then the query set, the results table
 * and links.
 *
 * Eight sheets fill four spreads, so the closing plate opens a spread of its
 * own after them.
 */
const PROJECTS_PAGES = [
  {
    id: 'bits-hackathon-hub',
    eyebrow: 'Sheet 01',
    title: 'Course Project',
    compact: true,
    blocks: [
      {
        type: 'entry',
        title: 'BITS Hackathon Hub',
        org: 'CS F212 – Database Systems',
        bullets: [
          'A full-stack hackathon management platform covering registration, skill-based team matching, mentor booking, project submission, judging and live leaderboards.',
          'Built on a normalised MySQL schema of 20 tables, with 20 triggers, 10 stored procedures and 6 views enforcing the rules inside the database.',
        ],
      },
      {
        type: 'fields',
        columns: 2,
        items: [
          { label: 'Team', value: 'Prashanth Ananthakrishnan & Krish Anand' },
          {
            label: 'Built with',
            value: 'React, Vite · Java Spring Boot · JPA/Hibernate · MySQL',
          },
        ],
      },
    ],
  },
  {
    id: 'bits-hackathon-hub-continued',
    eyebrow: 'Sheet 02',
    title: 'Course Project',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/projects/bits-hackathon-hub.png',
        alt: 'BITS Hackathon Hub landing page',
        maxHeight: '16rem',
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Links',
            parts: [
              {
                text: 'Full report (PDF)',
                href: '/docs/bits-hackathon-hub-report.pdf',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ai-calendar-app',
    eyebrow: 'Sheet 03',
    title: 'Personal Project · August 2026',
    compact: true,
    blocks: [
      {
        type: 'entry',
        title: 'AI Calendar App',
        org: 'Cost Effective Calendar App with AI Features',
        bullets: [
          'A single-user calendar and task manager: drag tasks onto Day, Week or Month views, colour-coded by category, with overdue and neglected tasks flagged automatically.',
          'An AI assistant creates, deletes and searches tasks from plain English, but every change needs your confirmation first.',
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Built with',
            value:
              'Next.js, React, TypeScript, Tailwind · FastAPI, SQLAlchemy · PostgreSQL (Neon) · Groq (Llama 3.3 70B)',
          },
        ],
      },
    ],
  },
  {
    id: 'ai-calendar-app-continued',
    eyebrow: 'Sheet 04',
    title: 'Personal Project',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/projects/ai-calendar-assistant.png',
        alt: 'AI assistant proposing a new task for confirmation',
        maxHeight: '11.5rem',
      },
      {
        type: 'image',
        src: '/images/projects/ai-calendar-week.png',
        alt: 'Week view with a scheduled task and the AI creating another',
        maxHeight: '11.5rem',
      },
    ],
  },
  {
    id: 'campus-cafe',
    eyebrow: 'Sheet 05',
    title: 'Course Project',
    compact: true,
    blocks: [
      {
        type: 'entry',
        title: 'Campus Café',
        org: 'CS F213 – Object-Oriented Programming',
        bullets: [
          'A Java Swing desktop app that brings campus food services into one place: canteen ordering paid through a digital wallet, mess plan subscriptions for hostellers, catering requests for club events, and student feedback.',
          'An admin dashboard for managing the canteen order queue, approving or rejecting catering requests and reviewing feedback, with a background thread that keeps a live list of trending menu items.',
          'Designed around core OOP principles: an abstract User hierarchy, interfaces for payments and billing, polymorphic meal plans and custom exceptions, backed by MySQL through JDBC.',
        ],
      },
    ],
  },
  {
    id: 'campus-cafe-continued',
    eyebrow: 'Sheet 06',
    title: 'Course Project',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/projects/campus-cafe-class-diagram.png',
        alt: 'Campus Café class diagram',
        maxHeight: '16rem',
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Links',
            parts: [
              {
                text: 'Full report (PDF)',
                href: '/docs/campus-cafe-report.pdf',
              },
              {
                text: 'GitHub repository',
                href: 'https://github.com/Krishanand06/OOP_Mini_Project',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'three-brains',
    eyebrow: 'Sheet 07',
    title: 'Course Assignment',
    compact: true,
    fitImages: true,
    blocks: [
      {
        type: 'entry',
        title: 'The Three Brains',
        org: 'Introduction to LLMs – Take Home Assignment 1, Q2',
        bullets: [
          'Compares three retrieval systems on 300 AG News documents: keyword retrieval (Jaccard on keyword sets), n-gram retrieval (Jaccard on unigrams and bigrams) and embedding retrieval (cosine similarity on all-MiniLM-L6-v2 embeddings).',
        ],
      },
      {
        type: 'image',
        src: '/images/projects/three-brains-per-query.png',
        alt: 'Per-query results: relevant documents in the top 3 for each system across all 10 test queries.',
        maxHeight: THREE_BRAINS_PRINT,
      },
    ],
  },
  {
    id: 'three-brains-continued',
    eyebrow: 'Sheet 08',
    title: 'Course Assignment',
    titleNote: 'continued',
    fitSpacing: true,
    blocks: [
      {
        type: 'text',
        text: 'Each system returns its top 3 documents for 10 test queries across five query types: exact keyword, paraphrased, synonym, word-order sensitive and ambiguous.',
      },
      {
        type: 'table',
        columns: [
          { key: 'system', label: 'Retrieval system' },
          { key: 'method', label: 'Scoring' },
          { key: 'score', label: 'Relevant in top 3', align: 'right' },
        ],
        rows: [
          { system: 'Keyword', method: 'Jaccard, keyword sets', score: '20 / 30' },
          { system: 'N-gram', method: 'Jaccard, uni + bigrams', score: '19 / 30' },
          { system: 'Embedding', method: 'Cosine, MiniLM', score: '23 / 30' },
        ],
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Links',
            parts: [
              {
                text: 'GitHub repository',
                href: 'https://github.com/coolprash06/IntroToLLMs_THA1_Question2',
              },
              {
                text: 'Read the report (PDF)',
                href: '/files/projects/three-brains-report.pdf',
              },
            ],
          },
        ],
      },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/* PR-003 - UI Designs                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Every design takes two sheets. The first is text only: the `entry` with its
 * links level with the title and a one-line intro as its bullet, then a
 * labelled section of bullets, then the short record rows in a two-column
 * grid, anchored to the foot of the sheet so the page reads full top to
 * bottom. The second is the print alone under a "continued" heading, with no
 * `maxHeight`, so it is as wide as the sheet allows and its height follows
 * the aspect ratio.
 *
 * 1990 CRT Login is on Sheets 01 and 02, The Enchanted Archive on 03 and 04.
 * The Enchanted Archive has two prints, stacked on its continued sheet. That
 * sheet is `fitImages`, so each print is capped at half the height the sheet
 * has left under its title and the pair always fits without a scrollbar.
 *
 * Four sheets fill two spreads, so the closing plate opens a spread of its
 * own.
 */

/* Half of a `fitImages` sheet's block column (`cqh`), less half of the
   `tight` gap between the two prints (0.75rem), each frame's padding and
   hairline (1rem + 2px), and 1px so rounding can never tip it into a
   scrollbar. */
const HALF_SHEET_PRINT = 'calc(50cqh - 1.375rem - 3px)'

const UI_DESIGNS_PAGES = [
  {
    id: '1990-crt-login',
    eyebrow: 'Sheet 01',
    title: 'UI Design · August 2026',
    fitSpacing: true,
    blocks: [
      {
        type: 'entry',
        title: '1990 CRT Login',
        links: [
          { text: 'GitHub', href: 'https://github.com/coolprash06/1990-crt-login' },
        ],
        bullets: [
          'A 1990s beige CRT computer login screen, rendered as a real 3D object in CSS. Click the screen to begin.',
        ],
      },
      {
        type: 'listGroups',
        groups: [
          {
            label: 'Highlights',
            items: [
              'The scene tilts gently toward your cursor',
              'Boots through a BIOS memory check, then loads PRASHU/OS',
              'Four checks tick green, then ACCESS GRANTED appears',
            ],
          },
        ],
      },
      {
        type: 'fields',
        columns: 2,
        anchor: 'bottom',
        items: [
          { label: 'Demo login', value: 'guest / 1998' },
          { label: 'Built with', value: 'HTML, CSS, JavaScript' },
        ],
      },
    ],
  },
  {
    id: '1990-crt-login-continued',
    eyebrow: 'Sheet 02',
    title: 'UI Design',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/ui-designs/crt-01.png',
        alt: 'Beige CRT computer on standby',
      },
    ],
  },
  {
    id: 'enchanted-archive',
    eyebrow: 'Sheet 03',
    title: 'UI Design · August 2026',
    fitSpacing: true,
    blocks: [
      {
        type: 'entry',
        title: 'The Enchanted Archive',
        links: [
          {
            text: 'GitHub',
            href: 'https://github.com/coolprash06/Minecraft-Enchantment-Login-Page',
          },
        ],
        bullets: [
          'A Minecraft-styled login page built around a voxel enchanting table with a floating book. Click the book and the login plays out as handwritten text on its pages.',
        ],
      },
      {
        type: 'listGroups',
        groups: [
          {
            label: 'Highlights',
            items: [
              'A paced Crafting → Enchanting → Brewing check runs before the verdict',
            ],
          },
        ],
      },
      {
        type: 'fields',
        columns: 2,
        anchor: 'bottom',
        items: [
          { label: 'Demo login', value: 'steve / diamondpickaxe' },
          {
            label: 'Built with',
            value: 'HTML, CSS, JavaScript · Three.js (r169)',
          },
        ],
      },
    ],
  },
  {
    id: 'enchanted-archive-continued',
    eyebrow: 'Sheet 04',
    title: 'UI Design',
    titleNote: 'continued',
    tight: true,
    fitImages: true,
    blocks: [
      {
        type: 'image',
        src: '/images/ui-designs/enchanted-archive-table.png',
        alt: 'Voxel enchanting table with a floating book, surrounded by bookshelves',
        maxHeight: HALF_SHEET_PRINT,
      },
      {
        type: 'image',
        src: '/images/ui-designs/enchanted-archive-success.png',
        alt: 'Open book showing Crafting, Enchanting and Brewing ticks and SUCCESS',
        maxHeight: HALF_SHEET_PRINT,
      },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/* PR-004 - Grades                                                            */
/* -------------------------------------------------------------------------- */

/**
 * One semester per pair of sheets: the grade table on the left, the ERP
 * report it was copied from on the right, so every row can be checked
 * against the source. Most recent term first.
 *
 * Sheet 01 is the Index, built from the sheets after it (see `contents` in
 * blocks.jsx), so it stays right when a term is added or moved. Summer Term
 * 2025-2026 is a single course, so its table and its report share Sheet 02,
 * facing the Index. Second Semester 2025-2026 is on Sheets 03 and 04, First
 * Semester 2025-2026 on 05 and 06, Second Semester 2024-2025 on 07 and 08,
 * First Semester 2024-2025 on 09 and 10.
 *
 * Ten sheets fill five spreads, so the closing plate opens a spread of its
 * own, as in UI Designs.
 */
const GRADES_PAGES = [
  {
    id: 'grades-index',
    eyebrow: 'Sheet 01',
    title: 'Grades',
    blocks: [{ type: 'contents', title: 'Index' }],
  },
  {
    id: 'grades-summer-2025-26',
    eyebrow: 'Sheet 02',
    title: 'Grades',
    fitSpacing: true,
    blocks: [
      {
        type: 'table',
        title: 'Summer Term 2025-2026',
        columns: [
          { key: 'code', label: 'Course Code' },
          { key: 'name', label: 'Course Name', wrap: true },
          { key: 'credits', label: 'Credits', align: 'right' },
          { key: 'grade', label: 'Grade', align: 'right' },
        ],
        rows: [
          { code: 'BITS F221', name: 'PS 1', credits: '5', grade: 'A' },
        ],
      },
      {
        type: 'image',
        src: '/images/grades/grades-summer-2025-26.png',
        alt: 'ERP View Grades report for the summer term of 2025-2026',
        caption: 'Source: ERP grade report',
      },
    ],
  },
  {
    id: 'grades-sem2-2025-26',
    eyebrow: 'Sheet 03',
    title: 'Grades',
    blocks: [
      {
        type: 'table',
        title: 'Second Semester 2025-2026',
        columns: [
          { key: 'code', label: 'Course Code' },
          { key: 'name', label: 'Course Name', wrap: true },
          { key: 'credits', label: 'Credits', align: 'right' },
          { key: 'grade', label: 'Grade', align: 'right' },
        ],
        rows: [
          { code: 'CS F211', name: 'Data Structures & Algorithms', credits: '4', grade: 'A' },
          { code: 'CS F212', name: 'Database Systems', credits: '4', grade: 'A-' },
          { code: 'CS F241', name: 'Microproc & Interfacing', credits: '4', grade: 'A-' },
          { code: 'HSS F232', name: 'Intro to Dev Studies', credits: '3', grade: 'A-' },
          { code: 'MATH F211', name: 'Mathematics III', credits: '3', grade: 'B' },
        ],
      },
    ],
  },
  {
    id: 'grades-sem2-2025-26-source',
    eyebrow: 'Sheet 04',
    title: 'Grades',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/grades/grades-sem2-2025-26.png',
        alt: 'ERP View Grades report for the second semester of 2025-2026',
        caption: 'Source: ERP grade report',
      },
      {
        type: 'text',
        note: true,
        text: 'Note: BITS F225 is Environmental Science (EVS) and does not count towards the GPA. The grades awarded in this subject are either "Good" or "Poor".',
      },
    ],
  },
  {
    id: 'grades-sem1-2025-26',
    eyebrow: 'Sheet 05',
    title: 'Grades',
    blocks: [
      {
        type: 'table',
        title: 'First Semester 2025-2026',
        columns: [
          { key: 'code', label: 'Course Code' },
          { key: 'name', label: 'Course Name', wrap: true },
          { key: 'credits', label: 'Credits', align: 'right' },
          { key: 'grade', label: 'Grade', align: 'right' },
        ],
        rows: [
          { code: 'CS F213', name: 'Object Oriented Prog', credits: '4', grade: 'A' },
          { code: 'CS F214', name: 'Logic in CS', credits: '3', grade: 'A-' },
          { code: 'CS F215', name: 'Digital Design', credits: '4', grade: 'B' },
          { code: 'CS F222', name: 'Discrete Structures for CS', credits: '3', grade: 'B' },
          { code: 'HSS F346', name: 'International Relations', credits: '3', grade: 'A' },
          { code: 'MGTS F211', name: 'Principles of Management', credits: '3', grade: 'A-' },
        ],
      },
    ],
  },
  {
    id: 'grades-sem1-2025-26-source',
    eyebrow: 'Sheet 06',
    title: 'Grades',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/grades/grades-sem1-2025-26.png',
        alt: 'ERP View Grades report for the first semester of 2025-2026',
        caption: 'Source: ERP grade report',
      },
    ],
  },
  {
    id: 'grades-sem2-2024-25',
    eyebrow: 'Sheet 07',
    title: 'Grades',
    /* Eight rows, two more than any other semester: steps down to compact
       or tight spacing only on a sheet too short to hold them, and `dense`
       closes the rows further once it is tight. */
    fitSpacing: true,
    blocks: [
      {
        type: 'table',
        title: 'Second Semester 2024-2025',
        dense: true,
        columns: [
          { key: 'code', label: 'Course Code' },
          { key: 'name', label: 'Course Name', wrap: true },
          { key: 'credits', label: 'Credits', align: 'right' },
          { key: 'grade', label: 'Grade', align: 'right' },
        ],
        rows: [
          { code: 'BIO F110', name: 'Biology Laboratory', credits: '1', grade: 'A-' },
          { code: 'BIO F111', name: 'General Biology', credits: '3', grade: 'B' },
          { code: 'BITS F110', name: 'Engineering Graphics', credits: '2', grade: 'C' },
          { code: 'BITS F112', name: 'Technical Report Writing', credits: '2', grade: 'A' },
          { code: 'CHEM F110', name: 'Chemistry Laboratory', credits: '1', grade: 'B' },
          { code: 'CHEM F111', name: 'General Chemistry', credits: '3', grade: 'A-' },
          { code: 'CS F111', name: 'Computer Programming', credits: '4', grade: 'A' },
          { code: 'MATH F112', name: 'Mathematics II', credits: '3', grade: 'B' },
        ],
      },
    ],
  },
  {
    id: 'grades-sem2-2024-25-source',
    eyebrow: 'Sheet 08',
    title: 'Grades',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/grades/grades-sem2-2024-25.png',
        alt: 'ERP View Grades report for the second semester of 2024-2025',
        caption: 'Source: ERP grade report',
      },
    ],
  },
  {
    id: 'grades-sem1-2024-25',
    eyebrow: 'Sheet 09',
    title: 'Grades',
    /* Seven rows: spaced like Sheet 07 so they fit on a short window. */
    fitSpacing: true,
    blocks: [
      {
        type: 'table',
        title: 'First Semester 2024-2025',
        dense: true,
        columns: [
          { key: 'code', label: 'Course Code' },
          { key: 'name', label: 'Course Name', wrap: true },
          { key: 'credits', label: 'Credits', align: 'right' },
          { key: 'grade', label: 'Grade', align: 'right' },
        ],
        rows: [
          { code: 'BITS F111', name: 'Thermodynamics', credits: '3', grade: 'C' },
          { code: 'EEE F111', name: 'Electrical Sciences', credits: '3', grade: 'B' },
          { code: 'MATH F111', name: 'Mathematics I', credits: '3', grade: 'B' },
          { code: 'MATH F113', name: 'Probability & Statistics', credits: '3', grade: 'A-' },
          { code: 'ME F112', name: 'Workshop Practice', credits: '2', grade: 'B-' },
          { code: 'PHY F110', name: 'Physics Laboratory', credits: '1', grade: 'A-' },
          { code: 'PHY F111', name: 'Mechanics, Oscillations and Waves', credits: '3', grade: 'B-' },
        ],
      },
    ],
  },
  {
    id: 'grades-sem1-2024-25-source',
    eyebrow: 'Sheet 10',
    title: 'Grades',
    titleNote: 'continued',
    compact: true,
    blocks: [
      {
        type: 'image',
        src: '/images/grades/grades-sem1-2024-25.png',
        alt: 'ERP View Grades report for the first semester of 2024-2025',
        caption: 'Source: ERP grade report',
      },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/* PR-005 - Articles                                                          */
/* -------------------------------------------------------------------------- */

/* The whole of a `fitImages` sheet's block column (`cqh`), less the frame's
   padding and hairline (1rem + 2px), the caption under it (its 0.75rem gap
   and up to two lines of label type, 2.5rem), and 1px so rounding can never
   tip it into a scrollbar. */
const CAPTIONED_SHEET_PRINT = 'calc(100cqh - 4.25rem - 3px)'

/* What a `fitImages` sheet's block column (`cqh`) has left over an article's
   link and tags: less those two blocks and the 2rem gap over each (10.5rem as
   measured, with both on one line), the frame's padding and hairline
   (1rem + 2px), and 1px so rounding can never tip it into a scrollbar. */
const HEADER_SHEET_PRINT = 'calc(100cqh - 11.5rem - 3px)'

/**
 * Every article takes two sheets. The first is a clipping of the published
 * article's header (title, publisher, date), then its link and tags; the
 * header is capped to the height the sheet has left over them, and its alt
 * text carries the title, publisher, date and a summary. The second is the
 * article's figure alone under a "continued" heading, with the article's own
 * caption under it.
 *
 * Graph RAG is on Sheets 01 and 02.
 */
const ARTICLES_PAGES = [
  {
    id: 'graph-rag',
    eyebrow: 'Sheet 01',
    title: 'Article · October 2026',
    fitImages: true,
    blocks: [
      {
        type: 'image',
        src: '/images/articles/graph-rag-header.png',
        alt: 'From Pile of Pages to Map of Knowledge: Inside Graph RAG, Linux Users Group BITS Dubai, 5 October 2026. Standard RAG retrieves text chunks by similarity, so the connections between facts are lost. Graph RAG retrieves connected facts from a knowledge graph instead, and the article walks through how it works. Real uses: LinkedIn customer support (28.6% lower median resolution time) and UCSF biomedical Q&A (answers with provenance).',
        maxHeight: HEADER_SHEET_PRINT,
      },
      {
        type: 'fields',
        items: [
          {
            label: 'Links',
            parts: [
              {
                text: 'Read on LinkedIn',
                href: 'https://www.linkedin.com/posts/lugbpdc_what-if-the-problem-with-rag-isnt-that-it-activity-7512723622562811904-2r8j',
              },
            ],
          },
        ],
      },
      {
        type: 'chipGroups',
        groups: [
          { label: 'Tags', items: ['RAG', 'Knowledge Graphs', 'LLMs'] },
        ],
      },
    ],
  },
  {
    id: 'graph-rag-continued',
    eyebrow: 'Sheet 02',
    title: 'Article',
    titleNote: 'continued',
    fitImages: true,
    blocks: [
      {
        type: 'image',
        src: '/images/articles/graph-rag-diagram.png',
        maxHeight: CAPTIONED_SHEET_PRINT,
        alt: 'Diagram comparing Standard RAG (question, text chunks, LLM, answer) with Graph RAG (question, knowledge graph, LLM, answer), with LinkedIn Customer Support and UCSF Biomedical Q&A as examples',
        caption:
          "Standard RAG finds what looks similar. Graph RAG finds what's connected.",
      },
    ],
  },
]

export const DOSSIERS = [
  {
    id: 'my-resume',
    title: 'My Resume',
    plate: 'MY RESUME',
    /* Who the file is about, as it is typed on the folder cover in the room.
       The title is what the drawer is called; this is what the paper says. */
    subject: 'Prashanth Ananthakrishnan',
    fileNumber: 'PR-000',
    classification: 'Personnel File',
    stamp: 'Declassified',
    /* Spoken by FilePrompt's drawer beat - where the room says this file
       lives, since the fixed sequence copy no longer assumes there is only
       one drawer in the building. */
    drawerLabel: 'Hero cabinet / Drawer 01',
    summary:
      'Education, field experience, technical toolkit, projects, and awards.',
    pages: MY_RESUME_PAGES,
  },
  {
    id: 'hackathons',
    title: 'Hackathons',
    plate: 'HACKATHONS',
    subject: 'Hackathons',
    fileNumber: 'PR-001',
    classification: 'Case File',
    stamp: 'Declassified',
    drawerLabel: 'Side cabinet / Drawer 01',
    summary: 'Wins, entries, and write-ups. More on the way.',
    pages: HACKATHONS_PAGES,
  },
  {
    id: 'projects',
    title: 'Projects',
    plate: 'PROJECTS',
    subject: 'Projects',
    fileNumber: 'PR-002',
    classification: 'Case File',
    stamp: 'Declassified',
    drawerLabel: 'Hero cabinet / Drawer 02',
    summary: 'Project write-ups.',
    pages: PROJECTS_PAGES,
  },
  {
    id: 'ui-designs',
    title: 'UI Designs',
    plate: 'UI DESIGNS',
    subject: 'UI Designs',
    fileNumber: 'PR-003',
    classification: 'Case File',
    stamp: 'Declassified',
    drawerLabel: 'Side cabinet / Drawer 02',
    summary: 'Interface designs.',
    pages: UI_DESIGNS_PAGES,
  },
  {
    id: 'grades',
    title: 'Grades',
    plate: 'GRADES',
    subject: 'Grades',
    fileNumber: 'PR-004',
    classification: 'Case File',
    stamp: 'Declassified',
    drawerLabel: 'Side cabinet / Drawer 03',
    summary: 'Semester grades, with the ERP report they came from.',
    pages: GRADES_PAGES,
  },
  {
    id: 'articles',
    title: 'Articles',
    plate: 'ARTICLES',
    subject: 'Articles',
    fileNumber: 'PR-005',
    classification: 'Case File',
    stamp: 'Declassified',
    drawerLabel: 'Left cabinet / Drawer 01',
    summary: 'Published articles and write-ups, starting with Graph RAG.',
    pages: ARTICLES_PAGES,
  },
]

/** Fast lookup for the drawer click handler and the hash route. */
const DOSSIERS_BY_ID = Object.fromEntries(DOSSIERS.map((d) => [d.id, d]))

export function getDossier(id) {
  return DOSSIERS_BY_ID[id] ?? null
}

/**
 * The twelve weekly case files are still being made. They are listed in the
 * File Index as unavailable rather than hidden, so the index reads as a real
 * archive with six drawers filled rather than a list with a few rows.
 *
 * Numbered from PR-006: PR-000 to PR-005 are spoken for by the six filed
 * dossiers above.
 */
export const PENDING_FILES = Array.from({ length: 12 }, (_, i) => ({
  id: `week-${i + 1}`,
  title: `Week ${String(i + 1).padStart(2, '0')}`,
  fileNumber: `PR-${String(i + 6).padStart(3, '0')}`,
  classification: 'Case File',
  summary: 'Design in progress.',
}))
