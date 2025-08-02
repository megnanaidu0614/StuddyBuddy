function findFolderByPath(folders, folderPath) {
  if (!folderPath || folderPath.length === 0) return null;
  let current = folders.id(folderPath[0]);
  for (let i = 1; i < folderPath.length; i++) {
    if (!current || !current.folders) return null;
    current = current.folders.id(folderPath[i]);
  }
  return current;
}
module.exports = { findFolderByPath };