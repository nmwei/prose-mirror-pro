import {EditorView} from "prosemirror-view";
import {Attrs, MarkType} from "prosemirror-model";

export function setBold(view: EditorView) {
    const mark = view.state.schema.marks.bold;
    return setMark(view, mark);
}
export function unsetBold(view: EditorView) {
    const mark = view.state.schema.marks.bold;
    return unsetMark(view, mark);
}

function setMark(view: EditorView, markType: MarkType | string, attrs: Attrs | null = null) {
    const { schema, selection, tr } = view.state;
    const { $from, $to } = selection;

    const mark = schema.mark(markType, attrs);

    // 为选区中 from -> to 的内容增加 mark
    const newTr = tr.addMark($from.pos, $to.pos, mark);
    view.dispatch(newTr);

    return true;
}

function unsetMark(view: EditorView, markType: MarkType | string) {
    const { schema, selection, tr } = view.state;
    const { $from, $to } = selection;

    const type = typeof markType === 'string' ? schema.marks[markType] : markType;
    const newTr = tr.removeMark($from.pos, $to.pos, type);
    view.dispatch(newTr);

    return true;
}


