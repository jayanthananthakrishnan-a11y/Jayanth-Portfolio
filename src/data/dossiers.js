import arogyanetPrint from '../assets/arogyanet.png'
import communitypulsePrint from '../assets/communitypulse.png'
import votematrixPrint from '../assets/votematrix.png'
import noteflowPrint from '../assets/noteflow.png'
import crickGridPrint from '../assets/crickgrid.jpeg'
import cancerGraphPrint from '../assets/cancergraph.png'
import techSprintPrint from '../assets/techsprint.png'

/**
 * Dossier content model.
 *
 * A dossier is a drawer's worth of paper. It renders in two places from this
 * one source: the paged spread view (two sheets at a time, page-turn nav) and
 * the Reading View (every sheet stacked and scrollable). Neither view knows
 * anything about the 3D room - see the ui/scene split note in the README.
 *
 * A dossier is written as a flow, not as sheets. Its `sections` (one project,
 * one part of the resume) are laid onto sheets at run time, at the size the
 * sheets actually are in the window and view they are read in, so they fill
 * like the pages of a real document - see ui/dossier/flow.js. Each section
 * opens a new sheet and runs on over as many as it needs:
 *
 *   id       - unique within the dossier
 *   title    - the label every one of its sheets carries; sheets after the
 *              first add "(continued)"
 *   heading  - optional `{ title, subtitle }`: a project's name and line,
 *              set as an entry; the title repeats on every continued sheet
 *   blocks   - its content, in reading order
 *
 * Besides the block types below, a section may use `bullets` (`items`, a
 * list of strings), which runs under the heading as its entry's bullets.
 * Each bullet, paragraph, chip group and list group moves between sheets on
 * its own; any other block moves whole. An `image` gives its pixel `width`
 * and `height`, so it can be printed smaller to fit the space a sheet has
 * left (never under MIN_PRINT_HEIGHT).
 *
 * Sheets are built from a small closed set of block types so the paper styling
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
 * A sheet may set `compact: true` or `tight: true` to close its spacing, or
 * `fitSpacing` / `fitImages`; see DossierPage. Flowed sheets need none of
 * them - they hold only what fits at normal spacing.
 */

/* -------------------------------------------------------------------------- */
/* RS-001 - Resume                                                            */
/* -------------------------------------------------------------------------- */

/* Profile links. A value that is not an http(s) URL is set as plain text
   rather than as a dead link, so a profile can be listed before its address
   is known. */
const LINKS = {
  linkedin: 'https://www.linkedin.com/in/jayanth-ananthakrishnan-609269306/',
  github: 'https://github.com/jayanthananthakrishnan-a11y',
  leetcode: 'https://leetcode.com/u/Jayanth_Ananthakrishnan/',
}

const linkPart = (text, url) =>
  /^https?:/.test(url) ? { text, href: url } : { text }

