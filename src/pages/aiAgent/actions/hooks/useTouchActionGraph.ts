import {produce} from 'immer'
import {useCallback} from 'react'

import {ActionsApp} from 'pages/automate/actionsPlatform/types'
import {
    getConditionsNodeTouched,
    getGraphAppAppTouched,
    getGraphTouched,
    getHTTPRequestNodeTouched,
    getLLMPromptTriggerNodeTouched,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {VisualBuilderGraph} from 'pages/automate/workflows/models/visualBuilderGraph.types'

const useTouchActionGraph = (actionsApps: ActionsApp[]) => {
    return useCallback(
        (graph: VisualBuilderGraph) => {
            return produce(graph, (draft) => {
                draft.touched = getGraphTouched()

                draft.apps?.forEach((app) => {
                    switch (app.type) {
                        case 'app':
                            {
                                const actionsApp = actionsApps.find(
                                    (actionsApp) => actionsApp.id === app.app_id
                                )

                                if (actionsApp) {
                                    app.touched = getGraphAppAppTouched(
                                        actionsApp.auth_type
                                    )
                                }
                            }
                            break
                    }
                })

                draft.nodes.forEach((node) => {
                    switch (node.type) {
                        case 'llm_prompt_trigger':
                            node.data.touched =
                                getLLMPromptTriggerNodeTouched(node)
                            break
                        case 'http_request':
                            node.data.touched = getHTTPRequestNodeTouched(node)
                            break
                        case 'conditions':
                            node.data.touched = getConditionsNodeTouched(
                                draft.edges,
                                node
                            )
                            break
                        case 'reusable_llm_prompt_call':
                            break
                        case 'end':
                            break
                    }
                })
            })
        },
        [actionsApps]
    )
}

export default useTouchActionGraph
