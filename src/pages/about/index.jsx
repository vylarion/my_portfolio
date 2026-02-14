import React from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import {
  dataabout,
  meta,
  worktimeline,
  skills,
  resumeUrl,
} from "../../content_option";

export const About = () => {
  return (
    <HelmetProvider>
      <Container className="About-header px-4">
        <Helmet>
          <meta charSet="utf-8" />
          <title> About | {meta.title}</title>
          <meta name="description" content={meta.description} />
        </Helmet>
        <Row className="sec_sp mt-3 pt-md-3">
          <Col lg="12">
            <h1 className="display-4 mb-4">About me</h1>
            <hr className="t_border my-4 ml-0 text-left" />
            <p className="about-text">{dataabout.aboutme}</p>
          </Col>
        </Row>
        <Row className="sec_sp">
          <Col lg="12">
            <h3 className="color_sec mb-4">Skills</h3>
            <div className="skills-grid">
              {skills.map((data, i) => (
                <div className="skill-item" key={i}>
                  <span className="skill-text">{data.name}</span>
                  <span className="skill-line"></span>
                </div>
              ))}
            </div>
          </Col>
        </Row>
        <Row className="sec_sp work-timeline-section">
          <Col lg="12">
            <h3 className="color_sec mb-3">Work Timeline</h3>
            <table className="table caption-top">
              <tbody>
                {worktimeline.map((data, i) => {
                  return (
                    <tr key={i}>
                      <th scope="row">{data.jobtitle}</th>
                      <td>{data.where}</td>
                      <td>{data.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="resume-btn"
            >
              View Resume
              <span className="resume-btn-arrow">→</span>
            </a>
          </Col>
        </Row>
      </Container>
    </HelmetProvider>
  );
};
