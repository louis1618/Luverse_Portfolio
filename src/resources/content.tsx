import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";

const person: Person = {
  firstName: "Luverse",
  lastName: "Studio",
  name: "Luverse",
  role: "Full Stack Developer",
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
  featured: {
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
  title: `About – ${person.name}`,
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
    display: true,
    title: "소개",
    description: (
      <>
        만들고 싶은거 다 만드는걸 좋아하는 걸 한참 좋아할 나이
        <br />
      </>
    ),
  },
  work: {
    display: false,
    title: "",
    experiences: [],
  },
  // work: {
  //   display: true,
  //   title: "프로젝트",
  //   experiences: [
  //     {
  //       company: "Moring",
  //       timeframe: "진행 중",
  //       role: "Web Service",
  //       achievements: [
  //         <>
  //           게시물, 커뮤니티, 프로필, 메시지, 알림과 계정 기능을 갖춘 서비스를
  //           직접 설계하고 개발했습니다.
  //         </>,
  //         <>
  //           현재는 콘텐츠를 매거진처럼 만들고 공유하는 서비스로 제품 방향을
  //           다듬고 있습니다.
  //         </>,
  //       ],
  //       images: [],
  //     },
  //     {
  //       company: "Mori · Source2Visual",
  //       timeframe: "진행 중",
  //       role: "AI Content System",
  //       achievements: [
  //         <>
  //           자료를 업로드하면 내용을 분석하고 학습용 화면과 HTML 결과물로
  //           만드는 파이프라인을 개발했습니다.
  //         </>,
  //         <>
  //           검색, 파일 처리, 결과 검증, 버전 관리와 멀티 에이전트 실행 구조를
  //           함께 설계했습니다.
  //         </>,
  //       ],
  //       images: [],
  //     },
  //     {
  //       company: "Hermes Agent",
  //       timeframe: "진행 중",
  //       role: "Discord AI Agent",
  //       achievements: [
  //         <>
  //           Discord에서 음악 재생, 서버 관리와 Moring 계정 연동을 처리하는
  //           기능을 확장했습니다.
  //         </>,
  //         <>
  //           관리 권한을 AI의 판단에 맡기지 않고 계정과 Discord 사용자 정보를
  //           기준으로 시스템에서 차단하도록 설계했습니다.
  //         </>,
  //       ],
  //       images: [],
  //     },
  //     {
  //       company: "MATIS",
  //       timeframe: "개발 중",
  //       role: "Developer Tool",
  //       achievements: [
  //         <>
  //           여러 AI 코딩 도구에 작업을 나누고 진행 상태와 결과를 관리하는
  //           개발 오케스트레이터입니다.
  //         </>,
  //         <>
  //           작업 계약, 독립 작업 공간, 실행 증거와 완료 판정을 중심으로
  //           구조를 설계했습니다.
  //         </>,
  //       ],
  //       images: [],
  //     },
  //     {
  //       company: "개인 저장 앱",
  //       timeframe: "개발 중",
  //       role: "Android App",
  //       achievements: [
  //         <>
  //           다른 앱에서 공유한 링크와 파일을 저장하고 폴더, 메모, 할 일과
  //           알림으로 정리하는 앱을 만들고 있습니다.
  //         </>,
  //         <>
  //           공유 오버레이, 파일 처리, 다운로드와 Supabase 동기화 기능을
  //           함께 개발하고 있습니다.
  //         </>,
  //       ],
  //       images: [],
  //     },
  //   ],
  // },
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
      src: "/images/og/home.png",
      alt: "Luverse portfolio preview",
      orientation: "vertical",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };