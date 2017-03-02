import React from 'react'

import { actionsConfig } from './Action'

class ActionSelect extends React.Component {

    componentDidMount() {
        $(this.refs.actionSelect).dropdown({
            onChange: this._handleChange,
        })
    }

    _handleChange = (value) => {
        const { actions, rule, parent } = this.props
        actions.rules.modifyCodeast(rule.get('id'), parent, value, 'UPDATE')
    }

    render() {
        const { value, rule } = this.props
        const selectedActionName = actionsConfig[value] && actionsConfig[value].name
        return (
            <div
                className="ui floating dropdown right labeled search icon positive button"
                ref="actionSelect"
            >
                <i className="caret down icon" />
                <span className="text">{selectedActionName || value || 'Select Action'}</span>
                <div className="menu">
                    {Object.keys(actionsConfig).map((action, i) => {
                        const actionName = actionsConfig[action] && actionsConfig[action].name

                        if (actionsConfig[action].type === 'system' && !(rule.get('type') === 'system')) {
                            return null
                        }

                        return (
                            <div key={i} className="item" data-value={action}>
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
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    value: React.PropTypes.string,
}

export default ActionSelect
