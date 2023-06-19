import React, { useState } from "react";
import { Button } from "antd";

function BasicComponent() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <Button onClick={handleClick}>{count} count</Button>
    </div>
  );
}

export default BasicComponent;