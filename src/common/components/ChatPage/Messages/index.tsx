import React, { useState } from "react";
import { Button } from "antd";

import Message from './Message'

import "./index.scss"

function BasicComponent() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div className="message-wrap">
      <Message />
    </div>
  );
}

export default BasicComponent;