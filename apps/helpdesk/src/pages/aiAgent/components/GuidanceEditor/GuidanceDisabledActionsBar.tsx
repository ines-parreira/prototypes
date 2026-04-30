import { useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { Banner } from '@gorgias/axiom'

import { useGuidanceStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { isActionSetupRequired } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { guidanceActionRegex } from 'pages/common/draftjs/plugins/guidanceActions/utils'

import { useGetGuidancesAvailableActions } from './useGetGuidancesAvailableActions'

import css from './GuidanceDisabledActionsBar.less'

export const GuidanceDisabledActionsBar = () => {
    const { content, shopName, shopType } = useGuidanceStore(
        useShallow((storeState) => ({
            content: storeState.state.content,
            shopName: storeState.config.shopName,
            shopType: storeState.config.shopType,
        })),
    )

    const { guidanceActions } = useGetGuidancesAvailableActions(
        shopName,
        shopType,
    )

    const routes = getAiAgentNavigationRoutes(shopName)

    const actionsInContent = useMemo(() => {
        const mentionedIds = new Set(
            [
                ...content.matchAll(
                    new RegExp(guidanceActionRegex.source, 'g'),
                ),
            ].map(([, id]) => id),
        )
        return guidanceActions.filter(
            (action) =>
                isActionSetupRequired(action) && mentionedIds.has(action.value),
        )
    }, [content, guidanceActions])

    if (actionsInContent.length === 0) return null

    const description = (
        <div className={css.actionList}>
            Set up and enable the following actions:{' '}
            {actionsInContent.map((action, index) => (
                <span key={action.value}>
                    <a
                        className={css.actionLink}
                        href={routes.editAction(action.value)}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        {action.name}
                    </a>
                    {index < actionsInContent.length - 1 && ', '}
                </span>
            ))}
        </div>
    )

    return (
        <div className={css.bar}>
            <Banner
                variant="inline"
                intent="warning"
                icon="triangle-warning"
                isClosable={false}
                size="md"
                title="This skill can't be enabled until all actions are ready"
                description={description}
            />
        </div>
    )
}
