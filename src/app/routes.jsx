import React from "react";
import { Route, Routes } from "react-router-dom";
import withRouter from "../hooks/withRouter.jsx"
import { Home } from "../pages/home/index.jsx";
import { Projects } from "../pages/projects/index.jsx";
import { ContactUs } from "../pages/contact/index.jsx";
import { About } from "../pages/about/index.jsx";
import { ScanResults } from "../pages/scanresults/index.jsx";
import { Socialicons } from "../components/socialicons/index.jsx";
import { CSSTransition, TransitionGroup } from "react-transition-group";


const AnimatedRoutes = withRouter(({ location }) => (
  <TransitionGroup>
    <CSSTransition
      key={location.key}
      timeout={{
        enter: 400,
        exit: 400,
      }}
      classNames="page"
      unmountOnExit
    >
      <Routes location={location}>
        <Route exact path="/" element={<Home />} />
        <Route path="/scan-results" element={<ScanResults />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />

        <Route path="/contact" element={<ContactUs />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </CSSTransition>
  </TransitionGroup>
));

function AppRoutes() {
  return (
    <div className="s_c">
      <AnimatedRoutes />
      <Socialicons />
    </div>
  );
}

export default AppRoutes;
