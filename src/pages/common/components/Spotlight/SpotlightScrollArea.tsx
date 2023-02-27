// This component is a base wrapper for the scrollable items provided by the SpotlightModal
// It will serve to implement infinite scrolling
// https://linear.app/gorgias/issue/PLTCO-2557/[p2]-expand-spotlightscrollarea-component

import React, {forwardRef, ForwardedRef, ReactNode} from 'react'

type Props = {
    children: ReactNode
}

const SpotlightScrollArea = (
    {children}: Props,
    ref: ForwardedRef<HTMLDivElement>
) => {
    return <div ref={ref}>{children}</div>
}

export default forwardRef(SpotlightScrollArea)
