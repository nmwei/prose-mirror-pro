import {Decoration, DecorationSet} from "prosemirror-view";
import {Node as PMNode, NodeType} from "prosemirror-model";
import {Plugin, PluginKey} from "prosemirror-state";
import hljs from 'highlight.js'

interface HighlightCodePluginState {
    decorations: DecorationSet
}

export interface NodeWithPos {
    node: PMNode;
    pos: number;
}

export const highlightCodePluginKey = new PluginKey<HighlightCodePluginState>('highlight-code');

export function findNodesOfType(doc: PMNode, type: string | string[] | NodeType | NodeType[]) {
    const schema = doc.type.schema;
    const tempTypes: string[] | NodeType[] = Array.isArray(type) ? type : [type] as (string[] | NodeType[])
    const types = tempTypes
        .map(item => typeof item === 'string' ? schema.nodes[item] : item)
        .filter(item => item)

    const nodes: NodeWithPos[] = [];

    doc.descendants((node, pos) => {
        if (types.includes(node.type)) {
            nodes.push({
                node,
                pos
            })
        }
    })

    return nodes;
}

export function highlightCodePlugin() {
    // 专门计算生成 decoration 的函数，后面再细看
    function getDecs(doc: PMNode): Decoration[] {
        if (!doc || !doc.nodeSize) {
            return []
        }
        // 获取到 文档中所有的 code_block
        const blocks = findNodesOfType(doc, 'code_block');
        let decorations: Decoration[] = [];

        // 遍历生成 decorations
        blocks.forEach(block => {
            let language: string = block.node.attrs.language;

            if (language && !hljs.getLanguage(language)) {
                language = 'plaintext'
            }

            const highlightResult = language
                ? hljs.highlight(block.node.textContent, { language })
                : hljs.highlightAuto(block.node.textContent)

            console.log(highlightResult);
        })
        return decorations;
    }

    // 创建一个插件，回顾上篇文章，还是使用 state,在里面保存当前的 decorations
    return new Plugin({
        key: highlightCodePluginKey,
        state: {
            init(_, instance) {
                const decorations = getDecs(instance.doc)
                return {
                    decorations: DecorationSet.create(instance.doc, decorations)
                }
            },
            apply(tr, data, oldState, newState) {
                // 文档没变就不重新计算获取 decoration，避免性能浪费
                if (!tr.docChanged) return data;

                const decorations = getDecs(newState.doc)
                return {
                    decorations: DecorationSet.create(tr.doc, decorations)
                }
            }
        },
        props: {
            // 这里的 decorations 与开篇在 editorView 中的一致，不过我们这里把 DecorationSet 的创建都放在 state 中了，
            // 不然会导致每次 tr 一触发，这里就重新生成 DecorationSet,可能还会导致报错
            decorations(state) {
                const pluginState = highlightCodePluginKey.getState(state);

                return pluginState?.decorations
            },
        }
    })
}

