import React from 'react'
import {fromJS, Map} from 'immutable'
import {Input} from 'reactstrap'

type Props = {
    action: Map<string, any>
    index: number
    updateActionArgs: (index: number, args: Map<string, any>) => void
}

export default class SetSubjectAction extends React.Component<Props> {
    componentDidMount() {
        if (!this.props.action.getIn(['arguments', 'subject'])) {
            this.props.updateActionArgs(this.props.index, fromJS({}))
        }
    }

    _updateSubject = (subject: string) => {
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
