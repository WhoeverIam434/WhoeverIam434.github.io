export const profile = {
  name: "Cheuk Hin Li",
  role: "Robotics engineer — embedded firmware · motion control · localisation",
  location: "Hong Kong",
  timezone: "UTC+8",
  email: "marcoli434ovo@gmail.com",
  phone: "+852 6506 3916",
  phoneHref: "+85265063916",
  availability: "Open to 2026 winter internships — embedded & robotics software",
  github: "", // add a URL to render the link
  linkedin: "", // add a URL to render the link
  cv: "/Cheuk_Hin_Li_-_Robotics_Engineer.pdf",
  summary:
    "I write firmware that makes machines move, and control loops that make them move well. At HKUST's Robotics Team I develop C firmware for STM32F407 microcontrollers — sensor interfaces, motor control and the integration work between subteams — and I built the climbing mechanism and localisation stack for the War Dragon robot at ABU Robocon 2026. I'm currently researching magnetic tactile sensors at Mevita Robotics Lab.",
} as const;

export type Stat = {
  value: string;
  label: string;
};

export const stats: Stat[] = [
  { value: "121%", label: "Climbing speed increase" },
  { value: "20,000+", label: "Lines of data migrated" },
  { value: "15+", label: "CAN nodes at 1 Mbps" },
  { value: "0.4–1.1%", label: "Position error per metre" },
];

export type FocusArea = {
  index: string;
  title: string;
  description: string;
  tags: string[];
};

export const focusAreas: FocusArea[] = [
  {
    index: "R",
    title: "Robotics",
    description:
      "Competition robots end to end: mechanism design, embedded control, and the integration work that turns separate subteams into one machine that runs under match pressure.",
    tags: ["ABU Robocon 2026", "Mechanism design", "System integration"],
  },
  {
    index: "E",
    title: "Embedded",
    description:
      "Bare-metal C on STM32F407: sensor interfaces over CAN, I²C, SPI and UART, motor command dispatch, and firmware that stays deterministic when the bus gets busy.",
    tags: ["STM32F407", "CAN / VESC", "C"],
  },
  {
    index: "C",
    title: "Control Systems",
    description:
      "Modelling the plant before tuning the loop: PID and state feedback, sensor fusion, and knowing where a linearised model stops being true.",
    tags: ["PID", "State estimation", "Madgwick filter"],
  },
];

export type ExperienceEntry = {
  role: string;
  org: string;
  period: string;
  kind: string;
  bullets: string[];
  tags: string[];
};

export const experience: ExperienceEntry[] = [
  {
    role: "Embedded Software Developer",
    org: "HKUST Robotics Team",
    period: "Sept 2025 — Jun 2026",
    kind: "Team",
    bullets: [
      "Develop embedded firmware in C for STM32F407 microcontrollers, including sensor interfaces and motor control.",
      "Designed and implemented the climbing mechanism for the War Dragon robot.",
      "Solved the motor overheating problem and the angle-rounding error of the climbing mechanism, increasing climbing speed by over 121%.",
      "Collaborate with mechanical and hardware subteams using Git-based workflows for integration and code reviews.",
    ],
    tags: ["STM32F407", "C", "Motor control", "Git"],
  },
  {
    role: "Software Engineer Intern",
    org: "Hong Kong Broadband",
    period: "Jun 2026 — Aug 2026",
    kind: "Internship",
    bullets: [
      "Automated the migration and validation of 20,000+ lines of financial data from an on-premise ERP to NetSuite via Python and CSV processing.",
    ],
    tags: ["Python", "CSV pipelines", "ERP → NetSuite", "Validation"],
  },
  {
    role: "Undergraduate Researcher",
    org: "Mevita Robotics Lab",
    period: "Present",
    kind: "Research",
    bullets: [
      "Researching magnetic tactile sensors — sensing hardware, signal processing and embedded readout.",
    ],
    tags: ["Tactile sensing", "Signal processing", "Embedded"],
  },
];

export type Project = {
  name: string;
  meta: string;
  subtitle: string;
  bullets: string[];
  tags: string[];
};

export const featuredProject: Project = {
  name: "War Dragon",
  meta: "ABU Robocon 2026 · local competition",
  subtitle: "Competition robot for the ABU Robocon 2026 local competition.",
  bullets: [
    "Embedded firmware in C for STM32F407, handling sensor interfaces, motor command dispatch and multi-axis coordination.",
    "Generated trapezoidal velocity profiles for the rack-and-pinion lifting mechanism, issuing position setpoints to VESC-driven motors.",
    "Leveraged VESC's native position PID with FOC for inner-loop control, separating trajectory generation (STM32) from current/position loops (VESC).",
    "Diagnosed CAN bus saturation in a multi-motor setup and mitigated it by condensing feedback values, sustaining 1 Mbps across more than 15 nodes.",
    "Implemented robot localisation fusing a 6-axis IMU through a Madgwick filter with magnetic-encoder positioning — 0.4°–2° attitude drift per cycle and 0.4–1.1% position error per metre.",
  ],
  tags: ["STM32F407", "VESC", "CAN", "FOC", "Madgwick", "Encoder fusion"],
};

export const otherProjects = [
  {
    name: "Magnetic tactile sensors",
    meta: "Mevita Robotics Lab · ongoing",
    description:
      "Research on magnetic tactile sensing: how a magnet–elastomer pair can be read out as a force signal, and how that signal can be processed on embedded hardware.",
    tags: ["Sensing", "Signal processing"],
  },
  {
    name: "ERP → NetSuite migration",
    meta: "Hong Kong Broadband · 2026",
    description:
      "Automated migration and validation of 20,000+ lines of financial data between an on-premise ERP and NetSuite using Python and CSV processing.",
    tags: ["Python", "Automation", "Validation"],
  },
];

export type SkillGroup = {
  label: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  { label: "Languages", items: ["C", "C++", "Java", "Python", "JavaScript"] },
  {
    label: "Embedded",
    items: ["STM32F407", "Arduino", "CAN", "I²C", "SPI", "UART", "VESC"],
  },
  {
    label: "Robotics & control",
    items: ["PID", "Sensor fusion", "State estimation", "FSM"],
  },
  { label: "Tools", items: ["Git", "Bash", "Linux", "PyTorch (foundational)"] },
];

export const education = {
  degree: "BEng in Computer Science",
  extra: "Extended major in Artificial Intelligence",
  school: "The Hong Kong University of Science and Technology",
  period: "Sept 2024 — Jun 2028",
  note: "Expected graduation Jun 2028",
  courses: [
    "Design and Analysis of Algorithms",
    "Reinforcement Learning",
    "System Modeling, Analysis and Control",
  ],
  honors: "Honors — Design and Analysis of Algorithms",
};
