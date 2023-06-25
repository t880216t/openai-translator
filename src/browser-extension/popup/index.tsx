import { createRoot } from 'react-dom/client'
import { Translator } from '../../common/components/Translator'
import { Client as Styletron } from 'styletron-engine-atomic'
import '../../common/i18n.js'
import './index.css'
import { PREFIX } from '../../common/constants'
import { useTheme } from '../../common/hooks/useTheme'
import ToolWarp from "../../common/components/ToolWarp";
import React from "react/index";

const engine = new Styletron({
    prefix: `${PREFIX}-styletron-`,
})

const root = createRoot(document.getElementById('root') as HTMLElement)

function App() {
    const { theme } = useTheme()

    return (
        <div
            style={{
                position: 'absolute',
                minHeight: '100vh',
                background: theme.colors.backgroundPrimary,
            }}
        >
            {/*<Translator showSettings defaultShowSettings text='' engine={engine} autoFocus />*/}
          <ToolWarp
            text=""
            engine={engine}
            autoFocus
            showSettings
            defaultShowSettings
          />
        </div>
    )
}

root.render(<App />)
