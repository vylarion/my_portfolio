import React from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";

export const FileScanner = () => {
  return (
    <HelmetProvider>
      <section id="filescanner" className="filescanner">
        <Helmet>
          <meta charSet="utf-8" />
          <title> File Scanner </title>
          <meta name="description" content="File Scanner Page" />
        </Helmet>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h1 className="display-4 mb-4">File Scanner</h1>
              <p>This is the File Scanner page.</p>
            </div>
          </div>
        </div>
      </section>
    </HelmetProvider>
  );
};
