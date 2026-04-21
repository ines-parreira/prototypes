import { getViewportViewIds } from '../store/viewsCountStore'

export function isViewInViewport(viewId: number): boolean {
    return getViewportViewIds().includes(viewId)
}
