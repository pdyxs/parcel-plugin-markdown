import { Transformer } from '@parcel/plugin';
import path from 'path';
import { marked } from 'marked';

export default new Transformer({
  async loadConfig({ config }) {
    const conf = await config.getConfig<{ marked: marked.MarkedOptions; html: boolean; }>([
      path.resolve('.markedrc'),
      path.resolve('.markedrc.js'),
      path.resolve('marked.config.js'),
    ], {});
    if (conf) {
      let isJavascript = path.extname(conf.filePath) === '.js';
      if (isJavascript) {
        config.invalidateOnStartup();
      }
      return {
        marked: {
          breaks: true,
          pedantic: false,
          gfm: true,
          tables: true,
          headerIds: false,
          mangle: false,
          sanitize: false,
          smartLists: true,
          smartypants: false,
          xhtml: false,
        },
        html: false,
        ...conf.contents,
      };
    }
  },
  async transform({ asset, config }) {
    const raw = await asset.getCode();
    const option: { marked?: marked.MarkedOptions, html?: Boolean } = config || {};
    let code = raw;
    if (option.marked) {
      code = marked.parse(code, { ...option.marked });
    }

    asset.type = 'js';
    asset.setCode(`export default ${JSON.stringify(code)}; export const raw = ${JSON.stringify(raw)}`);

    return [asset];
  },
});
