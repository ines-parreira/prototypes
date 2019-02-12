import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import {upperFirst as _upperFirst} from 'lodash'

import {TICKET_STATUSES} from '../../../../../../config'
import InputField from '../../../../../common/forms/InputField'

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
                <InputField
                    type="select"
                    value={action.getIn(['arguments', 'status'])}
                    onChange={(value) => updateActionArgs(index, fromJS({status: value}))}
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
                </InputField>
            </div>
        )
    }
}

SetStatusAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
}
