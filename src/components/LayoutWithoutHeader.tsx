import React from "react";

const LayoutWithoutHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div>
    <main>{children}</main>
  </div>
);

export default LayoutWithoutHeader;
