import {useCallback, useEffect, useState} from 'react'

import {PolicyDragItem, UISLAPolicy} from '../types'

export default function useSortablePolicies(
    data: UISLAPolicy[],
    dropCallback: (id: string, priority: number) => void
) {
    const [policies, setSlaPolicies] = useState<UISLAPolicy[]>([])

    useEffect(() => {
        setSlaPolicies(data)
    }, [data])

    const handleMovePolicy = (dragIndex: number, hoverIndex: number) => {
        const newPolicies = [...policies]
        const originalPolicy = newPolicies[dragIndex]
        newPolicies.splice(dragIndex, 1)
        newPolicies.splice(hoverIndex, 0, originalPolicy)

        setSlaPolicies(newPolicies)
    }

    const handleDropPolicy = useCallback(
        (item: PolicyDragItem) => {
            const newPolicies = [...policies]
            // policies are sorted by default from highest to lowest priority
            const previousItem = newPolicies[item.position - 1]
            const nextItem = newPolicies[item.position + 1]
            const newPriority =
                ((previousItem?.priority || 0) + (nextItem?.priority || 1)) / 2

            dropCallback(item.id, newPriority)
        },
        [policies, dropCallback]
    )

    return {policies, handleMovePolicy, handleDropPolicy}
}
