const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const ts = require('typescript');
const { replaceWith } = require('cheerio/lib/api/manipulation');

const TYPE_MAP = {
  [ts.SyntaxKind.InterfaceDeclaration]: 'interface',
  [ts.SyntaxKind.TypeAliasDeclaration]: 'type',
};

class Plugin {
  onHandleConfig(ev) {
    const option = ev.data.option || {};

    this._logo = option.logo;
    this._title = option.title;
    this._alias = option.alias;
    this._testCoverage = option.testCoverage;
  }

  onHandleDocs(ev) {
    // modify docs
    (ev.data.docs || []).forEach(doc => {
      if (doc.kind !== 'file' || !/\.ts(x)?$/.test(doc.name)) return;
      const tsDocs = this._genTypescriptDeclareDocs(ts.createSourceFile(doc.longname, doc.content, ts.ScriptTarget.Latest, true));
      (tsDocs || []).forEach(item => {
        ev.data.docs.push({
          ...item,
          longname: `${doc.name}~${item.name}`,
          memberof: doc.name,
          __docId__: ev.data.docs.length + 1,
        });
      });
    });

    // fs.writeFileSync(path.join(__dirname, 'doc.json'), JSON.stringify(ev.data.docs, null, 2));
  }

  onHandleContent(ev) {
    const content = ev.data.content;
    const fileName = ev.data.fileName;

    if (path.extname(fileName) !== '.html') return content;

    const $ = cheerio.load(content);
    const $header = $('header');

    if (this._testCoverage && fileName.endsWith('/docs/test.html')) {
      $('.content').html(`<iframe src="${this._testCoverage}" style="width: 100%; height: calc(100vh - 126px); border: none"/>`)
    }

    if (this._alias) {
      $header.children('a').each((idx, item) => {
        const $link = $(item);
        // 避免发布到CDN无法访问
        if ($link.attr('href') === './') {
          $link.attr('href', 'index.html');
        }
        let showHighlight = false;
        // 增加菜单高亮显示
        const href = $link.attr('href');
        if (href === 'identifiers.html') {
          if (
            fileName.includes('/docs/identifiers.html') ||
            fileName.includes('/docs/variable/') ||
            fileName.includes('/docs/function/') ||
            fileName.includes('/docs/typedef/') ||
            fileName.includes('/docs/class/')
          ) {
            showHighlight = true;
          }
        } else if (href === 'index.html') {
          if (fileName.includes('/docs/manual/') || fileName.includes('/docs/index.html')) {
            showHighlight = true;
          }
        } else if (['test.html', 'source.html'].includes(href)){
          if (fileName.endsWith(`/${$link.attr('href')}`)) {
            showHighlight = true;
          }
        }
    
        if (showHighlight) {
          $link.attr('style', 'border-bottom: 2px solid #2d8cf0');
        }
        const navText = $link.text();
        if (this._alias[navText]) {
          $link.text(this._alias[navText]);
        }
      });
    }

    if (this._title || this._logo) {
      $header.prepend('<div class="brand-info" style="display: inline-block; width:calc(16% - 10px);"></div>');
      const $brandInfo = $('header .brand-info');
      if (this._logo) {
        $brandInfo.append(`<img src="${this._logo}" style="width: 34px; height: 34px; margin: 8px 16px 8px 0;">`);
      }
      if (this._title) {
        $brandInfo.append(
          `<span style="font-weight: 500; line-height: 50px; vertical-align: top;">${this._title}</span>`
        );
      }
    }

    // 将ts的类型描述中的Example区块标题改为Declare
    const defineList = $('.detail h3[id*="static-typedef-"]');
    defineList.each((idx, item) => {
      const exampleNode = $('div[data-ice="example"]', item.parentNode);
      if (exampleNode) {
        $('h4', exampleNode).text('Declare:');
      }
    });

    ev.data.content = $.html();
  }

  // 解析并生成ts文件中的申明类型
  _genTypescriptDeclareDocs(ast) {
    const self = this;
    const docs = [];
    function walk(node) {
      if (!node) return;
      switch (node.kind) {
        case ts.SyntaxKind.InterfaceDeclaration:
        case ts.SyntaxKind.TypeAliasDeclaration:
          if (node.jsDoc) {
            docs.push(self._transformDoc(node));
          }
          break;
      }
      ts.forEachChild(node, walk);
    }

    walk(ast);
    return docs;
  }

  // 处理interface和type的JSDoc
  _transformDoc(node) {
    const [jsDoc] = node.jsDoc;
    const res = {
      access: null,
      static: true,
      kind: 'typedef',
      name: node.name && node.name.text || '',
      properties: [],
      examples: [node.getText()],
      type: {
        name: node.name.text,
        optional: false,
        types: [TYPE_MAP[node.kind] || 'Object'],
      },
    };
    (jsDoc && jsDoc.tags || []).forEach((tag) => {
      switch (tag.kind) {
        case ts.SyntaxKind.JSDocTag:
          res.description = tag.comment || '';
          break;
        case ts.SyntaxKind.JSDocTypedefTag:
          res.properties = this._transformProperties(tag);
          break;
      }
    });

    return res;
  }


  // 处理类型定义的AST
  _transformProperties(typedefTag) {
    const res = [];
    const tags = typedefTag && typedefTag.typeExpression && typedefTag.typeExpression.jsDocPropertyTags || [];
    tags.forEach(property => {
      // console.log('****', property);
      const typeExpression = property.typeExpression.getText().replace(/^\s*\{/, '').replace(/\}\s*$/, '');
      res.push({
        description: (property.comment || '').replace(/^[\s|-]*/, ''),
        name: property.name && property.name.text || '',
        optional: property.isBracketed,
        spread: false,
        types: typeExpression ? typeExpression.split('|').map(item => item.trim()) : [],
      });
    });
    return res;
  }
}

module.exports = new Plugin();