import React, {ReactNode, createContext, useContext, useState} from "react";

type UserContextProps = {
  user: User | undefined;
  setUser: (user: User) => void;
};

const UserContext = createContext<UserContextProps>({
  user: undefined,
  setUser: (user: User) => null,
});

export const useUserContext = () => useContext(UserContext);

export default function UserContextProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User>();

  return (
    <>
      <UserContext.Provider
        value={{
          user,
          setUser,
        }}
      >
        {children}
      </UserContext.Provider>
    </>
  );
}
