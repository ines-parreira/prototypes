import type { RefObject } from 'react'

import useIsIntersectingWithElement from './useIsIntersectingWithElement'

const useIsIntersectingWithBrowserViewport = (ref: RefObject<Element>) =>
    useIsIntersectingWithElement(ref)

export default useIsIntersectingWithBrowserViewport
