import { useCallback, useMemo } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import { getQaScoreDimensionFromObjectPath } from 'pages/common/components/ViewTable/Filters/utils'
import { updateQAScoreFilterDimension } from 'state/views/actions'

type Props = {
    index: number
    objectPath: string
}

export default function useQAScoreFilters({ index, objectPath }: Props) {
    const dispatch = useAppDispatch()

    const qaScoreDimension = getQaScoreDimensionFromObjectPath(objectPath)
    const updateDimensionState = useCallback(
        (newDimensionState: string) => {
            dispatch(updateQAScoreFilterDimension(index, newDimensionState))
        },
        [index, dispatch],
    )

    const onQAScoreDimensionFieldChange = useCallback(
        (selectedQAScoreDimension: string) => {
            updateDimensionState(selectedQAScoreDimension)
        },
        [updateDimensionState],
    )

    return useMemo(
        () => ({
            qaScoreDimension,
            onQAScoreDimensionFieldChange,
        }),
        [qaScoreDimension, onQAScoreDimensionFieldChange],
    )
}
