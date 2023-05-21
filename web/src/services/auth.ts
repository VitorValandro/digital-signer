export const TOKEN_KEY = "@user-Token";
export const USER_KEY = "@user-Email";
export const USER_ID = "@user-Identifier";
export const TOKEN_CHECKIN = "@team-Token-CheckInDate";

export const isAuthenticated = () => {
  const OneDayFromNow = new Date().getTime() + (1 * 8 * 60 * 60 * 1000)
  return localStorage.getItem(TOKEN_KEY) !== null && Number(localStorage.getItem(TOKEN_CHECKIN)) < OneDayFromNow;
}
export const getUserThatIsAuthenticated = () => localStorage.getItem(USER_KEY);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUserId = () => localStorage.getItem(USER_ID);

export const login = (token: string, email: string, id: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, email);
  localStorage.setItem(USER_ID, id);
  localStorage.setItem(TOKEN_CHECKIN, Date.now().toString());
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_ID);
  localStorage.removeItem(TOKEN_CHECKIN);
};