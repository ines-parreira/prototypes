import { useMemo } from 'react'

import { Icon, Tooltip, TooltipContent } from '@gorgias/axiom'

import type { GuidanceArticle } from 'pages/aiAgent/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { isActionSetupRequired } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { guidanceActionRegex } from 'pages/common/draftjs/plugins/guidanceActions/utils'

import css from './GuidanceActionsBadge.less'

export const GuidanceActionsBadge = ({
    article,
    availableActions,
}: {
    article: GuidanceArticle
    availableActions: GuidanceAction[]
}) => {
    const actions = useMemo(() => {
        const actionsFound: { [actionId: string]: GuidanceAction } = {}

        let match: RegExpExecArray | null

        while ((match = guidanceActionRegex.exec(article.content)) !== null) {
            const actionId = match[1]
            if (!(actionId in actionsFound)) {
                const action = availableActions.find(
                    (action) => action.value === actionId,
                )

                if (action) {
                    actionsFound[actionId] = action
                } else {
                    console.error(`No action found for id ${actionId}`)
                }
            }
        }

        return actionsFound
    }, [article.content, availableActions])

    const numActions = Object.keys(actions).length
    const actionValues = Object.values(actions)
    const needsSetup = actionValues.some(isActionSetupRequired)

    if (numActions === 0) {
        return null
    }

    const tooltipContent = (
        <TooltipContent>
            <strong>
                {numActions} Action{numActions > 1 ? 's' : ''} used:
            </strong>{' '}
            {actionValues.map(({ name }) => name).join(', ')}
        </TooltipContent>
    )

    if (needsSetup) {
        return (
            <Tooltip
                trigger={
                    <span className={css.setupPill}>
                        <span className={css.setupPillDot} />
                        Setup required
                    </span>
                }
                placement="top"
            >
                {tooltipContent}
            </Tooltip>
        )
    }

    return (
        <Tooltip
            trigger={
                <span className={css.guidanceActionsBadge}>
                    <Icon name={'webhook'} size="sm" />
                    {numActions}
                </span>
            }
            placement="top"
        >
            {tooltipContent}
        </Tooltip>
    )
}
