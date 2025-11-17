import cn from 'classnames'

import type { MacroAction } from '@gorgias/helpdesk-types'

import { ActionTemplateExecution } from 'config'
import { getIconFromActionType } from 'models/macroAction/helpers'
import { actionTypeToName } from 'models/macroAction/types'
import { getSortedIntegrationActions } from 'pages/tickets/common/utils'
import { getActionTemplate } from 'utils'

import css from './Preview.less'

export const IntegrationsPreview = ({ actions }: { actions: MacroAction[] }) =>
    Object.entries(
        getSortedIntegrationActions(
            actions.filter(
                (action) =>
                    getActionTemplate(action.name)?.execution ===
                    ActionTemplateExecution.External,
            ),
        ) as {
            [key: string]: MacroAction[]
        },
    ).map(([k, v]) => (
        <IntegrationActionsPreview
            key={k}
            integrationType={k}
            integrationActions={v}
        />
    ))

const IntegrationActionsPreview = ({
    integrationType,
    integrationActions,
}: {
    integrationType: string
    integrationActions: MacroAction[]
}) => {
    if (!integrationActions?.length) return null

    return (
        <div
            key={integrationType}
            className={cn(css.macroData, css.integrationActions)}
        >
            <strong className="text-muted mr-2">
                {actionTypeToName[integrationType]} actions:
            </strong>
            {integrationActions.map(
                (action: MacroAction, index: number | undefined) => (
                    <div
                        className={css.integrationAction}
                        key={`integration-action-${index as number}`}
                    >
                        <img
                            alt={`${integrationType} logo`}
                            src={getIconFromActionType(integrationType)}
                            role="presentation"
                            className={css.logo}
                        />
                        {action.title}
                    </div>
                ),
            )}
        </div>
    )
}
