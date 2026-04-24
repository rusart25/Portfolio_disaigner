import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { Project } from "@/lib/types"

const dataPath = path.join(process.cwd(), "data", "projects.json")

async function readProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(dataPath, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeProjects(projects: Project[]): Promise<void> {
  await fs.writeFile(dataPath, JSON.stringify(projects, null, 2), "utf-8")
}

export async function POST(request: Request) {
  try {
    const project: Project = await request.json()
    const projects = await readProjects()
    projects.push(project)
    await writeProjects(projects)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding project:", error)
    return NextResponse.json({ error: "Failed to add project" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const updatedProject: Project = await request.json()
    const projects = await readProjects()
    const index = projects.findIndex((p) => p.id === updatedProject.id)

    if (index === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    projects[index] = updatedProject
    await writeProjects(projects)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    const projects = await readProjects()
    const filtered = projects.filter((p) => p.id !== id)
    await writeProjects(filtered)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
