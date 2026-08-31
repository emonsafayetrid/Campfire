import client from "./client";

export const getTasks = (projectId) =>
  client.get(`/tasks/${projectId}`);

export const getTaskById = (projectId, taskId) =>
  client.get(`/tasks/${projectId}/t/${taskId}`);

// data may be a FormData instance (for attachments) or a plain object.
export const createTask = (projectId, data) => {
  const isFormData = data instanceof FormData;
  return client.post(`/tasks/${projectId}`, data, {
    headers: isFormData
      ? { "Content-Type": "multipart/form-data" }
      : undefined,
  });
};

export const updateTask = (projectId, taskId, data) => {
  const isFormData = data instanceof FormData;
  return client.put(`/tasks/${projectId}/t/${taskId}`, data, {
    headers: isFormData
      ? { "Content-Type": "multipart/form-data" }
      : undefined,
  });
};

export const deleteTask = (projectId, taskId) =>
  client.delete(`/tasks/${projectId}/t/${taskId}`);

export const createSubTask = (projectId, taskId, title) =>
  client.post(`/tasks/${projectId}/t/${taskId}/subtasks`, { title });

export const updateSubTask = (projectId, taskId, subTaskId, data) =>
  client.put(
    `/tasks/${projectId}/t/${taskId}/subtasks/${subTaskId}`,
    data
  );

export const deleteSubTask = (projectId, taskId, subTaskId) =>
  client.delete(
    `/tasks/${projectId}/t/${taskId}/subtasks/${subTaskId}`
  );
