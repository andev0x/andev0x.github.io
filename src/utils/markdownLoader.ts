import { BlogPost } from '../types';

interface MarkdownPost {
  frontmatter: {
    title: string;
    slug: string;
    date: string;
    tags: string[];
    category: string;
    readingTime: number;
    featured: boolean;
    excerpt: string;
  };
  content: string;
}

// This would normally load from actual markdown files
// For now, we'll simulate loading from the markdown files we created
const markdownFiles: Record<string, MarkdownPost> = {
  'building-terminal-interface': {
    frontmatter: {
      title: "Building a Terminal-Inspired Web Interface",
      slug: "terminal-web-interface",
      date: "2024-01-15",
      tags: ["web-dev", "ui-design", "terminal"],
      category: "development",
      readingTime: 5,
      featured: true,
      excerpt: "Learn how to create a web interface that captures the essence of terminal computing while maintaining modern usability."
    },
    content: `# Building a Terminal-Inspired Web Interface

In this post, we'll explore how to create a web interface that captures the essence of terminal computing while maintaining modern usability.

## The Challenge

Creating a terminal-inspired interface requires balancing nostalgia with functionality. We need to:

- Maintain readability with high contrast colors
- Implement keyboard navigation for power users
- Ensure responsive design across devices
- Optimize performance for smooth animations

## Implementation Details

### Color Scheme
We use a carefully selected palette:
- Background: #0a0a0a (near-black)
- Primary: #00FF00 (neon green)
- Accents: Various shades of green

### Typography
- VT323 for body text and headings
- Press Start 2P for UI accents
- Monospace for code blocks

### Keyboard Navigation
Vim-style navigation enhances the terminal experience:
- j/k for scrolling
- g/G for top/bottom
- / for search activation

\`\`\`javascript
// Example keyboard handler
const handleKeyDown = (event) => {
  switch (event.key) {
    case 'j':
      window.scrollBy(0, 100);
      break;
    case 'k':
      window.scrollBy(0, -100);
      break;
    case '/':
      activateSearch();
      break;
  }
};
\`\`\`

## Conclusion

A well-executed terminal aesthetic can create a unique and engaging user experience while maintaining accessibility and performance standards.`
  },
  'advanced-git-workflows': {
    frontmatter: {
      title: "Advanced Git Workflows for Team Collaboration",
      slug: "advanced-git-workflows",
      date: "2024-01-10",
      tags: ["git", "workflow", "collaboration"],
      category: "development",
      readingTime: 8,
      featured: false,
      excerpt: "Master Git workflows to improve team collaboration and maintain clean project history."
    },
    content: `# Advanced Git Workflows for Team Collaboration

Git is more than just version control—it's a powerful tool for team coordination when used correctly.

## Feature Branch Workflow

The feature branch workflow isolates new features from the main codebase:

\`\`\`bash
# Create feature branch
git checkout -b feature/new-auth-system

# Work on feature
git add .
git commit -m "Add OAuth integration"

# Push to remote
git push origin feature/new-auth-system
\`\`\`

## Git Flow Strategy

Git Flow provides a robust branching model:

- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: New features
- **release/***: Release preparation
- **hotfix/***: Critical fixes

## Best Practices

1. **Atomic Commits**: Each commit should represent a single logical change
2. **Descriptive Messages**: Use conventional commit format
3. **Regular Rebasing**: Keep history clean and linear
4. **Code Reviews**: Use pull requests for all changes

## Advanced Techniques

### Interactive Rebase
Clean up commit history before merging:

\`\`\`bash
git rebase -i HEAD~3
\`\`\`

### Cherry Picking
Apply specific commits to other branches:

\`\`\`bash
git cherry-pick abc123def
\`\`\`

## Conclusion

Mastering Git workflows improves team productivity and code quality. Choose the right strategy for your team's needs.`
  },
  'cybersecurity-fundamentals': {
    frontmatter: {
      title: "Cybersecurity Fundamentals for Developers",
      slug: "cybersecurity-fundamentals",
      date: "2024-01-05",
      tags: ["security", "owasp", "best-practices"],
      category: "security",
      readingTime: 10,
      featured: true,
      excerpt: "Essential cybersecurity concepts every developer should understand to build secure applications."
    },
    content: `# Cybersecurity Fundamentals for Developers

Security isn't an afterthought—it's a fundamental aspect of modern development.

## The OWASP Top 10

Understanding the most critical security risks:

1. **Injection Attacks**: SQL, NoSQL, OS command injection
2. **Broken Authentication**: Session management flaws  
3. **Sensitive Data Exposure**: Inadequate protection
4. **XML External Entities (XXE)**: XML processing vulnerabilities
5. **Broken Access Control**: Authorization failures

## Secure Coding Practices

### Input Validation
Always validate and sanitize user input:

\`\`\`javascript
// Bad
const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// Good
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
\`\`\`

### Authentication Security
- Use strong password policies
- Implement multi-factor authentication
- Secure session management
- Regular security audits

## Security Tools

Essential tools for developers:

- **Static Analysis**: ESLint security plugins, SonarQube
- **Dependency Scanning**: npm audit, Snyk
- **Penetration Testing**: Burp Suite, OWASP ZAP
- **Container Security**: Docker Bench, Clair

## Incident Response

Prepare for security incidents:

1. **Detection**: Monitor for suspicious activity
2. **Containment**: Isolate affected systems
3. **Analysis**: Determine scope and impact
4. **Recovery**: Restore normal operations
5. **Lessons**: Document and improve

## Conclusion

Security is everyone's responsibility. Build security into your development process from day one.`
  },
  'react-performance-optimization': {
    frontmatter: {
      title: "Optimizing React Performance",
      slug: "react-performance-optimization",
      date: "2023-12-28",
      tags: ["react", "performance", "optimization"],
      category: "development",
      readingTime: 7,
      featured: false,
      excerpt: "Learn essential techniques to optimize React application performance and user experience."
    },
    content: `# Optimizing React Performance

React apps can become slow without proper optimization techniques.

## Common Performance Issues

- Unnecessary re-renders
- Large bundle sizes
- Inefficient algorithms
- Memory leaks
- Blocking operations

## Optimization Strategies

### Memoization
Use React.memo and useMemo strategically:

\`\`\`jsx
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => heavyProcessing(item));
  }, [data]);
  
  return <div>{processedData}</div>;
});
\`\`\`

### Code Splitting
Split your bundle using dynamic imports:

\`\`\`jsx
const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
\`\`\`

### Virtual Scrolling
Handle large lists efficiently:

\`\`\`jsx
import { FixedSizeList as List } from 'react-window';

const VirtualList = ({ items }) => (
  <List
    height={400}
    itemCount={items.length}
    itemSize={50}
    itemData={items}
  >
    {Row}
  </List>
);
\`\`\`

## Performance Monitoring

Use React DevTools Profiler to identify bottlenecks:

1. Record component interactions
2. Analyze render times
3. Identify expensive operations
4. Optimize critical paths

## Best Practices

- Avoid inline objects and functions
- Use keys properly in lists
- Implement proper error boundaries
- Profile regularly in production

## Conclusion

Performance optimization is an ongoing process. Monitor, measure, and optimize continuously.`
  },
  'mastering-vim-advanced': {
    frontmatter: {
      title: "Mastering Vim: Advanced Commands and Workflows",
      slug: "mastering-vim-advanced",
      date: "2023-12-20",
      tags: ["vim", "productivity", "tools"],
      category: "tools",
      readingTime: 12,
      featured: true,
      excerpt: "Advanced Vim techniques and workflows to dramatically improve your text editing efficiency."
    },
    content: `# Mastering Vim: Advanced Commands and Workflows

Vim is more than an editor—it's a philosophy of efficient text manipulation.

## Movement Mastery

### Text Objects
Vim's text objects are incredibly powerful:

- \`ciw\` - change inner word
- \`da"\` - delete around quotes
- \`yi(\` - yank inside parentheses
- \`va{\` - visual select around braces

### Advanced Navigation
Navigate code efficiently:

\`\`\`vim
" Jump to function definition
gd

" Jump to matching bracket
%

" Navigate by paragraph
{ and }

" Navigate by sentence
( and )
\`\`\`

## Powerful Commands

### Macros
Record and replay complex operations:

\`\`\`vim
" Record macro in register 'a'
qa

" Perform operations...

" Stop recording
q

" Replay macro
@a

" Replay 10 times
10@a
\`\`\`

### Search and Replace
Advanced pattern matching:

\`\`\`vim
" Replace with confirmation
:%s/old/new/gc

" Use regex groups
:%s/\\\\(.\\\\{-}\\\\)\\\\s\\\\+\\\\(.\\\\{-}\\\\)/\\\\2 \\\\1/g

" Replace in visual selection
:'<,'>s/pattern/replacement/g
\`\`\`

## Workflow Optimization

### Split Windows
Manage multiple files:

\`\`\`vim
" Horizontal split
:split filename

" Vertical split
:vsplit filename

" Navigate splits
Ctrl+w h/j/k/l

" Resize splits
Ctrl+w +/-/</>/=
\`\`\`

### Tabs and Buffers
Efficient file management:

\`\`\`vim
" Open in new tab
:tabnew filename

" Switch tabs
gt/gT

" List buffers
:ls

" Switch buffers
:b filename
\`\`\`

## Customization

### Essential .vimrc Settings
\`\`\`vim
" Basic settings
set number
set relativenumber
set autoindent
set smartindent
set tabstop=2
set shiftwidth=2
set expandtab

" Search settings
set hlsearch
set incsearch
set ignorecase
set smartcase

" Key mappings
let mapleader = " "
nnoremap <leader>f :find 
nnoremap <leader>w :w<CR>
nnoremap <leader>q :q<CR>
\`\`\`

## Conclusion

Vim's power lies in its composability. Master the basics, then combine commands to create powerful workflows.`
  },
  'getting-started-with-git': {
    frontmatter: {
      title: "Getting Started with Git: A Beginner-Friendly Guide",
      slug: "getting-started-with-git",
      date: "2025-07-01",
      tags: ["git", "version-control", "beginner"],
      category: "Code",
      readingTime: 7,
      featured: false,
      excerpt: "Git is the backbone of modern software collaboration. Whether you're a solo coder or part of a team, knowing Git is essential."
    },
    content: `> Git is the backbone of modern software collaboration. Whether you're a solo coder or part of a team, knowing Git is essential.\n\n## 🚀 What is Git?\n\n**Git** is a free and open-source distributed version control system designed to handle everything from small to very large projects with speed and efficiency. It allows you to track changes, collaborate with others, and revert to previous versions when necessary.\n\n## 🔧 Installing Git\n\n**macOS:** \`brew install git\`  \n**Ubuntu/Debian:**  \n\`\`\`bash\nsudo apt update\nsudo apt install git\n\`\`\`  \n**Windows:** Download from [https://git-scm.com/download/win](https://git-scm.com/download/win)\n\n## 🛠️ Basic Configuration\n\n\`\`\`bash\ngit config --global user.name "Your Name"\ngit config --global user.email "your@email.com"\ngit config --global init.defaultBranch main\ngit config --list\n\`\`\`\n\n## 📁 Starting a Project with Git\n\n1. Initialize Git in your folder: \`git init\`  \n2. Add files to staging area: \`git add filename.txt\` or \`git add .\`  \n3. Commit changes: \`git commit -m "Initial commit"\`\n\n## 🔄 Working with Git Remotes\n\n1. Create a repository on GitHub  \n2. Link it to your local project:  \n\`\`\`bash\ngit remote add origin https://github.com/yourusername/repo.git\n\`\`\`  \n3. Push your code:  \n\`\`\`bash\ngit push -u origin main\n\`\`\`\n\n## ⚙️ Daily Git Commands\n\n| Task                     | Command                               |\n|--------------------------|----------------------------------------|\n| Check status             | \`git status\`                           |\n| View history             | \`git log\`                              |\n| Create new branch        | \`git branch new-feature\`               |\n| Switch branch            | \`git checkout new-feature\`             |\n| Create + switch branch   | \`git checkout -b bugfix/login-issue\`  |\n| Merge branch             | \`git merge new-feature\`                |\n| See diff before commit   | \`git diff\`                             |\n\n## 🤝 Collaborating with Others\n\nClone a repository: \`git clone https://github.com/username/repo.git\`  \nPull latest changes: \`git pull origin main\`  \nWhen conflicts happen:  \n1. Edit the conflicting files manually  \n2. \`git add conflict-file.js\`  \n3. \`git commit -m "Resolved merge conflict"\`\n\n## 🧪 Bonus Tips\n\nUndo last commit but keep changes: \`git reset --soft HEAD~1\`  \nRemove file from staging: \`git reset filename.txt\`  \nView file change history: \`git log -- filename.txt\`\n\n## 📚 Resources\n\n- [Official Git Documentation](https://git-scm.com/doc)  \n- [Pro Git Book](https://git-scm.com/book/en/v2)  \n- [GitHub Docs](https://docs.github.com/)\n\n## 💡 Final Thoughts\n\nGit may feel intimidating at first, but with practice, it becomes second nature. Start by version-controlling your personal projects, and you'll soon appreciate the safety and flexibility it brings. Happy coding! 🚀`
  },
  'about-me': {
    frontmatter: {
      title: "About Me",
      slug: "about-me",
      date: "2024-07-01",
      tags: ["about"],
      category: "about",
      readingTime: 2,
      featured: false,
      excerpt: "Learn more about the author of this blog."
    },
    content: `# About Me\n\nHi! I'm andev0x, a passionate developer and lifelong learner. I love building web apps, exploring new technologies, and sharing knowledge with the community.\n\n- 💻 Full-stack developer\n- 🛠️ Favorite tools: React, TypeScript, Vite, Tailwind CSS\n- 🌱 Always learning and experimenting\n- 📫 Connect with me on [GitHub](https://github.com/andev0x)`
  },
  'my-projects': {
    frontmatter: {
      title: "My Projects",
      slug: "my-projects",
      date: "2024-07-01",
      tags: ["projects"],
      category: "project",
      readingTime: 3,
      featured: false,
      excerpt: "A showcase of my favorite projects."
    },
    content: `# Projects\n\nHere are some of my favorite projects:\n\n- **Terminal Web UI**: A terminal-inspired web interface for productivity.\n- **Markdown Blog Engine**: A simple markdown-powered blog system.\n- **Open Source Contributions**: Various PRs to open source projects.\n\nMore coming soon!`
  }
};

export const loadMarkdownPosts = (): BlogPost[] => {
  return Object.entries(markdownFiles).map(([filename, { frontmatter, content }]) => ({
    id: filename,
    title: frontmatter.title,
    slug: frontmatter.slug,
    content,
    excerpt: frontmatter.excerpt,
    date: frontmatter.date,
    tags: frontmatter.tags,
    category: frontmatter.category,
    readingTime: frontmatter.readingTime,
    featured: frontmatter.featured,
  }));
};