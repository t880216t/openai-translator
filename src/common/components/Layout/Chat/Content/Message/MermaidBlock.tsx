import mermaid from "mermaid";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { DownloadOutlined } from "@ant-design/icons"
import { Button, Tooltip, message } from "antd";
import { writeBinaryFile, BaseDirectory } from '@tauri-apps/api/fs';
import { downloadDir } from '@tauri-apps/api/path';

interface MermaidComponentProps {
  code: string;
  content: string;
  submitState?: boolean
}

const mermaidAPI = mermaid.mermaidAPI;
mermaidAPI.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontSize: '14px',
    primaryColor: '#d6e8ff',
    primaryTextColor: '#485058',
    primaryBorderColor: '#fff',
    lineColor: '#5A646E',
    secondaryColor: '#B5E9E5',
    tertiaryColor: '#485058'
  }
});

const MermaidComponent: React.FC<MermaidComponentProps> = ({ code, content, submitState }) => {
  const dom = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');
  const [errorSvgCode, setErrorSvgCode] = useState('');

  useEffect(() => {
    (async () => {
      const punctuationMap: Record<string, string> = {
        '，': ',',
        '；': ';',
        '。': '.',
        '：': ':',
        '！': '!',
        '？': '?',
        '“': '"',
        '”': '"',
        '‘': "'",
        '’': "'",
        '【': '[',
        '】': ']',
        '（': '(',
        '）': ')',
        '《': '<',
        '》': '>',
        '、': ','
      };
      const formatCode = code.replace(
        /([，；。：！？“”‘’【】（）《》、])/g,
        (match) => punctuationMap[match]
      );
      try {
        const svgCode = await mermaidAPI.render(`mermaid-${Date.now()}`, formatCode);
        setSvg(svgCode?.svg);
      } catch (error) {
        setErrorSvgCode(formatCode);
        console.log(error);
      }
    })();
  }, [code]);

  const onclickExport = useCallback(() => {
    const svg = dom.current?.children[0];
    if (!svg) return;

    const w = svg.clientWidth * 4;
    const h = svg.clientHeight * 4;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // 绘制白色背景
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(dom.current.innerHTML)}`;

    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const bufferData = reader.result as Buffer;
            saveImage(bufferData);
          };
          reader.readAsArrayBuffer(blob);
        } else {
          console.error('Failed to convert canvas to Blob');
        }
      });
    };
    img.onerror = (e) => {
      console.log(e);
    };
  }, []);

  const saveImage = async (bufferData: Buffer) => {
    try {
      const file_name = `mermaid_${Date.now()}.png`;

      const download_dir = await downloadDir();
      const uint8Array = new Uint8Array(bufferData);
      await writeBinaryFile(file_name, uint8Array, { dir: BaseDirectory.Download });
      message.success(`图片已保存至：${download_dir}${file_name}`, 5)
    } catch (error) {
      console.error('Failed to save image:', error);
      message.error('图片保存失败')
    }
  };

  return (
    <div style={{ width: '78vw', overflowX: 'auto', position: "relative"}}>
      <div ref={dom} dangerouslySetInnerHTML={{ __html: svg }} />
      <div style={{position: "absolute", top: 0, right: 0}} >
        {!submitState && (
          <Tooltip placement="left" title={"下载图片"}>
            <Button onClick={onclickExport} type={"text"} icon={<DownloadOutlined style={{fontSize: 18}}/>} />
          </Tooltip>
        )}
      </div>
      <div className="mermaid-content">
        {content}
      </div>
    </div>
  );
};

export default MermaidComponent;