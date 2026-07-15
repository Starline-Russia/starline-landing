export interface NavigationItem {
  label: string;
  href: string;
}

export interface HeroArtifact {
  value: string;
  label: string;
  detail: string;
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
