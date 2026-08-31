import client from "./client";

export const getProjects = () => client.get("/projects");

export const getProjectById = (projectId) =>
  client.get(`/projects/${projectId}`);

export const createProject = (data) =>
  client.post("/projects", data);

export const updateProject = (projectId, data) =>
  client.put(`/projects/${projectId}`, data);

export const deleteProject = (projectId) =>
  client.delete(`/projects/${projectId}`);

export const getProjectMembers = (projectId) =>
  client.get(`/projects/${projectId}/members`);

export const addMemberToProject = (projectId, data) =>
  client.post(`/projects/${projectId}/members`, data);

export const updateMemberRole = (projectId, userId, newrole) =>
  client.put(`/projects/${projectId}/members/${userId}`, { newrole });

export const removeMember = (projectId, userId) =>
  client.delete(`/projects/${projectId}/members/${userId}`);
