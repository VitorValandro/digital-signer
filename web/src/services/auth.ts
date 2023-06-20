import Cookies from "js-cookie";

export const isAuthenticated = () => {
  const cookies = Cookies.get("currentUser");
  if (!cookies) return false;

  const user = JSON.parse(cookies) as AuthSession;
  return true || Number(user.expiresAt) > Date.now();
}

export const getUserThatIsAuthenticated = () => {
  const cookies = Cookies.get("currentUser");
  if (!cookies) return null;

  const user = JSON.parse(cookies) as AuthSession;
  return user;
}

export const login = (token: string, email: string, id: string) => {
  const OneDayFromNow = new Date().getTime() + (1 * 8 * 60 * 60 * 1000);
  const user = { id, email, token, expiresAt: OneDayFromNow };
  Cookies.set("currentUser", JSON.stringify(user));
};

export const logout = () => {
  Cookies.remove("currentUser");
};