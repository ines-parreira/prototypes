import React from 'react'

import ActionSelect from './ActionSelect'

export const actionsConfig = {
    notify: {
        compact: false,
        name: 'Send Notification',
        args: {
            subject: {
                name: 'Subject',
            },
            body_text: {
                name: 'Text',
                widget: 'textarea'
            },
            body_html: {
                name: 'HTML',
                widget: 'textarea'
            }
        }
    },
    addTags: {
        compact: true,
        name: 'Add Tags',
    },
    setTags: {
        compact: true,
        name: 'Set Tags',
    },
    setPriority: {
        compact: true,
        name: 'Set Priority',
    },
    setStatus: {
        compact: true,
        name: 'Set Status',
    },
    sendSurvey: {
        compact: true,
        name: 'Send Satisfaction Survey'
    },
}

class Action extends React.Component {
    _renderBody = () => {
        const {children, value} = this.props

        if (!value) {
            return null
        }

        // Determine the display mode
        const config = actionsConfig[value]
        if (config.compact) {
            return <span>{children}</span>
        }

        // pass the args to children so that they know how to render themselves
        if (config.args) {
            const childrenWithProps = React.Children.map(children,
                (child) => React.cloneElement(child, {config: config.args})
            )
            return <div className="ui segment">{childrenWithProps}</div>
        }
        return <div className="ui segment">{children}</div>
    }

    render() {
        const {actions, index, parent, value} = this.props
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
