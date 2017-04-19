import React from 'react'
import classnames from 'classnames'

import ActionSelect from './ActionSelect'

export const actionsConfig = {
    notify: {
        type: 'system',
        compact: false,
        name: 'Deliver message',
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
    sendEmail: {
        compact: false,
        name: 'Send email',
        args: {
            to: {
                name: 'To',
                placeholder: 'Don\'t forget to add a recipient!',
                required: true,
            },
            cc: {
                name: 'Cc'
            },
            bcc: {
                name: 'Bcc'
            },
            subject: {
                name: 'Subject',
            },
            body_text: {
                name: 'Text',
                widget: 'textarea'
            },
            body_html: {
                name: 'HTML',
                widget: 'textarea',
                placeholder: 'If you don\'t want anything specific here, leave this field blank; ' +
                'we will automatically generate HTML from the Text.'
            }
        }
    },
    replyToTicket: {
        compact: false,
        name: 'Reply to ticket',
        note: '* only taken into account if the last message is an email.',
        args: {
            body_text: {
                name: 'Text',
                widget: 'textarea'
            },
            body_html: {
                name: 'HTML*',
                widget: 'textarea'
            }
        }
    },
    applyMacro: {
        compact: true,
        name: 'Apply macro',
    },
    addTags: {
        compact: true,
        name: 'Add tags',
    },
    setTags: {
        compact: true,
        name: 'Set tags',
    },
    // setPriority: {
    //     compact: true,
    //     name: 'Set priority',
    // },
    setStatus: {
        compact: true,
        name: 'Set status',
    },
    setAssignee: {
        compact: true,
        name: 'Assign agent'
    },
    // sendSurvey: {
    //     compact: true,
    //     name: 'Send satisfaction survey'
    // },
}

class Action extends React.Component {
    _renderBody = () => {
        const {children, value} = this.props

        if (!value) {
            return null
        }

        // Determine the display mode
        const config = actionsConfig[value]

        if (!config) {
            return null
        }

        if (config.compact) {
            return [
                <span key="children">{children}</span>,
                config.note ? <div className="rule-note" key="note">{config.note}</div> : null
            ]
        }

        // pass the args to children so that they know how to render themselves
        if (config.args) {
            const childrenWithProps = React.Children.map(children,
                (child) => React.cloneElement(child, {config: config.args})
            )

            return (
                <div className="ui segment">
                    {childrenWithProps}
                    {config.note ? <div className="rule-note">{config.note}</div> : null}
                </div>
            )
        }
        return (
            <div className="ui segment">
                {children}
                {config.note ? <div className="rule-note">{config.note}</div> : null}
            </div>
        )
    }

    render() {
        const {actions, rule, parent, value} = this.props

        const config = actionsConfig[value] || {}

        return (
            <div
                className={classnames('mb-2', {
                    'd-flex align-items-center': config.compact,
                })}
            >
                <ActionSelect
                    actions={actions}
                    rule={rule}
                    parent={parent.push('value')}
                    value={value}
                />
                {this._renderBody()}
            </div>
        )
    }

}

Action.propTypes = {
    rule: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    children: React.PropTypes.oneOfType(
        [React.PropTypes.array, React.PropTypes.element]
    ).isRequired,
    parent: React.PropTypes.object.isRequired,
    value: React.PropTypes.string,
}

export default Action
