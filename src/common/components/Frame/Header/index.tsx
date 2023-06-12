import React, { useState } from "react";
import { Button } from "antd";

interface IHeaderProps{
  title?: string
}

function Header(props: IHeaderProps) {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <div>{props.title}</div>
      <Button onClick={handleClick}>{count} count</Button>
    </div>
  );
}

export default Header;