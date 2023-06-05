import React, { useState } from "react";
import { Button } from "antd";

import "./index.scss"
import { wrap } from "@sentry/react";

function BasicComponent() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div className="message-card">
      test
    </div>
  );
}

export default BasicComponent;