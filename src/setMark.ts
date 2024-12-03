import {EditorView} from "prosemirror-view";
import {Attrs, MarkType, Schema} from "prosemirror-model";
import { TextSelection } from "prosemirror-state";

export function setBold(view: EditorView) {
    const mark = view.state.schema.marks.bold;
    return setMark(view, mark);
}
export function unsetBold(view: EditorView) {
    const mark = view.state.schema.marks.bold;
    return unsetMark(view, mark);
}

// 判断当前 selection 是否是 文本选区
function isTextSelection(selection: unknown) {
    return selection instanceof TextSelection;
}

function getMarkType(markType: MarkType | string, schema: Schema) {
    return typeof markType === 'string' ? schema.marks[markType] : markType;
}

export function isMarkActive(view: EditorView, markType: MarkType | string) {
    const { schema, selection, tr } = view.state;
    if(!isTextSelection(selection)) {
        return false;
    }

    const { $from, $to } = selection;
    const realMarkType = getMarkType(markType, schema);

    let isActive = true;
    //遍历从$from.pos到$to.pos的node
    tr.doc.nodesBetween($from.pos, $to.pos, (node) => {
        if(!isActive) {
            return false
        }
        //mark只能设置在行内内容上
        if(node.isInline) {
            //判断node中是否包含当前markType
            const mark = realMarkType.isInSet(node.marks);
            if(!mark) {
                isActive = false;
            }
        }
    })
    return isActive;
}

function toggleMark(view: EditorView, markType: MarkType | string) {
    if(isMarkActive(view, markType)) {
        return unsetMark(view, markType);
    } else {
        return setMark(view, markType);
    }
}

export function toggleBold(view: EditorView) {
    return toggleMark(view, 'bold');
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


