import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import {Input} from 'reactstrap'

export default class SetSubjectAction extends React.Component {
    componentDidMount() {
        if (!this.props.action.getIn(['arguments', 'subject'])) {
            this.props.updateActionArgs(this.props.index, {})
        }
    }

    _updateSubject = (subject) => {
        this.props.updateActionArgs(this.props.index, fromJS({subject}))
    }

    render() {
        return (
            <div>
                <Input
                    type="text"
                    onChange={(e) => this._updateSubject(e.target.value)}
                    value={this.props.action.getIn(
                        ['arguments', 'subject'],
                        ''
                    )}
                    required
                />
            </div>
        )
    }
}

SetSubjectAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
}
