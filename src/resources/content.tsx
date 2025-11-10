import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Logo, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "Luverse",
  lastName: "Studio",
  name: `Luverse`,
  role: "Design Engineer",
  avatar: "/images/avatar.png",
  email: "me@louis1618.shop",
  location: "Asia/Seoul", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["Korean", "English"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter: Newsletter = {
  display: false,
  title: <>Subscribe to Newsletter</>,
  description: <>Updates and insights</>,
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
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
  title: `${person.name} 포트폴리오`,
  description: `Portfolio website showcasing my work`,
  headline: <>Creative Design & Development</>,
  featured: {
    display: true,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Luverse</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Services
        </Text>
      </Row>
    ),
    href: "/work",
  },
  subline: (
    <>
      IT & Software
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}`,
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
        창의적인 디자인과 혁신적인 개발을 통해 뛰어난 디지털 경험을 만들어갑니다.
      </>
    ),
  },
  work: {
    display: false,
    title: "경력",
    experiences: [],
  },
  studies: {
    display: false,
    title: "학력",
    institutions: [],
  },
  technical: {
    display: true,
    title: "기술 스택",
    skills: [
      {
        title: "Design",
        description: (
          <>UI/UX 디자인 및 프로토타이핑</>
        ),
        tags: [
          {
            name: "Figma",
            icon: "figma",
          },
        ],
        images: [],
      },
      {
        title: "Development",
        description: (
          <>웹 애플리케이션 개발</>
        ),
        tags: [
          {
            name: "Next.js",
            icon: "nextjs",
          },
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
  description: `최근 작업과 생각들`,
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: `작업물`,
  description: `디자인 및 개발 프로젝트`,
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `갤러리`,
  description: `사진 모음`,
  images: [{
      src: "/images/og/home.png",
      alt: "image",
      orientation: "vertical",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };
