import React, { useState } from "react";
import { Button } from "antd";

import "./index.scss";

function BasicComponent() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div className="header-wrap">
      <div className="header-left">
        sider
      </div>
      <div className="header-title">
        <span>test</span>
      </div>
      <div className="header-right">
        <Button type="primary" onClick={handleClick}>
          add
        </Button>
      </div>
    </div>
  );
}

export default BasicComponent;