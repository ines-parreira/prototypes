import React from 'react'

import { camelCaseToTitleCase } from '../../../../../utils'

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
        return (
            <div
                className="ui floating dropdown right labeled search icon positive button"
                ref="actionSelect"
            >
                <i className="caret down icon" />
                <span className="text">{camelCaseToTitleCase(this.props.value) || 'Select Action'}</span>
                <div className="menu">
                    {Object.keys(actionsConfig).map((action, index) => (
                        <div
                            key={index}
                            className="item"
                            data-value={action}
                        >
                            {camelCaseToTitleCase(action)}
                        </div>
                    ))}
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
