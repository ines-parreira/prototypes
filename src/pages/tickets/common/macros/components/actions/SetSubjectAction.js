import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'

export default class SetSubjectAction extends React.Component {
    componentDidMount() {
        if (!this.props.action.getIn(['arguments', 'subject'])) {
            this.props.updateActionArgs(this.props.index, '')
        }
    }

    _updateSubject = (subject) => {
        this.props.updateActionArgs(this.props.index, fromJS({subject}))
    }

    render() {
        const {index, deleteAction} = this.props

        return (
            <div className="subject">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(index)}
                />
                <h4>SET SUBJECT</h4>
                <div
                    className="ui content input"
                    style={{width: '100%'}}
                >
                    <input
                        type="text"
                        onChange={e => this._updateSubject(e.target.value)}
                        value={this.props.action.getIn(['arguments', 'subject'], '')}
                        required
                    />
                </div>
            </div>
        )
    }
}

SetSubjectAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
    deleteAction: PropTypes.func.isRequired
}
