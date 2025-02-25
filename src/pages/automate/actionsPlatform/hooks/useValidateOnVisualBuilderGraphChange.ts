import { Dispatch, useEffect } from 'react'

import { VisualBuilderGraphAction } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import useIsVisualBuilderGraphChanged from './useIsVisualBuilderGraphChanged'

type Props = {
    graph: VisualBuilderGraph
    handleValidate: (graph: VisualBuilderGraph) => VisualBuilderGraph
    dispatch: Dispatch<VisualBuilderGraphAction>
}

const useValidateOnVisualBuilderGraphChange = ({
    graph,
    handleValidate,
    dispatch,
}: Props) => {
    const isGraphChanged = useIsVisualBuilderGraphChanged(graph)

    useEffect(() => {
        if (isGraphChanged) {
            const nextGraph = handleValidate(graph)

            dispatch({
                type: 'SET_ERRORS',
                errors: nextGraph.errors ?? null,
            })

            nextGraph.apps?.forEach((app) => {
                switch (app.type) {
                    case 'app':
                        dispatch({
                            type: 'SET_ERRORS',
                            appId: app.app_id,
                            errors: app.errors ?? null,
                        })
                        break
                }
            })

            nextGraph.nodes.forEach((node) => {
                dispatch({
                    type: 'SET_ERRORS',
                    nodeId: node.id,
                    errors: node.data.errors ?? null,
                })
            })
        }
    }, [handleValidate, graph, isGraphChanged, dispatch])
}

export default useValidateOnVisualBuilderGraphChange
