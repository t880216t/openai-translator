import React, { useState } from "react";
import { Button } from "antd";
import { Theme } from "baseui-sd/theme";

interface IQuickProps {
  text?: string
  theme?: Theme;
}

function QuickComponent(props: IQuickProps) {
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

export default QuickComponent;