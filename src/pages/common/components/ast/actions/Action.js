import React from 'react'

import ActionSelect from './ActionSelect'

export const actionsConfig = {
    addTag: { compact: true },
    notify: { compact: false },
    setStatus: { compact: true },
    send_satisfaction_survey: { compact: true },
    message_actions: { compact: true },
}

class Action extends React.Component {

    _renderBody = () => {
        const { children, value } = this.props
        if (!value) return null

        // Determine the display mode
        const compact = actionsConfig[value] ? actionsConfig[value].compact : false
        if (compact) return <span>{children}</span>
        return <div className="ui segment">{children}</div>
    }

    render() {
        const { actions, index, parent, value } = this.props
        return (
            <div className="action">
                <ActionSelect
                    actions={actions}
                    index={index}
                    parent={parent.push('value')}
                    value={value}
                />
                {this._renderBody()}
            </div>
        )
    }

}

Action.propTypes = {
    actions: React.PropTypes.object.isRequired,
    children: React.PropTypes.oneOfType(
        [React.PropTypes.array, React.PropTypes.element]
    ).isRequired,
    index: React.PropTypes.number.isRequired,
    parent: React.PropTypes.object.isRequired,
    value: React.PropTypes.string,
}

export default Action
