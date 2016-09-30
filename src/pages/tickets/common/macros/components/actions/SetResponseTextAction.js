import React, {PropTypes} from 'react'

export default class SetResponseTextAction extends React.Component {
    setResponseText(value) {
        const args = this.props.action.get('arguments')

        this.props.updateActionArgs(
            this.props.index,
            args.set('body_text', value).set('body_html', args.get('body_html') ? value : '')
            // todo(@martin): fix that when we use body_html and body_text correctly
        )
    }

    render() {
        const {index, action, deleteAction} = this.props
        return (
            <div>
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(index)}
                />
                <h4>ADD RESPONSE TEXT</h4>
                <div className="ui form">
                    <div className="field">
                        <textarea
                            onChange={e => this.setResponseText(e.target.value)}
                            value={action.getIn(['arguments', 'body_text'])}
                        />
                    </div>
                </div>
                <div className="ui divider"></div>
            </div>
        )
    }
}

SetResponseTextAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
    deleteAction: PropTypes.func.isRequired
}
