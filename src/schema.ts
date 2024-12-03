import { Schema } from "prosemirror-model"

export const schema = new Schema({
    nodes: {
        doc: {
            content: "title+"
        },
        block_title: {
            content: "block+",
            group: "title",
            inline: false,
            //toDOM: () => ["div", { "class": "block_title" }, 0]
            toDOM(){
                const blockTile = document.createElement('div');
                blockTile.classList.add('block_tile');
                return {
                    dom: blockTile,
                    contentDOM: blockTile
                }
            },
            parseDOM: [
                { tag: 'div.block_title' },
            ]
        },
        blockquote: {
            content: 'paragraph+',
            group: 'block',
            defining: true,
            //isolating: true,
            draggable: true,
            selectable: true,
            toDOM() {
                return ['blockquote', 0]
            },
            parseDOM: [
                { tag: 'blockquote' }
            ]
        },
        paragraph: {
            group: "block",
            content: "inline*",
            toDOM: () => ["p", 0],
            parseDOM: [{ tag: "p" }]
        },
        heading: {
            marks: "italic",
            attrs: {
                level: { default: 1 }
            },
            content: "inline*", //可以包含零个或多个内联节点
            group: "block", //是一个块级节点
            defining: true, //复制一个标题后，全选段落内容或者在一个空段落中粘贴，粘贴整个标题块
            toDOM(node) {
                //是根据 node.attrs.level 动态生成的标签名，例如 h1、h2
                const tag = `h${node.attrs.level}`
                return [tag, 0]
            },
            parseDOM: [
                //复制进来的富文本内容，如果遇到 <h1> 标签，则解析为 heading 节点，并设置 level 为 1
                {tag: "h1", attrs: { level: 1 }},
                {tag: "h2", attrs: { level: 2 }},
                {tag: "h3", attrs: { level: 3 }},
                {tag: "h4", attrs: { level: 4 }},
                {tag: "h5", attrs: { level: 5 }},
                {tag: "h6", attrs: { level: 6 }},
            ]
        },
        datetime: {
            group: 'inline',
            inline: true,
            atom: true,
            attrs: {
                timestamp: {
                    default: null
                }
            },
            toDOM(node) {
                // 自定义 dom 结构
                const dom = document.createElement('span');
                dom.classList.add('datetime')
                dom.dataset.timestamp = node.attrs.timestamp;
                console.log('node.attrs',node.attrs)

                let time = '';
                if (node.attrs.timestamp) {
                    const date = new Date(node.attrs.timestamp)
                    time = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
                }

                const label = document.createElement('label');
                label.innerText = '请选择时间';

                const input = document.createElement('input');
                input.type="date";
                input.value = time;

                input.addEventListener('input', (event) => {
                    dom.dataset.timestamp = new Date((event.target as HTMLInputElement).value).getTime().toString()
                })

                dom.appendChild(label)
                dom.appendChild(input)
                // 返回 dom
                return dom;
            },
            parseDOM: [
                {
                    tag: 'span.datetime',
                    getAttrs(htmlNode) {
                        if (typeof htmlNode !== 'string') {
                            const timestamp = htmlNode.dataset.timestamp;
                            return {
                                timestamp: timestamp ? Number(timestamp) : null
                            }
                        };
                        return {
                            timestamp: null
                        }
                    }
                }
            ]
        },
        text: { group: "inline" }
    },
    marks: {
        // 加粗 strong(语义化)
        bold: {
            toDOM: () => ["strong", 0],
            parseDOM: [
                { tag: 'strong' }, //从别的地方复制过来的富文本，如果有 strong 标签，则被解析为一个 strong mark
                { tag: 'b', getAttrs: (domNode) => (domNode as HTMLElement).style.fontWeight !== 'normal' && null },
                { style: 'font-weight', getAttrs: (value) => /^(bold(er)?|[5-9]\d{2})$/.test(value as string) && null }
            ]
        },
        // 斜体 em
        italic: {
            group: 'heading',
            toDOM: () => {
                return ['em', 0]
            },
            parseDOM: [
                { tag: 'em' },
                { tag: 'i', getAttrs: (domNode) => (domNode as HTMLElement).style.fontStyle !== 'normal' && null},
                { style: 'font-style=italic' },
            ]
        },
        // 链接
        link: {
            group: 'heading',
            attrs: {
                href: { default: null },
                ref: { default: 'noopener noreferrer nofollow' },
                target: { default: '_blank' },
            },
            toDOM: (mark) => {
                const { href, ref, target } = mark.attrs;
                return ['a', { href, ref, target  }, 0]
            },
            parseDOM: [
                { tag: 'a[href]:not([href *= "javascript:" i])' }
            ]
        },
        // 删除线 s
        strike: {
            toDOM: () => {
                return ['s', 0]
            },
            parseDOM: [
                { tag: 's' },
                { tag: 'del', getAttrs: (domNode) => (domNode as HTMLElement).style.textDecoration !== 'line-through' && null },
                { style: 'text-decoration', getAttrs: (value) => value === 'line-through' && null }
            ]
        },
        // 下划线 u
        underline: {
            toDOM: () => {
                return ['u', 0]
            },
            parseDOM: [
                { tag: 'u' },
                { style: 'text-decoration', getAttrs: (value) => value === 'underline' && null }
            ]
        },
        // 上标 sup
        sup: {
            spanning: false,
            excludes: '_',
            toDOM: () => {
                return ['sup', 0]
            },
            parseDOM: [
                { tag: 'sup' },
            ]
        },
        // 下标 sub
        sub: {
            spanning: false,
            excludes: '_',
            toDOM: () => {
                return ['sub', 0]
            },
            parseDOM: [
                { tag: 'sub' },
            ]
        },
        // 行内代码 code
        code: {
            toDOM: () => {
                return ['code', { class: 'inline-code' }, 0]
            },
            parseDOM: [
                { tag: 'code[inline-code]' },
            ]
        },
    }
})
