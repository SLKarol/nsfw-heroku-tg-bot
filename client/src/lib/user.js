/**
 * Текущий пользователь авторизован?
 */
export const currentUserHasLogin = () => {
  const storage = window.localStorage;
  const token = storage.getItem("token");
  const expiryDate = storage.getItem("expiryDate");
  if (!token || !expiryDate) {
    return false;
  }
  if (new Date(expiryDate) <= new Date()) {
    localStorage.removeItem("token");
    localStorage.removeItem("expiryDate");
    localStorage.removeItem("userId");
    return false;
  }
  return true;
};
