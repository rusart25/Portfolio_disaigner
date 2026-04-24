import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "projects.json")
    const data = await fs.readFile(filePath, "utf-8")
    const projects = JSON.parse(data)
    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error reading projects:", error)
    return NextResponse.json([])
  }
}
