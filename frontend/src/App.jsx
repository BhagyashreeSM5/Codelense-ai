import { useState } from "react";
import UploadPanel from "./components/UploadPanel";
import Dashboard from "./pages/Dashboard";
import "./index.css";

function App() {
  const [codebaseData, setCodebaseData] = useState(null);

  return (
    <>
      {!codebaseData ? (
        <UploadPanel onUploadSuccess={setCodebaseData} />
      ) : (
        <Dashboard
          data={codebaseData}
          onReset={() => setCodebaseData(null)}
        />
      )}
    </>
  );
}

export default App;