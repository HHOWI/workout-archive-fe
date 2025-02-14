import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const LayoutWithHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div>
    <Header />
    <main>{children}</main>
    <Footer />
  </div>
);

export default LayoutWithHeader;
