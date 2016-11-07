import React from 'react'

import { actionsConfig } from './Action'

class ActionSelect extends React.Component {

    componentDidMount() {
        $(this.refs.actionSelect).dropdown({
            onChange: this._handleChange,
        })
    }

    _handleChange = (value) => {
        const { actions, index, parent } = this.props
        actions.rules.modifyCodeast(index, parent, value, 'UPDATE')
    }

    render() {
        const { value } = this.props
        const selectedActionName = actionsConfig[value] && actionsConfig[value].name
        return (
            <div
                className="ui floating dropdown right labeled search icon positive button"
                ref="actionSelect"
            >
                <i className="caret down icon" />
                <span className="text">{selectedActionName || value || 'Select Action'}</span>
                <div className="menu">
                    {Object.keys(actionsConfig).map((action, index) => {
                        const actionName = actionsConfig[action] && actionsConfig[action].name
                        return (
                            <div key={index} className="item" data-value={action}>
                                {actionName || action}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

}

ActionSelect.propTypes = {
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    parent: React.PropTypes.object.isRequired,
    value: React.PropTypes.string,
}

export default ActionSelect
