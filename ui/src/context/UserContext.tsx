// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";

// // Define the type for UserContext
// interface UserContextType {
//   userType: string | null;
//   setUserType: React.Dispatch<React.SetStateAction<string | null>>;
// }

// // Create the Context with an initial value of undefined
// const UserContext = createContext<UserContextType | undefined>(undefined);

// export const UserProvider: React.FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const [userType, setUserType] = useState<string | null>(null);

//   useEffect(() => {
//     const userType = JSON.parse(sessionStorage.getItem("userData"))?.userType;
//     if (userType) {
//       setUserType(userType);
//     }
//   }, []);

//   return (
//     <UserContext.Provider value={{ userType, setUserType }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// // Custom hook to use the UserContext
// export const useUser = (): UserContextType => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error("useUser must be used within a UserProvider");
//   }
//   return context;
// };

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define the type for UserContext
interface UserContextType {
  userType: string | null;
  setUserType: React.Dispatch<React.SetStateAction<string | null>>;
}

// Create the Context with an initial value of undefined
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const userData = sessionStorage.getItem("userData");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData?.userType) {
        setUserType(parsedUserData.userType);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ userType, setUserType }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
// eslint-disable-next-line react-refresh/only-export-components
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  if (context.userType == null || context.userType == undefined) {
    const userData = JSON.parse(sessionStorage.getItem("userData"));

    context.userType = userData?.userType;
  }
  return context;
};
