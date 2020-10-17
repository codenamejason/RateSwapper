import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="https://github.com/codenamejason/rateswapper" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Raw Cipher"
        subTitle=""
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
