import React from "react";
import { Theme } from 'baseui-sd/theme'

interface IHeaderProps {
  theme?: Theme;
}

import "./index.scss";
import { isDesktopApp } from "../../../../utils";

function QuickHeader(props: IHeaderProps) {
  return (
    <div style={{marginTop: isDesktopApp() ? 10 : "0px"}} className="header-wrap">
      <div className="title" style={{color: props.theme?.colors?.contentPrimary}}>
        <span>Quick Functions</span>
      </div>
    </div>
  );
}

export default QuickHeader;