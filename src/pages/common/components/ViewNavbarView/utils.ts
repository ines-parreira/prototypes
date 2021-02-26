import {Map} from 'immutable'

export function sortViews(view1: Map<any, any>, view2: Map<any, any>) {
    const isView1Hidden = view1.get('hide', false)
    const isView2Hidden = view2.get('hide', false)

    if (isView1Hidden && !isView2Hidden) {
        return 1
    } else if (!isView1Hidden && isView2Hidden) {
        return -1
    }

    return view1.get('display_order', 0) - view2.get('display_order', 0)
}
