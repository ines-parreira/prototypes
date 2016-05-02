import React, {PropTypes} from 'react'

export default class TicketReplyAction extends React.Component {
    renderArgs(title, args) {
        if (args.size) {
            return (
                <div>
                    <h5>{title}</h5>
                    {
                        args.map((arg, key) => (
                            <div key={key} className="ui labeled input">
                                <div className="ui label">{arg.get('key')}</div>
                                <input
                                    type="text"
                                    value={arg.get('value')}
                                    onChange={(e) => this.setValue(arg, e.target.value, title)}
                                />
                            </div>
                        ))
                    }
                </div>
            )
        }
    }

    setValue(arg, value, title) {
        const category = title === 'Headers' ? 'headers' : 'params'
        const index = this.props.action.getIn(['arguments', category]).indexOf(arg)

        if (index !== -1) {
            this.props.update(
                this.props.index,
                this.props.action.get('arguments').setIn([category, index, 'value'], value)
            )
        }
    }

    render() {
        const { action } = this.props
        const headersArgs = action.getIn(['arguments', 'headers']).filter(curAction => curAction.get('editable'))
        const paramsArgs = action.getIn(['arguments', 'params']).filter(curAction => curAction.get('editable'))

        return (
            <div className="TicketReplyAction">
                <div className="ui accordion">
                    <div className="title ui orange label">{action.get('title')}</div>
                    <div className="content ui grid">
                        <div className="six wide column">
                            {this.renderArgs('Headers', headersArgs)}
                        </div>
                        <div className="six wide column">
                            {this.renderArgs('Parameters', paramsArgs)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

TicketReplyAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    update: PropTypes.func.isRequired
}
