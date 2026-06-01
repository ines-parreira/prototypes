import { useQueryClient } from '@tanstack/react-query'

import { useCopilot, useCopilotToolCallResult } from '@gorgias/copilot'
import { queryKeys as knowledgeServiceQueryKeys } from '@gorgias/knowledge-service-queries'

import { aiGeneratedGuidanceKeys } from 'models/aiAgent/queries'
import { helpCenterKeys } from 'models/helpCenter/queries'
import {
    storeWorkflowsConfigurationDefinitionKeys,
    workflowsConfigurationDefinitionKeys,
} from 'models/workflows/queries'

/**
 * Mounts under <CopilotProvider> and listens for mutating Copilot tool calls.
 * On each one, invalidates the React Query keys for the affected entity so
 * the UI reflects backend changes without a manual refresh (COACH-2873).
 *
 * Invalidations are scoped to the specific entity returned by the tool
 * (article id + help_center_id, support-action id, etc). When the tool
 * payload can't be parsed (`result === null`), the broad domain-root
 * fallback is used so the UI is still refreshed.
 */
export function useCopilotCacheInvalidation(): void {
    const queryClient = useQueryClient()
    const { threadId } = useCopilot()

    useCopilotToolCallResult((info) => {
        switch (info.toolName) {
            case 'create_draft_agent_skill':
            case 'update_draft_agent_skill':
            case 'publish_agent_skill': {
                if (!info.result) {
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.details(),
                    })
                    return
                }
                const { helpCenterId, id } = info.result
                if (info.toolName === 'update_draft_agent_skill') {
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.article(helpCenterId, id),
                    })
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.articles(helpCenterId),
                    })
                } else if (info.toolName === 'publish_agent_skill') {
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.article(helpCenterId, id),
                    })
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.articles(helpCenterId),
                    })
                } else {
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.articles(helpCenterId),
                    })
                }
                queryClient.invalidateQueries({
                    queryKey: helpCenterKeys.intents(helpCenterId),
                })
                return
            }

            case 'create_draft_guidance':
            case 'update_draft_guidance':
            case 'publish_guidance': {
                if (!info.result) {
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.details(),
                    })
                    queryClient.invalidateQueries({
                        queryKey: aiGeneratedGuidanceKeys.all(),
                    })
                    return
                }
                const { helpCenterId, id } = info.result
                if (info.toolName === 'update_draft_guidance') {
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.article(helpCenterId, id),
                    })
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.articles(helpCenterId),
                    })
                } else if (info.toolName === 'publish_guidance') {
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.article(helpCenterId, id),
                    })
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.articles(helpCenterId),
                    })
                } else {
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.articles(helpCenterId),
                    })
                }
                queryClient.invalidateQueries({
                    queryKey: aiGeneratedGuidanceKeys.all(),
                })
                return
            }

            case 'process_opportunity': {
                queryClient.invalidateQueries({
                    queryKey: knowledgeServiceQueryKeys.opportunities.all(),
                })
                const refType = info.result?.frontendReference?.type
                if (refType === 'skill' || refType === 'guidance') {
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.details(),
                    })
                }
                return
            }

            case 'create_support_action':
            case 'update_support_action':
            case 'enable_support_action':
            case 'disable_support_action':
            case 'convert_to_advanced_view':
            case 'create_action_from_template': {
                queryClient.invalidateQueries({
                    queryKey: storeWorkflowsConfigurationDefinitionKeys.all(),
                })
                queryClient.invalidateQueries({
                    queryKey: workflowsConfigurationDefinitionKeys.lists(),
                })
                const argsActionId =
                    info.toolName === 'create_support_action' ||
                    info.toolName === 'create_action_from_template'
                        ? null
                        : (info.args as { action_id: string }).action_id
                const targetId = info.result?.id ?? argsActionId
                if (targetId) {
                    queryClient.invalidateQueries({
                        queryKey:
                            workflowsConfigurationDefinitionKeys.get(targetId),
                    })
                }
                return
            }
        }
    }, threadId)
}
