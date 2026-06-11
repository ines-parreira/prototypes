import { useCallback } from 'react'

import { produce } from 'immer'

import { useActionCentralizedLibraryEnabled } from 'hooks/integrations/useActionCentralizedLibraryEnabled'
import type { ActionsApp } from 'pages/automate/actionsPlatform/types'
import {
    getConditionsNodeTouched,
    getGraphAppAppTouched,
    getGraphTouched,
    getHTTPRequestNodeTouched,
    getLLMPromptTriggerNodeTouched,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

const useTouchActionGraph = (actionsApps: ActionsApp[]) => {
    const { isEnabled: isCentralizedLibraryEnabled } =
        useActionCentralizedLibraryEnabled()

    return useCallback(
        (graph: VisualBuilderGraph) => {
            return produce(graph, (draft) => {
                draft.touched = getGraphTouched()

                draft.apps?.forEach((app) => {
                    switch (app.type) {
                        case 'app':
                            {
                                const actionsApp = actionsApps.find(
                                    (actionsApp) =>
                                        actionsApp.id === app.app_id,
                                )

                                if (
                                    actionsApp &&
                                    !isCentralizedLibraryEnabled
                                ) {
                                    app.touched = getGraphAppAppTouched(
                                        actionsApp.auth_type,
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
                                node,
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
        [actionsApps, isCentralizedLibraryEnabled],
    )
}

export { useTouchActionGraph }
