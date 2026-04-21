import { getActiveViewId } from '../store/viewsCountStore'

export function isViewActive(viewId: number): boolean {
    return getActiveViewId() === viewId
}
