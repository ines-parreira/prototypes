import React from 'react'
import {fromJS, Map} from 'immutable'
import _upperFirst from 'lodash/upperFirst'

import {TICKET_STATUSES} from 'config'
import SelectField from 'pages/common/forms/SelectField/SelectField'

type Props = {
    action: Map<string, any>
    index: number
    updateActionArgs: (index: number, args: Map<string, any>) => void
    fullWidth?: boolean
    dropdownContainer?: HTMLElement
}

const SetStatusAction = ({
    index,
    action,
    updateActionArgs,
    fullWidth = true,
    dropdownContainer,
}: Props) => {
    return (
        <div className="field">
            <SelectField
                value={action.getIn(['arguments', 'status'])}
                onChange={(value) =>
                    updateActionArgs(index, fromJS({status: value}))
                }
                options={TICKET_STATUSES.map((status) => ({
                    value: status,
                    label: _upperFirst(status),
                }))}
                fullWidth={fullWidth}
                container={dropdownContainer}
            />
        </div>
    )
}

export default SetStatusAction
