import {EditorState, Plugin, PluginKey, PluginView} from "prosemirror-state";
import {EditorView} from "prosemirror-view";

const DOC_CHANGED_TIMES_KEY = new PluginKey('doc-changed-times')
export const docChangedTimePlugin = (options?: {
    onlyContentChanged?: boolean,
}) => {
    const { onlyContentChanged = true } = options || {};
    return new Plugin({
        key: DOC_CHANGED_TIMES_KEY,
        state: {
            init(){
                return { times: 0 };
            },
            apply: (tr, value, oldState, newState) => {
               const editorView = newState.schema.cached.view;
               //console.log('plugin state docChanged: ' + tr.docChanged);
               if((onlyContentChanged && !tr.docChanged) || editorView?.composing) {
                   return value;
               }
               return {
                   ...value,
                   times: value.times + 1
               }
            }
        },
        view: (view) => new DocChangedTime(view)
    })
}

class DocChangedTime implements PluginView {
    constructor(private view: EditorView) {
        const dom = document.createElement('div');
        dom.classList.add('editor-footer')
        this.dom = dom

        const span = document.createElement('span');
        this.recordChangedTimsDom = span;

        dom.appendChild(span)
        this.updateTimesView(this.view.state);
        this.render(view)
        //将 view 添加到 schema 的 cached 中，方便后续在 apply 中使用，因为 apply 中无法获取 editorView
        if(!view.state.schema.cached.view) {
            view.state.schema.cached.view = view;
        }
    }

    private dom: HTMLElement;
    private recordChangedTimsDom: HTMLElement;
    private render(view: EditorView) {
        const viewParent = view.dom.parentNode;
        viewParent && viewParent.appendChild(this.dom)
    }

    private updateTimesView(state: EditorState) {
        //console.log('plugin view update docChanged: ' + state.tr.docChanged);
        this.recordChangedTimsDom.innerText = `文档被修改了 ${DOC_CHANGED_TIMES_KEY.getState(state).times}`
    }

    update(view: EditorView, state: EditorState) {
        this.updateTimesView(state);
    }

    destroy() {
        this.dom.remove();
    }
}
