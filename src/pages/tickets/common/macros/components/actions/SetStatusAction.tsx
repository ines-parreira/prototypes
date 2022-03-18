import React from 'react'
import {fromJS, Map} from 'immutable'
import _upperFirst from 'lodash/upperFirst'

import {TICKET_STATUSES} from 'config'
import InputField from 'pages/common/forms/InputField'

type Props = {
    action: Map<string, any>
    index: number
    updateActionArgs: (index: number, args: Map<string, any>) => void
}

export default class SetStatusAction extends React.Component<Props> {
    componentDidMount() {
        const {index, action, updateActionArgs} = this.props
        const status =
            action.getIn(['arguments', 'status']) || TICKET_STATUSES[0]
        updateActionArgs(index, fromJS({status}))
    }

    render() {
        const {action, index, updateActionArgs} = this.props

        return (
            <div className="field">
                <InputField
                    type="select"
                    value={action.getIn(['arguments', 'status'])}
                    onChange={(value) =>
                        updateActionArgs(index, fromJS({status: value}))
                    }
                    required
                >
                    {TICKET_STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {_upperFirst(status)}
                        </option>
                    ))}
                </InputField>
            </div>
        )
    }
}
