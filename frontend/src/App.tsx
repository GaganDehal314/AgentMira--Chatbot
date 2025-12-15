import { useEffect, useState } from "react";
import { Chat } from "./components/Chat";
import { SavedList } from "./components/SavedList";
import { getSaved, deleteSaved, saveProperty } from "./services/api";
import { Property } from "./types";
import { Compare } from "./components/Compare";

function App() {
  const [saved, setSaved] = useState<Property[]>([]);
  const userId = localStorage.getItem("userId") || "demo-user";

  useEffect(() => {
    localStorage.setItem("userId", userId);
    refresh();
  }, []);

  const refresh = async () => {
    const data = await getSaved(userId);
    setSaved(data);
  };

  const handleSave = async (id: string) => {
    await saveProperty(userId, id);
    await refresh();
  };

  const handleUnsave = async (id: string) => {
    await deleteSaved(userId, id);
    await refresh();
  };

  return (
    <div className="app-shell">
      <h1>Real Estate Chatbot</h1>
      <p>Ask for homes by budget, location, beds/baths, or amenities.</p>
      <Compare />
      <Chat saved={saved} onSave={handleSave} onUnsave={handleUnsave} onRefreshSaved={refresh} />
      <SavedList saved={saved} onUnsave={handleUnsave} />
    </div>
  );
}

export default App;

