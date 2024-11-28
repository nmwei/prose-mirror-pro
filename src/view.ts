// view.ts
import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { Schema } from 'prosemirror-model';

const schema = new Schema({
    nodes: {
        doc: { content: "block+" },
        paragraph: { group: "block", content: "inline*", toDOM: () => ["p", 0] },
        text: { group: "inline", toDOM: () => ["span", 0] }
    },
    marks: {
        strong: {
            toDOM: () => ["strong", 0],
        }
    }
})

const state = EditorState.create({
    doc: schema.nodes.doc.create({}, [
        schema.nodes.paragraph.create({}, [schema.text("Hello, world!")])
    ]),
    schema,
})

const editorView = new EditorView(document.querySelector("#editor"), {
    state
})

// 添加加粗按钮的功能
document.querySelector<HTMLDivElement>("#bold")!.addEventListener("click", () => {
    const { tr } = editorView.state;
    const mark = schema.marks.strong.create();
    const newState = editorView.state.apply(tr.addMark(tr.selection.from, tr.selection.to, mark));
    editorView.updateState(newState);
});


