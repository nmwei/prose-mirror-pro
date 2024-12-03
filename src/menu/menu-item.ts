import crelt from 'crelt'
import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'


export interface MenuItemSpec {
    class?: string,
    label: string,
    handler: (
        props: {
            view: EditorView;
            state: EditorState;
            tr: Transaction;
            dispatch: EditorView['dispatch'];
        },
        event: MouseEvent
    ) => void;
    update?: (view: EditorView, state: EditorState, menu: HTMLElement) => void;
}

export class MenuItem {
    constructor(private view: EditorView, private spec: MenuItemSpec) {
        const _this = this;
        const btn = crelt('button', {
            class: spec.class,
            onclick(this, event: MouseEvent) {
                spec.handler({
                    view: _this.view,
                    state: _this.view.state,
                    dispatch: _this.view.dispatch,
                    tr: _this.view.state.tr
                }, event)
            }
        })

        btn.classList.add('menu-item')
        btn.innerHTML = spec.label
        this.dom = btn;
    }

    dom: HTMLElement;

    update(view: EditorView, state: EditorState) {
        this.view = view;
        this.spec.update?.(view, state, this.dom)
    }
}
