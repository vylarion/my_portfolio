import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Home } from "../pages/home/index.jsx";
import { Projects } from "../pages/projects/index.jsx";
import { ContactUs } from "../pages/contact/index.jsx";
import { About } from "../pages/about/index.jsx";
import { ScanResults } from "../pages/scanresults/index.jsx";
import { NotFound } from "../pages/notfound/index.jsx";
import { Socialicons } from "../components/socialicons/index.jsx";
import { CSSTransition, TransitionGroup } from "react-transition-group";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={location.pathname}
        timeout={400}
        classNames="page"
        unmountOnExit
      >
        <div className="page-wrap">
          <Routes location={location}>
            <Route exact path="/" element={<Home />} />
            <Route path="/scan-results" element={<ScanResults />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
}

function AppRoutes() {
  return (
    <div className="s_c">
      <AnimatedRoutes />
      <Socialicons />
    </div>
  );
}

export default AppRoutes;
