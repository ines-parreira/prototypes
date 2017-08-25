import React from 'react'
import classnames from 'classnames'
import {Card, CardBlock} from 'reactstrap'
import {templateRegex} from '../../../utils/template'

import _isFunction from 'lodash/isFunction'
import _isArray from 'lodash/isArray'

import ActionSelect from './ActionSelect'
import Errors from '../Errors'

import {isEmailList, findProperty} from '../../../../../utils'

export function validateEmailList(value, schemas) {
    let emailList = value

    // verify that all template variables are email addresses
    // if yes, we replace variables with valid email addresses to pass the validation
    if (templateRegex.test(value)) {
        emailList = emailList.replace(templateRegex, (match, path) => {
            const prop = findProperty(path, schemas, true)
            if (prop && prop.format === 'email') {
                return 'placeholder@gorgias.io'
            }
        })
    }

    if (emailList && !isEmailList(emailList)) {
        return 'One or multiple email addresses are invalid'
    }
}

export function validateBody(values) {
    if (!values.body_text && !values.body_html) {
        return 'Body text or body HTML must be filled'
    }
}

export function validateSendEmail(values) {
    const errors = []

    if (!values.body_text && !values.body_html) {
        errors.push('Body text or body HTML must be filled')
    }

    if (!values.to && !values.cc && !values.bcc) {
        errors.push('Email must have at least one recipient')
    }
    return errors
}

export function validateTags(values) {
    if (!values.tags) {
        return 'Tags cannot be empty'
    }
}

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
                widget: 'textarea',
            }
        },
        validate: validateBody
    },
    sendEmail: {
        compact: false,
        name: 'Send email',
        args: {
            to: {
                name: 'To',
                placeholder: 'Don\'t forget to add a recipient!',
                required: true,
                validate: validateEmailList
            },
            cc: {
                name: 'Cc',
                validate: validateEmailList
            },
            bcc: {
                name: 'Bcc',
                validate: validateEmailList
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
        },
        validate: validateSendEmail
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
                widget: 'textarea',
            }
        },
        validate: validateBody
    },
    applyMacro: {
        compact: true,
        name: 'Apply macro',
    },
    addTags: {
        compact: true,
        name: 'Add tags',
        validate: validateTags
    },
    setTags: {
        compact: true,
        name: 'Set tags',
        validate: validateTags
    },
    setSubject: {
        compact: true,
        name: 'Set subject',
        args: {
            subject: {
                name: 'Subject'
            }
        }
    },
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
    trashTicket: {
        compact: true,
        name: 'Delete ticket',
    }
}

class Action extends React.Component {
    _renderBody = () => {
        const {value} = this.props
        let {children} = this.props

        if (!value) {
            return (
                <Errors inline>An action cannot be empty</Errors>
            )
        }

        // Determine the display mode
        const config = actionsConfig[value]
        if (!config) {
            return null
        }

        const values = {}
        let errors = null

        // build an object with the keys and values of the action
        children.props.properties.forEach(property => {
            values[property.key.name] = property.value.value
        })

        if (values && _isFunction(config.validate)) {
            errors = config.validate(values)
        }

        if (!_isArray(errors)) {
            errors = [errors]
        }

        // add 'compact' as a property of children
        children = React.Children.map(children,
            (child) => React.cloneElement(child, {compact: !!config.compact})
        )

        if (config.compact) {
            return [
                <span key="children">{children}</span>,
                config.note ? <div className="rule-note" key="note">{config.note}</div> : null,
                <Errors key="errors" inline>{errors}</Errors>,
            ]
        }

        // pass the args to children so that they know how to render themselves
        if (config.args) {
            children = React.Children.map(children,
                (child) => React.cloneElement(child, {config: config.args})
            )
        }

        return (
            <Card className="mt-3">
                <CardBlock>
                    {children}
                    {!!config.note && <div className="rule-note">{config.note}</div>}
                    <Errors>{errors.map((error, id) => <div key={id}>{error}</div>)}</Errors>
                </CardBlock>
            </Card>
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
