import React from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Link } from "react-router-dom";
import { meta } from "../../content_option";

export const NotFound = () => {
    return (
        <HelmetProvider>
            <section className="not-found">
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>404 | {meta.title}</title>
                    <meta name="description" content="Page not found" />
                </Helmet>
                <div className="not-found-content">
                    <div className="not-found-code">404</div>
                    <h1 className="not-found-title">Page Not Found</h1>
                    <p className="not-found-text">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <Link to="/" className="not-found-link">
                        Return Home
                    </Link>
                </div>
            </section>
        </HelmetProvider>
    );
};
