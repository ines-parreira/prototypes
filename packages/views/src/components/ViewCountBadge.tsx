import { Quantity } from '@gorgias/axiom'

import { useViewCount } from '../store/viewsCountStore'

type Props = {
    viewId: number
    isActive?: boolean
}

export function ViewCountBadge({ viewId, isActive }: Props) {
    const count = useViewCount(viewId)

    if (count === undefined) return null

    return (
        <Quantity
            quantity={count}
            color={isActive ? 'purple' : undefined}
            compact
            maxQuantity={5000}
        />
    )
}
