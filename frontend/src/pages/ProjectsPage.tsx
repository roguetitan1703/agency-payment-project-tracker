import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";
import { Project } from "../types";

const fetchProjects = async (): Promise<Project[]> => {
  const res = await apiClient.get("/projects");
  return res.data.projects || res.data;
};

const ProjectsPage: React.FC = () => {
  const { data, isLoading, error } = useQuery(["projects"], fetchProjects);

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div className="text-error">Failed to load projects</div>;

  const projects = data as Project[];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Projects</h1>
      <div className="space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="card p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm opacity-70">{p.tags?.join(", ")}</div>
              </div>
              <div className="text-sm">{p.totalAmount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
