import type { ImageMetadata } from "astro";
import fintechImage from "../assets/cases/fintech-growth.png";
import realEstateImage from "../assets/cases/real-estate-growth.png";

export interface TaskItem {
  title: string;
  description: string;
  icon: "cart" | "cost" | "gmv" | "channels" | "retargeting" | "scale";
}

export interface ServiceItem {
  title: string;
  description: string;
  tools: string[];
}

export interface CaseStudy {
  category: string;
  title: string;
  metric: string;
  metricLabel: string;
  points: string[];
  quote: string;
  image: ImageMetadata;
  imageAlt: string;
  width: number;
  height: number;
}

export const tasks: TaskItem[] = [
  {
    title: "Продаж недостаточно",
    description: "Реклама и трафик есть, но новых клиентов и продаж недостаточно для роста бизнеса.",
    icon: "cart",
  },
  {
    title: "Привлечение дорожает",
    description: "CPA растёт, каналы насыщаются, а привычная оптимизация перестаёт давать заметный эффект.",
    icon: "cost",
  },
  {
    title: "GMV не следует за атрибуцией",
    description: "Отчёты выглядят лучше, но общий оборот электронной коммерции почти не меняется.",
    icon: "gmv",
  },
  {
    title: "Не видно рабочих каналов",
    description: "Сложно отделить каналы нового спроса от тех, что перераспределяют старых пользователей.",
    icon: "channels",
  },
  {
    title: "Ретаргетинг маскирует результат",
    description: "Старые когорты и повторные покупки создают ложное ощущение эффективности рекламы.",
    icon: "retargeting",
  },
  {
    title: "Масштабировать рискованно",
    description: "Без когортной экономики увеличение бюджета выглядит риском, а не управляемой инвестицией.",
    icon: "scale",
  },
];

export const services: ServiceItem[] = [
  {
    title: "Performance",
    description: "Строим привлечение вокруг качества последней когорты, а не только стоимости конверсии.",
    tools: ["Яндекс.Директ", "ВК", "CPA"],
  },
  {
    title: "Мобильная реклама",
    description: "Новые пользователи в ваше мобильное приложение",
    tools: ["inApp", "DSP", "ASO"],
  },
  {
    title: "Media и OLV",
    description: "Brandformance-подход для формирования верха воронки и повышения знания бренда",
    tools: ["Programmatic", "Media", "Спецпроекты"],
  },
  {
    title: "Retail Media",
    description: "Performance-продвижение карточек товара и outclick-реклама",
    tools: ["Ozon", "RWB", "X5 Media", "Magnit Ads"],
  },
  {
    title: "SEO и GEO",
    description: "Растим органическую видимость в поиске и AI-ответах, где уже существует спрос.",
    tools: ["SEO", "GEO", "Контент", "Техническая оптимизация"],
  },
  {
    title: "AI-Assisted аналитика",
    description: "Создаем для каждого проекта интерактивные кастомизированные отчеты и дашборды в реальном времени",
    tools: ["LLM-Отчетность", "Дашборды", "BI", "Яндекс.Метрика"],
  },
];

export const industries = [
  "E-commerce",
  "Fintech",
  "Travel",
  "Real estate",
  "Fashion",
  "Online services",
  "Food delivery",
];

export const processSteps = [
  {
    title: "Аудит",
    text: "Изучаем рекламу, когорты, каналы продаж, GMV, CPA, ДРР и структуру новых клиентов.",
    result: "Карта точек роста и ограничений",
  },
  {
    title: "Пилот",
    text: "Проверяем гипотезы роста последней когорты на контролируемом наборе каналов.",
    result: "Подтверждённая экономика гипотез",
  },
  {
    title: "Масштабирование",
    text: "Расширяем работающие каналы и подключаем прогнозирование экономики.",
    result: "Управляемая система роста",
  },
];

export const palitraAreas = [
  { title: "Оптимизация", text: "Находит отклонения, точки роста и сигналы неэффективности." },
  { title: "Генерация контента", text: "Создаёт варианты с учётом контекста, аудитории и целей кампании." },
  { title: "Отчётность", text: "Структурирует данные и превращает их в понятные выводы." },
  { title: "Прогноз и бюджеты", text: "Моделирует сценарии и помогает распределять инвестиции." },
];

export const cases: CaseStudy[] = [
  {
    category: "Fintech",
    title: "Банк федерального масштаба",
    metric: "5–10×",
    metricLabel: "изменился CPA при переходе к качественному привлечению",
    points: ["Применили когортный подход", "15 тестов за 2 месяца", "HADI-циклы как основа роста показателей"],
    quote: "Кейс привёл к пяти годам плотной эффективной работы.",
    image: fintechImage,
    imageAlt: "Абстрактные потоки данных сходятся в устойчивую траекторию роста",
    width: 1448,
    height: 1086,
  },
  {
    category: "Real estate",
    title: "Недвижимость бизнес-класса",
    metric: "+30%",
    metricLabel: "рост GMV год к году при сопоставимых внешних факторах",
    points: ["Связали маркетинг с бизнес-результатом", "Сфокусировались на работающих гипотезах"],
    quote: "Результат помог перезапустить маркетинг для серии объектов в новом сложном регионе.",
    image: realEstateImage,
    imageAlt: "Абстрактный городской ландшафт с направленной траекторией роста",
    width: 1448,
    height: 1086,
  },
];
