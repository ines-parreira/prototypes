import { Banner } from '@gorgias/axiom'

import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import css from './DisabledActionsBar.less'

type Props = {
    actionsNeedingSetup: GuidanceAction[]
    shopName: string
    type: 'guidance' | 'skill'
}

export const DisabledActionsBar = ({
    actionsNeedingSetup,
    shopName,
    type,
}: Props) => {
    if (actionsNeedingSetup.length === 0) return null

    const routes = getAiAgentNavigationRoutes(shopName)

    const title =
        type === 'guidance'
            ? "This guidance can't be enabled until all actions are ready"
            : "This skill can't be enabled until all actions are ready"

    const description = (
        <div className={css.actionList}>
            Set up and enable the following actions:{' '}
            {actionsNeedingSetup.map((action, index) => (
                <span key={action.value}>
                    <a
                        className={css.actionLink}
                        href={routes.editAction(action.value)}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        {action.name}
                    </a>
                    {index < actionsNeedingSetup.length - 1 && ', '}
                </span>
            ))}
        </div>
    )

    return (
        <div className={css.bar}>
            <Banner
                variant="inline"
                intent="warning"
                icon="warning-triangle"
                isClosable={false}
                size="md"
                title={title}
                description={description}
            />
        </div>
    )
}
