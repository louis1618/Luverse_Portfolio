import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";

const person: Person = {
  firstName: "Luverse",
  lastName: "Studio",
  name: "이예찬",
  role: "뭐든 만들어 볼 나이",
  avatar: "/images/avatar.png",
  email: "admin@moring.co",
  location: "Asia/Seoul",
  languages: [],
};

const newsletter: Newsletter = {
  display: false,
  title: <>Subscribe to Newsletter</>,
  description: <>Updates and insights</>,
};

const social: Social = [
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/louis1618",
  },
  {
    name: "Threads",
    icon: "threads",
    link: "https://www.threads.com/@luverse.o",
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.png",
  label: "Home",
  title: person.name,
  description: "Luverse의 개발 프로젝트와 작업 기록",
  headline: <>필요한 서비스를 직접 기획하고 개발합니다.</>,
  action: {
    display: true,
    title: <>프로젝트 보기</>,
    href: "/work",
  },
  subline: (
    <>
      웹과 앱, AI 에이전트와 개발 도구를 만들고 있습니다.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `소개`,
  description: `${person.name} 소개`,
  tableOfContent: {
    display: false,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: false,
    link: "https://cal.com",
  },
  intro: {
    display: false,
    title: "소개",
    description: (
      <>
        뭐든 만들어 볼 나이
        <br />
      </>
    ),
  },
  work: {
    display: false,
    title: "요즘 집중하는 것",
    experiences: [
      {
        company: "AI × Product",
        timeframe: "Now",
        role: "01",
        achievements: [
          <>
            AI를 제품의 실제 기능과 데이터에 자연스럽게 연결하고, 복잡한 기능도
            사용자가 빠르고 직관적으로 사용할 수 있는 경험을 만드는 데 집중하고 있습니다.
          </>,
          <>
            에이전트 구조와 작은 프로토타입을 직접 만들며 권한, 상태, 실패 복구,
            실행 결과까지 검증하고 다음 설계에 반영합니다.
          </>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: false,
    title: "학력",
    institutions: [],
  },
  technical: {
    display: true,
    title: "사용 기술",
    skills: [
      {
        title: "Web",
        description: <>웹 서비스의 화면과 기능을 설계하고 구현합니다.</>,
        tags: [
          { name: "TypeScript", icon: "typescript" },
          { name: "React", icon: "react" },
          { name: "Next.js", icon: "nextjs" },
          { name: "Vite", icon: "vite" },
          { name: "Tailwind CSS", icon: "tailwindcss" },
        ],
        images: [],
      },
      {
        title: "Backend",
        description: <>API, 인증, 데이터 저장과 서비스 로직을 개발합니다.</>,
        tags: [
          { name: "Python", icon: "python" },
          { name: "FastAPI", icon: "fastapi" },
          { name: "Node.js", icon: "nodejs" },
          { name: "Supabase", icon: "supabase" },
          { name: "PostgreSQL", icon: "postgresql" },
        ],
        images: [],
      },
      {
        title: "App",
        description: <>모바일 앱과 데스크톱 도구를 개발합니다.</>,
        tags: [
          { name: "Flutter", icon: "flutter" },
          { name: "Dart", icon: "dart" },
          { name: "Android", icon: "android" },
          { name: "Electron", icon: "electron" },
        ],
        images: [],
      },
      {
        title: "AI & Agents",
        description: <>모델과 도구를 연결하고 실행 흐름과 권한을 설계합니다.</>,
        tags: [
          { name: "Gemini", icon: "gemini" },
          { name: "Codex", icon: "codex" },
          { name: "Python", icon: "python" },
          { name: "FastAPI", icon: "fastapi" },
        ],
        images: [],
      },
      {
        title: "Environment",
        description: <>Linux 환경에서 개발하고 배포와 운영을 관리합니다.</>,
        tags: [
          { name: "Linux", icon: "linux" },
          { name: "Ubuntu", icon: "ubuntu" },
          { name: "Docker", icon: "docker" },
          { name: "Git", icon: "git" },
          { name: "GitHub", icon: "github" },
          { name: "Cloudflare", icon: "cloudflare" },
        ],
        images: [],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "블로그",
  description: "프로젝트를 만들며 정리한 기록",
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: "프로젝트",
  description: "직접 기획하고 개발한 작업",
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: "갤러리",
  description: "프로젝트 화면과 작업 과정",
  images: [
    {
      src: "/images/gallery/luverse_animation.svg",
      alt: "Luverse Signature Animation",
      orientation: "square",
    },
    {
      src: "/images/gallery/Cering_backgroundWhite.png",
      alt: "Cering Background White",
      orientation: "square",
    },
    {
      src: "/images/gallery/CodeAB.png",
      alt: "CodeAB",
      orientation: "square",
    },
    {
      src: "/images/gallery/Jokga School.jpg",
      alt: "Jokga School",
      orientation: "square",
    },
    {
      src: "/images/gallery/Mordy Logo.png",
      alt: "Mordy Logo",
      orientation: "square",
    },
    {
      src: "/images/gallery/Morit.png",
      alt: "Morit",
      orientation: "square",
    },
    {
      src: "/images/gallery/mori.png",
      alt: "Mori",
      orientation: "square",
    },
    {
      src: "/images/gallery/moring.png",
      alt: "Moring",
      orientation: "square",
    },
    {
      src: "/images/gallery/moring_mc.png",
      alt: "Moring MC",
      orientation: "square",
    },
    {
      src: "/images/gallery/배경화면.png",
      alt: "배경화면",
      orientation: "16 / 9",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };