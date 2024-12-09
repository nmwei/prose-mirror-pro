import { NodeSpec, Node as PMNode } from "prosemirror-model";
import {Command} from "prosemirror-state";
import {EditorView, NodeView, NodeViewConstructor} from "prosemirror-view";
import crel from "crelt";

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

export class CodeBlockView implements NodeView {
    name = 'block_code';

    private view: EditorView;
    private getPos: () => number | undefined;

    dom!: Node;

    contentDOM!: HTMLElement;

    node!: PMNode;

    constructor(...args: Parameters<NodeViewConstructor>) {
        const [node, view, getPos] = args;
        this.view = view;
        this.getPos = getPos;
        this.node = node;

        this.renderUI(node);
    }

    update(...params: Parameters<Required<NodeView>['update']>) {
        const [node] = params;
        this.node = node;
        if (node.type.name !== 'code_block') {
            return false;
        }

        this.updateUI(node);

        return true;
    };

    private renderUI(node: PMNode) {
        this.dom = crel('pre', {
            'data-language': node.attrs.language,
            'data-theme': node.attrs.theme,
            'data-show-line-number': node.attrs.showLineNumber,
            'data-node-type': 'code_block',
        })

        const menuContainer = crel('div',
            {
                class: 'code-block-memu-container',
            },
            crel('div',
                {
                    class: 'code-block-menu',
                },
                crel('select', {
                    class: 'code-name-select',
                    onchange: (event: Event) => {
                        const { state, dispatch } = this.view;
                        const language = (event.target as HTMLSelectElement).value;
                        const pos = this.getPos();
                        this.view.state.schema.cached.lastLanguage = language;
                        if (pos) {
                            const tr = state.tr.setNodeAttribute(pos, 'language', language);
                            dispatch(tr);
                            setTimeout(() => this.view.focus(), 16);
                        }
                    }
                }, ['plaintext','javascript', 'html', 'markdown', 'typescript', 'python', 'java'].map(item => crel('option', { value: item, selected: item === node.attrs.language }, item))),
                crel('div', {
                        class: 'code-menu-right'
                    },
                    crel('select',
                        {
                            class: 'show-line-number-select',
                            onchange: (event: Event) => {
                                const { state, dispatch } = this.view;
                                const showLineNumber = (event.target as HTMLSelectElement).value === 'true';
                                const pos = this.getPos();
                                if (pos) {
                                    const tr = state.tr.setNodeAttribute(pos, 'showLineNumber', showLineNumber);
                                    dispatch(tr);
                                    setTimeout(() => this.view.focus(), 16)
                                }
                            }
                        },
                        [{value: 'true', label: '展示行号'},{value: 'false', label: '隐藏行号'}].map(item => (
                            crel('option', {
                                selected: item.value === node.attrs.showLineNumber.toString(),
                                value: item.value

                            }, item.label)
                        ))
                    ),
                    crel('button', {
                        class: 'copy-btn',
                        onmousedown: () => {
                            navigator.clipboard.writeText(this.node.textContent).then(() => {
                                alert("copied!")
                            })
                        }
                    }, 'copy')
                )
            )
        )

        const code = crel('code', {
            class: `code-block language-typescript ${node.attrs.showLineNumber ? 'show-line-number' : ''}`,
            lang: node.attrs.language
        })

        this.contentDOM = code;

        this.dom.appendChild(menuContainer)
        this.dom.appendChild(code)

    }

    private updateUI(node: PMNode) {
        const {showLineNumber, language} = node.attrs;
        const showLineNumberClass = 'show-line-number'
        if (showLineNumber && !this.contentDOM.classList.contains(showLineNumberClass)) {
            this.contentDOM.classList.add(showLineNumberClass)
        }
        if (!showLineNumber && this.contentDOM.classList.contains(showLineNumberClass)) {
            this.contentDOM.classList.remove(showLineNumberClass)
        }

        this.contentDOM.dataset.lang = language;
    }
}

export const codeBlockViewConstructor: NodeViewConstructor = (...args) => new CodeBlockView(...args)

