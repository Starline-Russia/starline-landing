export interface NavigationItem {
  label: string;
  href: string;
}

export interface HeroArtifact {
  value: string;
  label: string;
  detail: string;
}

export interface AboutContent {
  title: string;
  story: string[];
  groupContext: string[];
}

export const brand = "STARLINE";

export const navigation: NavigationItem[] = [
  { label: "Система", href: "#system" },
  { label: "Экономика", href: "#economics" },
  { label: "Кейсы", href: "#cases" },
];

export const hero = {
  title: "Рост e-commerce — это система, а не набор каналов.",
  description:
    "Соединяем стратегию, продукт, performance и аналитику, чтобы рост стал управляемым.",
  primaryAction: { label: "Запросить аудит роста", href: "#lead" },
  secondaryAction: { label: "Посмотреть систему", href: "#system" },
} as const;

export const heroArtifacts: HeroArtifact[] = [
  { value: "10+", label: "лет", detail: "в e-commerce" },
  { value: "50+", label: "каналов", detail: "привлечения" },
  { value: "19", label: "каналов", detail: "продаж" },
  { value: "Последняя", label: "когорта", detail: "в фокусе" },
];

export const about: AboutContent = {
  title: "О нас",
  story: [
    "Starline - команда профессионалов с опытом работы в ведущих performance-агентствах и западных технологических компаниях.",
    "За десятилетия работы каждый прошел путь с нуля до управленческих позиций.",
    "Знаем изнутри, как работать с крупнейшими рекламодателями в различных отраслях, все тонкости процессов создания и ведения рекламных кампаний, особенности проведения тендеров и нюансы клиентского сервиса.",
    "Понимаем, как performance встраивается в маркетинговую воронку, какие задачи решает и какие стратегии будут наиболее эффективны для поставленных задач.",
    "Впитав все лучшие подходы к построению команд, разработке стратегий, созданию лучшего клиентского сервиса мы горим желанием переосмыслить этот процесс и добавить свежий взгляд.",
    "2026 год - точка пересборки для многих компаний, поэтому мы находимся в правильное время в правильном месте.",
  ],
  groupContext: [
    "Агентство Старлайн создано в рамках гк Старлинк.",
    "Ресурсы, возможности и опыт группы компаний позволит реализовать все задуманные идеи в полной мере.",
  ],
};
