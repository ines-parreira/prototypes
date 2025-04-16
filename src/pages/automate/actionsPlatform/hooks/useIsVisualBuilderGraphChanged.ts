import { useMemo } from 'react'

import usePrevious from 'hooks/usePrevious'
import { areGraphsEqual } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

const useIsVisualBuilderGraphChanged = (
    graph: VisualBuilderGraph,
    bypassValidation = false,
) => {
    const prevGraph = usePrevious(graph)

    return useMemo(
        () =>
            prevGraph && !bypassValidation
                ? !areGraphsEqual(prevGraph, graph, false)
                : false,
        [prevGraph, graph, bypassValidation],
    )
}

export default useIsVisualBuilderGraphChanged
