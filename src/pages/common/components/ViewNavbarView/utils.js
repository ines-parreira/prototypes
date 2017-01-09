/**
 * Sort view by `hide` and `display_order` property.
 * hidden views are at the bottom.
 * @param {Map} view1
 * @param {Map} view2
 * @returns {number}
 */
export function sortViews(view1, view2) {
    const isView1Hidden = view1.get('hide', false)
    const isView2Hidden = view2.get('hide', false)

    if (isView1Hidden && !isView2Hidden) {
        return 1
    } else if (!isView1Hidden && isView2Hidden) {
        return -1
    }

    return view1.get('display_order', 0) - view2.get('display_order', 0)
}
