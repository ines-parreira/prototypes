import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classname from 'classnames'
import {FORM_CONTENT_TYPE} from './../../../../../state/macro/utils'

export default class TicketReplyAction extends React.Component {
    setValue(arg, value, category) {
        const index = this.props.action.getIn(['arguments', category]).indexOf(arg)

        if (~index) {
            this.props.update(
                this.props.index,
                this.props.action.get('arguments').setIn([category, index, 'value'], value),
                this.props.ticketId
            )
        }
    }

    renderArgs(title, args, category) {
        if (args.size) {
            return (
                <div className="eight wide column">
                    <h5>{title}</h5>
                    {
                        args.map((arg, key) => (
                            <div key={key} className="ui labeled input">
                                <div className="ui label">{arg.get('key')}</div>
                                <input
                                    type="text"
                                    value={arg.get('value')}
                                    onChange={(e) => this.setValue(arg, e.target.value, category)}
                                    required
                                />
                            </div>
                        ))
                    }
                </div>
            )
        }
        return null
    }

    render() {
        const {action, remove, ticketId} = this.props

        const headersArgs = action.getIn(['arguments', 'headers'], fromJS([]))
            .filter(curAction => curAction.get('editable'))

        const paramsArgs = action.getIn(['arguments', 'params'], fromJS([]))
            .filter(curAction => curAction.get('editable'))

        const formData = action.getIn(['arguments', 'content_type']) === FORM_CONTENT_TYPE
            ? action.getIn(['arguments', 'form'], fromJS([])).filter(curAction => curAction.get('editable'))
            : fromJS([])

        const shouldDisplayArgs = headersArgs.size + paramsArgs.size + formData.size
        const className = classname('ui active content grid', {hidden: !shouldDisplayArgs})

        return (
            <div className="TicketReplyAction">
                <div className="ui accordion">
                    <div className="title ui yellow label">
                        {action.get('title')}
                        <i className="icon close" onClick={() => remove(this.props.index, ticketId)}/>
                    </div>
                    <div className={className}>
                        {this.renderArgs('Headers', headersArgs, 'headers')}
                        {this.renderArgs('URL Parameters', paramsArgs, 'params')}
                        {this.renderArgs('Form Data', formData, 'form')}
                    </div>
                </div>
            </div>
        )
    }
}

TicketReplyAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    update: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    ticketId: PropTypes.number
}
