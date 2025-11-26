import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery(
    ["project", id],
    async () => {
      const res = await apiClient.get(`/projects/${id}`);
      return res.data;
    },
    { enabled: !!id }
  );

  if (isLoading) return <div>Loading project...</div>;
  if (error) return <div className="text-error">Failed to load project</div>;

  const project = data?.project || data;

  return (
    <div>
      <h1 className="text-2xl font-semibold">{project?.name || "Project"}</h1>
      <p className="opacity-70">Client: {project?.clientId}</p>
    </div>
  );
};

export default ProjectDetailPage;
