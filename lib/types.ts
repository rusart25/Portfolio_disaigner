export interface Project {
  id: string
  title: string
  titleRu: string
  description: string
  descriptionRu: string
  category: "photography" | "design"
  tags: string[]
  image: string
  featured: boolean
  createdAt: string
}

export interface ProjectsData {
  projects: Project[]
}
