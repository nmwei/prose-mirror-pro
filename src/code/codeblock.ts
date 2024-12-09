import { NodeSpec } from "prosemirror-model";
import {Command} from "prosemirror-state";

export const codeBlock: NodeSpec = {
    content: "text*", // 内容只支持纯文本
    group: "block",
    marks: "", //拒绝添加任何mark
    code: true, //指定该节点是代码块或内联代码
    defining: true, //全选内容，直接粘贴新的内容后, 还是在code标签内
    draggable: false, //不允许拖动
    selectable: true,

    attrs: {
        language: { //语言
            default: 'plaintext'
        },
        theme: { //主题（本次不实现)
            default: 'dark',
        },
        showLineNumber: { //行号配置
            default: true,
        }
    },
    toDOM(node) {
        return [
            'pre', {
                'data-language': node.attrs.language,
                'data-theme': node.attrs.theme,
                'data-show-line-number': node.attrs.showLineNumber,
                'data-node-type': 'code_block',
                class: 'code-block'
            }, ['code', 0]
        ]
    },

    parseDOM: [
        {
            tag: 'pre',
            preserveWhitespace: 'full',
            getAttrs(node) {
                const domNode = node as HTMLElement;
                return {
                    language: domNode.getAttribute('data-language'),
                    theme: domNode.getAttribute('data-theme'),
                    showLineNumber: domNode.getAttribute('data-show-line-number')
                }
            }
        }
    ]
}

export const createCodeBlockCmd: Command = (state, dispatch) => {
    // 每次创新新的 code block，预览就使用上次使用的 language
    const lastLanguage = state.schema.cached.lastLanguage || 'plaintext';

    const { block_title, code_block } = state.schema.nodes;
    const codeBlockNode = block_title.create({}, code_block.create({ language: lastLanguage }))

    let tr = state.tr;
    tr.replaceSelectionWith(codeBlockNode);
    tr.scrollIntoView();
    if(dispatch) {
        dispatch(tr);
        return true;
    }
    return false
}
