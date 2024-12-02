import { EditorView } from "prosemirror-view";
import { schema } from "./schema";


type Schema = typeof schema;

export function insertParagraph(editorView: EditorView, content: string) {
    const { state, dispatch } = editorView;
    const schema = state.schema as Schema;

    //通过schema.nodes.xxx 创建节点。第一个参数为attr，第二个参数为子节点。
    const paragraph = schema.nodes.paragraph.create({}, schema.text(content));
    //通过schema.node创建节点。第二个参数为attr，第三个参数为子节点。
    const block_title = schema.node('block_title', {}, paragraph);
    //通过 state.selection 可以获取到选区。selection.anchor为选区开头的位置。
    const position = state.selection.anchor;
    //通过 tr.insert 在 pos 位置将我们上面创建的节点插入到文档中
    const tr = state.tr.insert(position, block_title);

    // 派发更新
    dispatch(tr);
}

export function insertHeading(editorView: EditorView, content: string, level = 1) {
    const { state, dispatch } = editorView;
    const schema = state.schema as Schema;
    const heading = schema.nodes.heading.create({ level }, schema.text(content));

    //将当前选区选中的内容都替换为 block_tile
    const block_title = schema.node(schema.nodes.block_title, {}, heading);

    const tr = state.tr.replaceSelectionWith(block_title);
    dispatch(tr);
}

export function insertBlockquote(editorView: EditorView, value = "") {
    const { state, dispatch } = editorView;
    const schema = state.schema as Schema;
    //通过 state.doc.toJSON 可以将node数据转json
    //通过 schema.nodeFromJSON 可以反向生成对应的node
    const jsonContent = {
        type: 'blockquote',
        content: [
            {
                type: 'paragraph',
                content: value
                    ? [{ type: 'text', text: value }]
                    : []
            }
        ]
    }

    const node = schema.nodeFromJSON(jsonContent);
    const tr = state.tr.replaceWith(state.selection.from, state.selection.to, node)
    dispatch(tr);
}

/**
 * 插入时间选择器
 *
 * @param editorView
 * @param datetime
 */
export function insertDatetime(editorView: EditorView, timestamp: number) {
    const { state, dispatch } = editorView
    const schema = state.schema as Schema;

    const jsonContent = {
        type: 'datetime',
        attrs: {
            timestamp: timestamp || Date.now()
        }
    }

    const node = schema.nodeFromJSON(jsonContent);
    console.log('jsonContent',jsonContent,node)
    const tr = state.tr.replaceWith(state.selection.from, state.selection.to, node)
    dispatch(tr);
}
