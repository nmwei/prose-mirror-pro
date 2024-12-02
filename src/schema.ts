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
            }
        },
        paragraph: {
            group: "block",
            content: "inline*",
            toDOM: () => ["p", 0],
            parseDOM: [{
                tag: "p"
            }]
        },
        heading: {
            attrs: {
                level: { default: 1 }
            },
            content: "inline*", //可以包含零个或多个内联节点
            group: "block", //是一个块级节点
            defining: true,
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
        text: { group: "inline", toDOM: () => ["span", 0] }
    },
    marks: {
        strong: {
            toDOM: () => ["strong", 0],
            parseDOM: [
                { tag: 'strong' }, //从别的地方复制过来的富文本，如果有 strong 标签，则被解析为一个 strong mark
            ]
        }
    }
})
