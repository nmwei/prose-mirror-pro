// view.ts
import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { schema } from './schema';

import { keymap } from 'prosemirror-keymap'
// baseKeymap 定义了对于很多基础按键按下后的功能，例如回车换行，删除键等。
import { baseKeymap } from 'prosemirror-commands'
// history 是操作历史，提供了对保存操作历史以及恢复等功能，undo，redo 函数对应为进行 undo 操作与 redo 操作，恢复历史数据
import { history, undo, redo } from 'prosemirror-history'
import { insertParagraph, insertHeading } from './utils'


const state = EditorState.create({
    schema,
    plugins: [
        // 将基础按键绑定到对应的功能上，例如回车换行，删除键等。
        keymap(baseKeymap),
        // 提供输入历史栈功能
        history(),
        // 将组合按键 ctrl/cmd + z, ctrl/cmd + y 分别绑定到 undo, redo 功能上
        keymap({"Mod-z": undo, "Mod-y": redo}),
    ]
})

const editorView = new EditorView(document.querySelector("#editor"), {
    state
})


window.editorView = editorView;

//添加新段落
document.querySelector<HTMLDivElement>("#insertParagraph")!.addEventListener("click", () => {
    insertParagraph(editorView, "新段落")
});

//添加新一级标题
document.querySelector<HTMLDivElement>("#insertHeading")!.addEventListener("click", () => {
    insertHeading(editorView, "新一级标题");
});


