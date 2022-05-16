import { createContext, useContext, useEffect, useState } from "react";

const context = createContext();
const Provider = context.Provider;

const GlobalStateProvider = ({ children }) => {
  const [lastDocumentsCreated, setLastDocumentsCreated] = useState([]);

  const hydrateLastDocuments = () => {
    const lastDocuments = localStorage.getItem("lastDocuments");
    if (lastDocuments) {
      setLastDocumentsCreated(JSON.parse(lastDocuments));
    }
  }

 const saveLastDocuments = (documents) => {
   setLastDocumentsCreated((prev) => {
     return [...prev, ...documents];
   })
    localStorage.setItem("lastDocuments", JSON.stringify(documents));
 }

  useEffect(() => {
    hydrateLastDocuments();
  }, [])

  return (
    <Provider
      value={{
        lastDocumentsCreated,
        saveLastDocuments,
      }}
    >
      { children }
    </Provider>
  )
}

function useGlobalState() {
  return useContext(context);
}


export { GlobalStateProvider, useGlobalState };