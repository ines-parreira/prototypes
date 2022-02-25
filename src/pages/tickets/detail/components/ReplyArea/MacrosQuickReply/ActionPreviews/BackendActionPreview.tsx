import React from 'react'
import {fromJS, List} from 'immutable'
import classnames from 'classnames'
import {Badge} from 'reactstrap'

import {getIconFromActionType} from 'models/macroAction/helpers'
import {actionTypeToName, MacroAction} from 'models/macroAction/types'
import {getSortedIntegrationActions} from 'pages/tickets/common/utils.js'

import {BaseActionPreview} from './BaseActionPreview'
import css from './BackendActionPreview.less'

type Props = {
    actions: MacroAction[]
}

export const BackendActionPreview = ({actions}: Props) => {
    const sortedActions: Record<string, MacroAction[]> = (
        getSortedIntegrationActions(fromJS(actions)) as List<any>
    ).toJS()

    return (
        <>
            {Object.keys(sortedActions).map((actionType) => {
                const actions = sortedActions[actionType]
                return (
                    <BaseActionPreview
                        actionName={`${actionTypeToName[actionType]} actions`}
                        columns
                        key={actionType}
                    >
                        {actions.map((action: MacroAction) => (
                            <Badge
                                key={`integration-action-${action.title}`}
                                className={classnames(
                                    css.integration,
                                    css[actionType]
                                )}
                            >
                                <span>
                                    <img
                                        alt={`${actionType} logo`}
                                        src={getIconFromActionType(actionType)}
                                        role="presentation"
                                        className={classnames(css.logo, 'mr-2')}
                                    />
                                </span>
                                <span>{action.title}</span>
                            </Badge>
                        ))}
                    </BaseActionPreview>
                )
            })}
        </>
    )
}
