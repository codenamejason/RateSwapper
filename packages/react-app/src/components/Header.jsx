import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="https://github.com/codenamejason/rateswapper" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Rate Swapper"
        subTitle="pools automatically go to the highest rates"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
