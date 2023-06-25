// @ts-nocheck
import CodeIcon from './file_icon/code.svg'
import ImageIcon from './file_icon/img.svg'
import LinkIcon from './file_icon/link.svg'
import TxtIcon from './file_icon/txt.svg'
import PDFIcon from './file_icon/pdf.svg'
import PPTIcon from './file_icon/ppt.svg'
import UnknowIcon from './file_icon/unkonw.svg'
import WordIcon from './file_icon/word.svg'

export const getIcon = (fileName: string) => {
  const suffix = fileName.split('.').pop();
  switch (suffix) {
    case 'link':
    case 'html':
      return LinkIcon;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return ImageIcon;
    case 'pdf':
      return PDFIcon;
    case 'ppt':
    case 'pptx':
      return PPTIcon;
    case 'doc':
    case 'docx':
      return WordIcon;
    case 'txt':
      return TxtIcon;
    case 'js':
    case 'ts':
    case 'java':
    case 'c':
    case 'cpp':
    case 'py':
    case 'go':
      return CodeIcon;
    default:
      return UnknowIcon;
  }
}