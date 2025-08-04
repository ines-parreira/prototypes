import { useMemo } from 'react'

import { useDebouncedValue, usePrevious } from '@repo/hooks'

import { areGraphsEqual } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

const useIsVisualBuilderGraphChanged = (
    graph: VisualBuilderGraph,
    changeCheckDebounce: number,
) => {
    const debouncedGraph = useDebouncedValue(graph, changeCheckDebounce)
    const prevGraph = usePrevious(debouncedGraph)

    return useMemo(
        () =>
            prevGraph
                ? !areGraphsEqual(prevGraph, debouncedGraph, false)
                : false,
        [prevGraph, debouncedGraph],
    )
}

export default useIsVisualBuilderGraphChanged
