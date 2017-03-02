import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {upperFirst as _upperFirst} from 'lodash'
import {TICKET_STATUSES} from '../../../../../../config'

export default class SetStatusAction extends React.Component {
    componentDidMount() {
        const {index, action, updateActionArgs} = this.props
        const status = action.getIn(['arguments', 'status']) || TICKET_STATUSES[0]
        updateActionArgs(index, fromJS({status}))

        $(this.refs.select)
            .dropdown({
                onChange(value) {
                    updateActionArgs(index, fromJS({status: value}))
                }
            })
            .dropdown('set selected', status)
    }

    render() {
        const {index, deleteAction} = this.props
        return (
            <div>
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(index)}
                />
                <h4 className="inline">SET STATUS</h4>
                <div className="ui inline form">
                    <div className="field">
                        <select
                            ref="select"
                            className="ui dropdown"
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
                        </select>
                    </div>
                </div>
                <div className="ui divider"></div>
            </div>
        )
    }
}

SetStatusAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
    deleteAction: PropTypes.func.isRequired
}