const RESUME_SECTIONS = [
  {
    id: 'profile-education',
    title: 'Profile & Education',
    blocks: [
      { type: 'headline', text: 'Jayanth Ananthakrishnan' },
      {
        type: 'fields',
        items: [
          {
            label: 'Contact',
            parts: [
              { text: '+91 90251 31893', href: 'tel:+919025131893' },
              {
                text: 'jayanthananthakrishnan@gmail.com',
                href: 'mailto:jayanthananthakrishnan@gmail.com',
              },
            ],
          },
          {
            label: 'Links',
            parts: [
              linkPart('LinkedIn', LINKS.linkedin),
              linkPart('GitHub', LINKS.github),
              linkPart('LeetCode', LINKS.leetcode),
            ],
          },
        ],
      },
      /* Side by side: two short rows read better as a pair. */
      {
        type: 'fields',
        columns: 2,
        items: [
          {
            label: 'Education',
            value: 'IIIT Sri City',
            note: 'B.Tech in Computer Science, 2024 – 2028',
          },
          { label: 'CGPA', value: '8.61 / 10.0' },
        ],
      },
      {
        type: 'chipGroups',
        groups: [
          {
            label: 'Relevant Coursework',
            items: [
              'Data Structures & Algorithms',
              'Database Systems',
              'Object Oriented Programming',
              'C Programming',
              'Operating Systems',
              'Theory of Computation',
              'Artificial Intelligence',
              'Machine Learning',
              'Cloud Computing',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'technical-skills',
    title: 'Technical Skills',
    blocks: [
      {
        type: 'chipGroups',
        groups: [
          { label: 'Programming Languages', items: ['Java', 'C', 'Python'] },
          {
            label: 'Web Technologies',
            items: ['React', 'Express', 'NestJS', 'JavaScript', 'TypeScript'],
          },
          { label: 'Data Science & AI', items: ['PyTorch', 'NumPy', 'Pandas'] },
          {
            label: 'Java Stack',
            items: ['Core Java', 'JDBC', 'Spring Boot', 'Spring Security'],
          },
          { label: 'Databases', items: ['MySQL', 'PostgreSQL'] },
        ],
      },
    ],
  },
  {
    id: 'projects',
    title: 'Full Stack Projects & Mobile App',
    blocks: [
      /* Grouped under tracked labels, as on the next sheet, rather than as
         three `entry` headings: these are stack summaries, not write-ups. */
      {
        type: 'listGroups',
        groups: [
          {
            label: 'CommunityPulse',
            items: [
              'Frontend: React, Next.js',
              'Backend & Database: Node.js, Supabase, PostgreSQL, JWT Authentication',
              'AI Integration: Gemini API, AI Orchestration',
            ],
          },
          {
            label: 'Crick Grid (mobile app)',
            items: [
              'Mobile: React Native, Expo, Expo Router',
              'Backend & APIs: Node.js, Express.js, REST APIs, Axios, Middleware (Helmet, Morgan)',
            ],
          },
          {
            label: 'ArogyaNet AI',
            items: [
              'Frontend: React (Vite, Framer Motion, React Router)',
              'Backend & APIs: Node.js, Express.js, RESTful APIs, SMTP Email Integration',
              'AI Integration: Google Vertex AI, Gemini API',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'research-hackathons-experience',
    title: 'Research, Hackathons & Experience',
    blocks: [
      {
        type: 'listGroups',
        groups: [
          {
            label: 'Research Areas',
            items: [
              'Multimodal Cancer Classification with Graph Neural Networks & Transfer Learning',
              'Security in Retrieval-Augmented Generation & Federated Systems',
              'Non-Orthogonal Multiple Access (NOMA)',
            ],
          },
          {
            label: 'Hackathons',
            items: ['Runners-up, TechSprint by Hack2Skill (project: Noteflow)'],
          },
          {
            label: 'Experience',
            items: [
              'Branding & Design Associate, Web3SSH',
              'Marketing Associate, E-Cell (on campus)',
            ],
          },
        ],
      },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/* FS-002 - Full Stack Projects (Web)                                         */
/* -------------------------------------------------------------------------- */

/**
 * One project as a flowing section: its heading, its bullets, the Built with
 * row, the screenshot and the links, in that order. Anything a project does
 * not have is left out rather than drawn as an empty row. There is no Team
 * row; none was given.
 */
function projectSection(label, project) {
  const blocks = []
  if (project.bullets) blocks.push({ type: 'bullets', items: project.bullets })
  if (project.builtWith) {
    blocks.push({
      type: 'fields',
      items: [{ label: 'Built with', value: project.builtWith }],
    })
  }
  if (project.image) blocks.push({ type: 'image', ...project.image })
  if (project.links?.length) {
    blocks.push({
      type: 'fields',
      items: [{ label: 'Links', parts: project.links }],
    })
  }
  return {
    id: project.id,
    title: label,
    heading: { title: project.title, subtitle: project.subtitle },
    blocks,
  }
}

const FULL_STACK_PROJECTS = [
  {
    id: 'arogyanet-ai',
    title: 'ArogyaNet AI',
    subtitle: 'AI-Powered Healthcare Intelligence Platform for India',
    bullets: [
      'An AI-powered healthcare intelligence platform for India that combines national healthcare datasets with interactive state and district-level analytics, infrastructure exploration, emergency reporting, and a citizen-facing AI assistant.',
      'Built a dual-facing architecture with a public citizen portal and secure multi-tenant command center, featuring role-based access control, token-based authentication, operational dashboards, resource monitoring, predictive insights, and automated alerts.',
      'Integrated a PostgreSQL data layer, RESTful Express APIs, ETL workflows, and Google Vertex AI/Gemini to transform healthcare data into interactive intelligence and decision-support tools.',
    ],
    builtWith:
      'React, Vite · Node.js, Express.js · PostgreSQL · REST APIs · Google Vertex AI/Gemini · Tailwind CSS · Framer Motion',
    links: [
      {
        text: 'GitHub',
        href: 'https://github.com/jayanthananthakrishnan-a11y/ArogyaNet-AI',
      },
      { text: 'LinkedIn post', href: 'https://lnkd.in/p/e-vZKTvY' },
      { text: 'Live site', href: 'https://arogya-net-ai.vercel.app/' },
    ],
    image: {
      src: arogyanetPrint,
      alt: 'ArogyaNet AI screenshot',
      width: 2748,
      height: 1422,
    },
  },
  {
    id: 'communitypulse',
    title: 'CommunityPulse',
    subtitle: 'AI-Assisted NGO Response Coordination Platform',
    bullets: [
      'An AI-powered civic response platform that helps NGOs transform scattered citizen complaints into structured, prioritized action items through human moderation, automated issue analysis, and volunteer coordination.',
      'Built a scalable issue-triage workflow with anonymous reporting, admin verification and spam filtering, AI-generated summaries, dynamic urgency scoring, automatic categorization, and skill- and location-based volunteer recommendations.',
      'Implemented a modular event-driven architecture using Next.js, Supabase/PostgreSQL, JWT authentication, and PostgreSQL Row-Level Security, with Gemini AI orchestrating complaint analysis and asynchronous issue state transitions.',
    ],
    builtWith:
      'Next.js, React, TypeScript · Node.js · Supabase/PostgreSQL · JWT Authentication · Gemini API · Tailwind CSS',
    links: [
      {
        text: 'GitHub',
        href: 'https://github.com/jayanthananthakrishnan-a11y/communitypulse-prototype',
      },
      { text: 'LinkedIn post', href: 'https://lnkd.in/p/e3iZCYBH' },
      {
        text: 'Live site',
        href: 'https://communitypulse-prototype.vercel.app/',
      },
    ],
    image: {
      src: communitypulsePrint,
      alt: 'CommunityPulse screenshot',
      width: 2512,
      height: 1504,
    },
  },
  {
    id: 'votematrix',
    title: 'VoteMatrix',
    subtitle: 'India Election Intelligence Platform',
    bullets: [
      'A full-stack election analytics platform covering all 543 Lok Sabha constituencies from the 2024 Indian General Election, with interactive national, state, constituency, and cross-constituency intelligence views.',
      'Engineered an ETL pipeline to ingest and normalize thousands of election records into a relational PostgreSQL schema connecting states, constituencies, candidates, parties, alliances, vote shares, margins, and turnout metrics across multiple election cycles.',
      'Built a Spring Boot backend using JPA/Hibernate and the Service-Repository pattern for structured data retrieval and filtering, alongside a resilient React frontend with API-first data fetching and JSON fallback for backend-independent availability.',
    ],
    builtWith:
      'React, Vite, Tailwind CSS · Java, Spring Boot · JPA/Hibernate · PostgreSQL · REST APIs · Recharts',
    links: [
      {
        text: 'GitHub',
        href: 'https://github.com/jayanthananthakrishnan-a11y/VoteMatrix',
      },
      { text: 'LinkedIn post', href: 'https://lnkd.in/p/eG3gPFA7' },
      { text: 'Live site', href: 'https://superb-lolly-d8f239.netlify.app' },
    ],
    image: {
      src: votematrixPrint,
      alt: 'VoteMatrix screenshot',
      width: 974,
      height: 510,
    },
  },
  {
    id: 'noteflow',
    title: 'NoteFlow',
    subtitle: 'Platform for Handwritten Notes',
    bullets: [
      'A full-stack educational platform that enables creators to publish structured handwritten notes and students to discover, preview, bookmark, rate, and comment on course-specific learning material.',
      'Designed around the need for concise, credible academic resources, with creators organizing content into sections such as cheat sheets, flashcards, and question papers, while students can preview notes before unlocking full content.',
      'Implemented authentication and CRUD workflows for notes, bookmarks, and comments, with a responsive React interface and a PostgreSQL-backed Node.js/Express API.',
    ],
    builtWith:
      'React, Vite · Tailwind CSS · Node.js, Express.js · PostgreSQL · REST APIs',
    links: [
      {
        text: 'GitHub',
        href: 'https://github.com/jayanthananthakrishnan-a11y/NoteFlow',
      },
      { text: 'LinkedIn post', href: 'https://lnkd.in/p/e2mP6bXC' },
      { text: 'Live site', href: 'https://openinnovationnoteflow.netlify.app' },
    ],
    image: {
      src: noteflowPrint,
      alt: 'NoteFlow screenshot',
      width: 2538,
      height: 1418,
    },
  },
]

/* -------------------------------------------------------------------------- */
/* MA-003 - Mobile Applications                                               */
/* -------------------------------------------------------------------------- */

const MOBILE_PROJECTS = [
  {
    id: 'crick-grid',
    title: 'Crick Grid',
    subtitle: 'Offline-First Cricket Analytics & Match Scoring Application',
    bullets: [
      'An offline-first mobile application for players, coaches, and analysts that combines ball-by-ball net-practice tracking, live match scoring, cricket analytics, video tagging, and automated coaching reports.',
      'Built a granular delivery-tracking system capturing pitch location, batter contact point, delivery movement, line and length, and shot selection, with automated heatmaps, contact-quality metrics, and performance analytics.',
      'Implemented a live scoring engine covering overs, wickets, partnerships, extras, strike rotation, and field-position-based scoring, alongside local persistence and a PostgreSQL-backed REST API to support reliable operation even without network connectivity.',
    ],
    builtWith:
      'React Native, Expo, Expo Router · Node.js, Express.js · PostgreSQL · REST APIs · AsyncStorage · Axios · React Native SVG · Expo Print',
    links: [
      {
        text: 'GitHub',
        href: 'https://github.com/jayanthananthakrishnan-a11y/crick-grid',
      },
    ],
    image: {
      src: crickGridPrint,
      alt: 'Crick Grid screenshot',
      width: 754,
      height: 1600,
    },
  },
]

/* -------------------------------------------------------------------------- */
/* RA-005 - Research Areas                                                    */
/* -------------------------------------------------------------------------- */

const RESEARCH_PROJECTS = [
  {
    id: 'cancergraph',
    title: 'CancerGraph',
    subtitle: 'Multimodal Cancer AI Platform & Research Workbench',
    bullets: [
      'A web-based AI research platform for exploring multimodal cancer analysis, combining interactive medical-imaging workflows with research benchmarks across imaging, genomics, pathology, and other clinical modalities.',
      'Implemented a live 4-class brain MRI classifier using an EfficientNet-based Keras model and a lightweight Python inference backend, supporting image uploads and sample images with Softmax-based predictions for glioma, meningioma, pituitary tumor, and no-tumor cases.',
      'Developed an interactive research workbench showcasing deep-learning feature embeddings, multimodal datasets, genomic biomarkers, transfer-learning experiments, and 3D tumor-segmentation research, with a structured domain-based interface for exploring experimental results and methodologies.',
    ],
    builtWith:
      'React 19, TypeScript, Vite · Python · Keras/tf.keras · NumPy, Pillow · React Router',
    links: [
      {
        text: 'GitHub',
        href: 'https://github.com/jayanthananthakrishnan-a11y/CancerGraph',
      },
    ],
    image: {
      src: cancerGraphPrint,
      alt: 'CancerGraph screenshot',
      width: 2796,
      height: 1516,
    },
  },
]

/* -------------------------------------------------------------------------- */
/* HE-004 - Hackathon & Experience                                            */
/* -------------------------------------------------------------------------- */

/* A write-up rather than a project sheet: no Built with row or links. Its two
   points are set as bullets so the sheet reads like the project sheets. */
const HACKATHON_PROJECTS = [
  {
    id: 'techsprint',
    title: 'TechSprint',
    subtitle: 'Google Developer Groups On Campus × Hack2Skill',
    bullets: [
      'TechSprint was a student hackathon organized by Google Developer Groups On Campus in collaboration with Hack2Skill, with a focus on building practical solutions using Google technologies such as Gemini and Flutter.',
      'The problem statement was to identify an existing challenge faced by students and design a meaningful solution around it. I worked on extending my earlier project on a handwritten notes marketplace by developing it further into a more complete learning platform that now supports flashcards, content sharing, cheat sheets, and an AI-enabled dashboard.',
      'Secured 2nd place as team Rising Ember.',
    ],
    image: {
      src: techSprintPrint,
      alt: 'TechSprint screenshot',
      width: 2000,
      height: 1414,
    },
  },
]

export const DOSSIERS = [
  {
    id: 'resume',
    title: 'Resume',
    /* What is typed on the folder cover in the room. */
    subject: 'Resume',
    fileNumber: 'RS-001',
    classification: 'Personnel File',
    stamp: 'Declassified',
    /* Spoken by FilePrompt's drawer beat - where the room says this file
       lives, since the fixed sequence copy no longer assumes there is only
       one drawer in the building. */
    drawerLabel: 'Hero cabinet / Drawer 01',
    sections: RESUME_SECTIONS,
  },
  {
    id: 'full-stack-projects',
    title: 'Full Stack Projects (Web)',
    subject: 'Full Stack Projects (Web)',
    fileNumber: 'FS-002',
    classification: 'Case File',
    stamp: 'Declassified',
    drawerLabel: 'Hero cabinet / Drawer 02',
    sections: FULL_STACK_PROJECTS.map((p) =>
      projectSection('Full Stack Project', p),
    ),
  },
  {
    id: 'mobile-applications',
    title: 'Mobile Applications',
    subject: 'Mobile Applications',
    fileNumber: 'MA-003',
    classification: 'Case File',
    stamp: 'Declassified',
    drawerLabel: 'Hero cabinet / Drawer 03',
    sections: MOBILE_PROJECTS.map((p) =>
      projectSection('Mobile Application', p),
    ),
  },
  {
    id: 'hackathon-experience',
    title: 'Hackathon & Experience',
    subject: 'Hackathon & Experience',
    fileNumber: 'HE-004',
    classification: 'Case File',
    stamp: 'Declassified',
    drawerLabel: 'Side cabinet / Drawer 01',
    sections: HACKATHON_PROJECTS.map((p) => projectSection('Hackathon', p)),
  },
  {
    id: 'research-areas',
    title: 'Research Areas',
    subject: 'Research Areas',
    fileNumber: 'RA-005',
    classification: 'Case File',
    stamp: 'Declassified',
    drawerLabel: 'Side cabinet / Drawer 02',
    sections: RESEARCH_PROJECTS.map((p) =>
      projectSection('Research Project', p),
    ),
  },
]

/** Fast lookup for the drawer click handler and the hash route. */
const DOSSIERS_BY_ID = Object.fromEntries(DOSSIERS.map((d) => [d.id, d]))

export function getDossier(id) {
  return DOSSIERS_BY_ID[id] ?? null
}
