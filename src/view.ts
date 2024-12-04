// view.ts
import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { schema } from './schema';
import { keymap } from 'prosemirror-keymap'
// baseKeymap 定义了对于很多基础按键按下后的功能，例如回车换行，删除键等。
import { baseKeymap } from 'prosemirror-commands'
// history 是操作历史，提供了对保存操作历史以及恢复等功能，undo，redo 函数对应为进行 undo 操作与 redo 操作，恢复历史数据
import { history, undo, redo } from 'prosemirror-history'
import {insertParagraph, insertHeading, insertBlockquote, insertDatetime, insertParagraphCommand} from './utils'
import { Toolbar } from './menu/toolbar'
import { canSetMark, isMarkActive, toggleBoldCmd, toggleMark } from "./setMark";

const state = EditorState.create({
    schema,
    plugins: [
        // 将基础按键绑定到对应的功能上，例如回车换行，删除键等。
        keymap({
            ...baseKeymap,
            Enter: insertParagraphCommand,
        }),
        // 提供输入历史栈功能
        history(),
        // 将组合按键 ctrl/cmd + z, ctrl/cmd + y 分别绑定到 undo, redo 功能上
        keymap({
            "Mod-z": undo,
            "Mod-y": redo,
            "Mod-b": toggleBoldCmd,
        }),
    ]
})

const editorView = new EditorView(document.querySelector("#editor"), {
    state,
    dispatchTransaction(tr) {
        const newState = editorView.state.apply(tr);
        editorView.updateState(newState);
        toolbar.update(editorView, editorView.state);
    }
})

function handleUpdateMenu(view: EditorView, type: string, menDom: HTMLElement) {
    const disabled = !canSetMark(view, type);
    if(disabled) {
        !menDom.getAttribute('disabled')
        && menDom.setAttribute('disabled', 'true')
    } else {
        menDom.getAttribute('disabled')
        && menDom.removeAttribute('disabled')

        const isActive = isMarkActive(view, type)
        if(isActive && !menDom.classList.contains("is-active")) {
            menDom.classList.add('is-active')
        }
        if(!isActive && menDom.classList.contains('is-active')) {
            menDom.classList.remove('is-active')
        }
    }
}

function handleSetMark(view: EditorView, type: string) {
    toggleMark(view, type);
    view.focus();
}

// @ts-ignore
window.editorView = editorView;

const toolbar = new Toolbar(editorView, {
    groups: [
        {
            name: '段落',
            menus: [
                {
                    label: '添加段落',
                    handler: (props) => {
                        insertParagraph(props.view, '这是段落')
                    },
                },
                {
                    label: '添加一级标题',
                    handler: (props) => {
                        insertHeading(props.view, '这是标题')
                    },
                },
                {
                    label: '添加 blockquote',
                    handler: (props) => {
                        insertBlockquote(props.view, '这是引用')
                    },
                },
                {
                    label: '添加 datetime',
                    handler: (props) => {
                        insertDatetime(props.view, Date.now())
                    },
                }
            ]
        },
        {
            name: '格式',
            menus: [
                {
                    label: 'B',
                    handler(props) {
                       handleSetMark(props.view, 'bold')
                    },
                    update(view, _, menDom) {
                        handleUpdateMenu(view, 'bold', menDom)
                    }
                },
                {
                    label: 'I',
                    handler(props) {
                        handleSetMark(props.view, 'italic')
                    },
                    update(view, _, menuDom) {
                        handleUpdateMenu(view, 'italic', menuDom)
                    }
                },
                {
                    label: 'S',
                    handler(props) {
                        handleSetMark(props.view, 'strike')
                    },
                    update(view, _, menuDom) {
                        handleUpdateMenu(view, 'strike', menuDom)
                    }
                },
                {
                    label: 'U',
                    handler(props) {
                        handleSetMark(props.view, 'underline')
                    },
                    update(view, _, menuDom) {
                        handleUpdateMenu(view, 'underline', menuDom)
                    }
                },
                {
                    label: 'X<sup>2</sup>',
                    handler(props) {
                        handleSetMark(props.view, 'sup')
                    },
                    update(view, _, menuDom) {
                        handleUpdateMenu(view, 'sup', menuDom)
                    }
                },
                {
                    label: 'X<sub>2</sub>',
                    handler(props) {
                        handleSetMark(props.view, 'sub')
                    },
                    update(view, _, menuDom) {
                        handleUpdateMenu(view, 'sub', menuDom)
                    }
                },
                {
                    label: 'C',
                    handler(props) {
                        handleSetMark(props.view, 'code')
                    },
                    update(view, _, menuDom) {
                        handleUpdateMenu(view, 'code', menuDom)
                    }
                }
            ]
        }
    ]
})



