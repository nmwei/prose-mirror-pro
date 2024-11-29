// view.ts
import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { schema } from './schema';

import { keymap } from 'prosemirror-keymap'
// baseKeymap 定义了对于很多基础按键按下后的功能，例如回车换行，删除键等。
import { baseKeymap } from 'prosemirror-commands'
// history 是操作历史，提供了对保存操作历史以及恢复等功能，undo，redo 函数对应为进行 undo 操作与 redo 操作，恢复历史数据
import { history, undo, redo } from 'prosemirror-history'


const state = EditorState.create({
    doc: schema.nodes.doc.create({}, [
        schema.nodes.paragraph.create({}, [schema.text("Hello, world!")])
    ]),
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

// 添加加粗按钮的功能
document.querySelector<HTMLDivElement>("#bold")!.addEventListener("click", () => {
    const { tr } = editorView.state;
    const mark = schema.marks.strong.create();
    const newState = editorView.state.apply(tr.addMark(tr.selection.from, tr.selection.to, mark));
    editorView.updateState(newState);
});


