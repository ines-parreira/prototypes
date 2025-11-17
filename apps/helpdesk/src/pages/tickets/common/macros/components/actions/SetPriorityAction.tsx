import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import _upperFirst from 'lodash/upperFirst'

import { TicketPriority } from '@gorgias/helpdesk-types'

import SelectField from 'pages/common/forms/SelectField/SelectField'

type Props = {
    action: Map<string, any>
    index: number
    updateActionArgs: (index: number, args: Map<string, any>) => void
    fullWidth?: boolean
    dropdownContainer?: HTMLElement
    disabled?: boolean
}

const SetPriorityAction = ({
    index,
    action,
    updateActionArgs,
    fullWidth = true,
    dropdownContainer,
    disabled,
}: Props) => {
    return (
        <div className="field">
            <SelectField
                value={action.getIn(['arguments', 'priority'])}
                onChange={(value) =>
                    updateActionArgs(index, fromJS({ priority: value }))
                }
                options={Object.values(TicketPriority).map((priority) => ({
                    value: priority,
                    label: _upperFirst(priority),
                }))}
                fullWidth={fullWidth}
                container={dropdownContainer}
                disabled={disabled}
            />
        </div>
    )
}

export default SetPriorityAction
