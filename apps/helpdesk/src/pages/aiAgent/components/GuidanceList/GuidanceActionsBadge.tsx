import { useMemo, useState } from 'react'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import actionsIcon from 'assets/img/icons/guidance-actions.svg'
import type { GuidanceArticle } from 'pages/aiAgent/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { guidanceActionRegex } from 'pages/common/draftjs/plugins/guidanceActions/utils'

import css from './GuidanceActionsBadge.less'

export const GuidanceActionsBadge = ({
    article,
    availableActions,
}: {
    article: GuidanceArticle
    availableActions: GuidanceAction[]
}) => {
    const [spanRef, setSpanRef] = useState<HTMLSpanElement | null>(null)

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

    if (numActions === 0) {
        return null
    }

    return (
        <span className={css.guidanceActionsBadge} ref={setSpanRef}>
            <img
                src={actionsIcon}
                alt="action logo"
                className={css.actionLogo}
                width={14}
                height={14}
            />
            {numActions}
            {spanRef && (
                <Tooltip target={spanRef} placement="top">
                    <strong>
                        {numActions} Action{numActions > 1 ? 's' : ''} used:
                    </strong>{' '}
                    {Object.values(actions)
                        .map(({ name }) => name)
                        .join(', ')}
                </Tooltip>
            )}
        </span>
    )
}
