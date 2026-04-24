"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/lib/types"
import styles from "./admin.module.css"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  const emptyProject: Omit<Project, "id"> = {
    title: { en: "", ru: "" },
    description: { en: "", ru: "" },
    category: "web-design",
    image: "/placeholder.svg",
    link: "",
  }

  const [formData, setFormData] = useState<Omit<Project, "id">>(emptyProject)

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth")
    if (auth === "true") {
      setIsAuthenticated(true)
      fetchProjects()
    }
  }, [])

  const fetchProjects = async () => {
    const res = await fetch("/api/projects")
    const data = await res.json()
    setProjects(data)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        sessionStorage.setItem("admin_auth", "true")
        setIsAuthenticated(true)
        fetchProjects()
      } else {
        setError("Неверный пароль / Invalid password")
      }
    } catch {
      setError("Ошибка подключения / Connection error")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth")
    setIsAuthenticated(false)
    setPassword("")
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const method = editingProject ? "PUT" : "POST"
      const body = editingProject
        ? { ...formData, id: editingProject.id }
        : { ...formData, id: Date.now().toString() }

      await fetch("/api/admin/projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      await fetchProjects()
      setEditingProject(null)
      setIsAdding(false)
      setFormData(emptyProject)
    } catch (err) {
      console.error("Save error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить проект? / Delete project?")) return

    setLoading(true)
    try {
      await fetch("/api/admin/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      await fetchProjects()
    } catch (err) {
      console.error("Delete error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      image: project.image,
      link: project.link || "",
    })
    setIsAdding(false)
  }

  const handleAdd = () => {
    setIsAdding(true)
    setEditingProject(null)
    setFormData(emptyProject)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingProject(null)
    setFormData(emptyProject)
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <h1 className={styles.loginTitle}>Admin Panel</h1>
          <p className={styles.loginSubtitle}>Введите пароль / Enter password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={styles.input}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "..." : "Войти / Login"}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Управление проектами / Project Management</h1>
        <div className={styles.headerActions}>
          <button onClick={handleAdd} className={styles.addBtn}>
            + Добавить / Add
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Выйти / Logout
          </button>
        </div>
      </header>

      {(isAdding || editingProject) && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {editingProject ? "Редактировать / Edit" : "Новый проект / New Project"}
          </h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Title (EN)</label>
              <input
                type="text"
                value={formData.title.en}
                onChange={(e) =>
                  setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })
                }
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Название (RU)</label>
              <input
                type="text"
                value={formData.title.ru}
                onChange={(e) =>
                  setFormData({ ...formData, title: { ...formData.title, ru: e.target.value } })
                }
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description (EN)</label>
              <textarea
                value={formData.description.en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: { ...formData.description, en: e.target.value },
                  })
                }
                className={styles.textarea}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Описание (RU)</label>
              <textarea
                value={formData.description.ru}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: { ...formData.description, ru: e.target.value },
                  })
                }
                className={styles.textarea}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={styles.select}
              >
                <option value="web-design">Web Design</option>
                <option value="branding">Branding</option>
                <option value="photography">Photography</option>
                <option value="ui-ux">UI/UX</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Image URL</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Project Link</label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className={styles.input}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <button onClick={handleCancel} className={styles.cancelBtn}>
              Отмена / Cancel
            </button>
            <button onClick={handleSave} className={styles.saveBtn} disabled={loading}>
              {loading ? "..." : "Сохранить / Save"}
            </button>
          </div>
        </div>
      )}

      <div className={styles.projectsList}>
        {projects.map((project) => (
          <div key={project.id} className={styles.projectCard}>
            <div className={styles.projectInfo}>
              <h3>{project.title.ru || project.title.en}</h3>
              <span className={styles.projectCategory}>{project.category}</span>
            </div>
            <div className={styles.projectActions}>
              <button onClick={() => handleEdit(project)} className={styles.editBtn}>
                Редактировать
              </button>
              <button onClick={() => handleDelete(project.id)} className={styles.deleteBtn}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
