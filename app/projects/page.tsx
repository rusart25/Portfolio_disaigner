"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/LanguageContext"
import { translations } from "@/lib/translations"
import type { Project } from "@/lib/types"
import styles from "./projects.module.css"

export default function ProjectsPage() {
  const { language } = useLanguage()
  const t = translations[language]
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const categories = ["all", ...Array.from(new Set(projects.map((p) => p.category)))]
  const filteredProjects = filter === "all" ? projects : projects.filter((p) => p.category === filter)

  const categoryLabels: Record<string, Record<string, string>> = {
    en: {
      all: "All",
      "web-design": "Web Design",
      branding: "Branding",
      photography: "Photography",
      "ui-ux": "UI/UX",
    },
    ru: {
      all: "Все",
      "web-design": "Веб-дизайн",
      branding: "Брендинг",
      photography: "Фотография",
      "ui-ux": "UI/UX",
    },
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {language === "ru" ? "На главную" : "Back to Home"}
        </Link>
        <h1 className={styles.title}>{language === "ru" ? "Проекты" : "Projects"}</h1>
        <p className={styles.subtitle}>
          {language === "ru"
            ? "Мои работы в области дизайна и фотографии"
            : "My work in design and photography"}
        </p>
      </header>

      <div className={styles.filters}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${filter === cat ? styles.active : ""}`}
            onClick={() => setFilter(cat)}
          >
            {categoryLabels[language][cat] || cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>{language === "ru" ? "Загрузка..." : "Loading..."}</div>
      ) : (
        <div className={styles.grid}>
          {filteredProjects.map((project) => (
            <article key={project.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.title[language]}
                  fill
                  className={styles.image}
                />
                <div className={styles.overlay}>
                  <span className={styles.category}>
                    {categoryLabels[language][project.category] || project.category}
                  </span>
                </div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{project.title[language]}</h3>
                <p className={styles.description}>{project.description[language]}</p>
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    {language === "ru" ? "Смотреть проект" : "View Project"}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <div className={styles.empty}>
          {language === "ru" ? "Проекты не найдены" : "No projects found"}
        </div>
      )}
    </div>
  )
}
