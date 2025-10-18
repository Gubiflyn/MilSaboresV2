export const publicUrl = (path) => {
  if (!path) return "";
  return `${import.meta.env.BASE_URL}${String(path).replace(/^\//, "")}`;
};
