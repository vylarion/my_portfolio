import React from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { dataprojects, meta } from "../../content_option";
import { FaGithub } from "react-icons/fa";

export const Projects = () => {
  return (
    <HelmetProvider>
      <Container className="About-header">
        <Helmet>
          <meta charSet="utf-8" />
          <title> Projects | {meta.title} </title>
          <meta name="description" content={meta.description} />
        </Helmet>
        <Row className="mb-5 mt-3 pt-md-3">
          <Col lg="8">
            <h1 className="display-4 mb-4"> Projects </h1>
            <hr className="t_border my-4 ml-0 text-left" />
          </Col>
        </Row>
        <div className="projects-grid">
          {dataprojects.map((project, i) => {
            return (
              <div key={i} className="project-card">
                <div className="project-main">
                  <div className="project-image-wrapper">
                    <img src={project.img} alt={project.title} className="project-image" />
                    <div className="project-image-overlay">
                      <a
                        href={project.link}
                        className="github-icon-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaGithub />
                      </a>
                    </div>
                  </div>
                  <div className="project-content">
                    <div className="project-header">
                      <h3 className="project-title">{project.title}</h3>
                      <span className="project-category">
                        {project.category}
                      </span>
                    </div>
                    <div className="project-tech">
                      {project.tech.map((tech, j) => (
                        <span key={j} className="tech-badge">{tech}</span>
                      ))}
                    </div>
                    <p className="project-description">{project.description}</p>
                    <a
                      href={project.link}
                      className="visit-project-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Project
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </HelmetProvider>
  );
};
