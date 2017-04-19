import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {upperFirst as _upperFirst} from 'lodash'

import {TICKET_STATUSES} from '../../../../../../config'
import SelectField from '../../../../../common/forms/SelectField'

export default class SetStatusAction extends React.Component {
    componentDidMount() {
        const {index, action, updateActionArgs} = this.props
        const status = action.getIn(['arguments', 'status']) || TICKET_STATUSES[0]
        updateActionArgs(index, fromJS({status}))
    }

    render() {
        const {action, index, updateActionArgs} = this.props

        return (
            <div className="field">
                <SelectField
                    input={{
                        value: action.getIn(['arguments', 'status']),
                        onChange: v => updateActionArgs(index, fromJS({status: v})),
                    }}
                    required
                >
                    {
                        TICKET_STATUSES.map((status) =>
                            <option
                                key={status}
                                value={status}
                            >
                                {_upperFirst(status)}
                            </option>
                        )
                    }
                </SelectField>
            </div>
        )
    }
}

SetStatusAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
}
