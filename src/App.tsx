import React, { memo, StrictMode, Suspense } from "react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { routers } from "./views/routes";

const App: React.FC = () => {
  const rotes = useRoutes(routers);
  return rotes;
};

const AppWrapper = () => {
  return (
    <StrictMode>
      <Suspense fallback={<div>Loading...</div>}>
        <Router>
          <App />
        </Router>
      </Suspense>
    </StrictMode>
  );
};

export default memo(AppWrapper);
