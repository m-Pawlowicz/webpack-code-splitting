import { createRoot } from "react-dom/client";
import { lazy, Suspense, useState } from "react";

const TestLazyImport = lazy(() => import("./Test"));

const App = () => {
  "asdf";
  const [enabled, setEnabled] = useState(false);

  function loadLodash() {
    import("lodash/isEqual").then((module) => {
      const isEqual = module.default;
      console.log(isEqual({ abc: 123 }, { abc: 123 }));
    });
  }

  console.log('dupaaaaasdfasdfas')

  return (
    <div>
      abcdecvbcvf
      <button style={{display: 'block'}} onClick={() => setEnabled(!enabled)}>
        click to import
      </button>
      {enabled && (
        <Suspense>
          <TestLazyImport />
        </Suspense>
      )}
      <button onClick={loadLodash}>use lodash</button>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
