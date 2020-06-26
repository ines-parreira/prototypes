// @flow
import React from 'react'
import classnames from 'classnames'
import {Card, CardBody} from 'reactstrap'

import _isFunction from 'lodash/isFunction'
import _isArray from 'lodash/isArray'

import {computeLeftPadding} from '../utils'
import {templateRegex} from '../../../utils/template'

import Errors from '../Errors'

import {isEmailList, findProperty} from '../../../../../utils'

import ActionSelect from './ActionSelect'


export function validateEmailList(value: string, schemas: Object): string | void {
    let emailList = value

    // verify that all template variables are email addresses
    // if yes, we replace variables with valid email addresses to pass the validation
    // else, we replace variables with an invalid email address to fail the validation
    if (templateRegex.test(value)) {
        emailList = emailList.replace(templateRegex, (match: string, path: string): string => {
            const prop = findProperty(path, schemas, true)
            if (prop && prop.format === 'email') {
                return 'placeholder@gorgias.io'
            }

            return 'bad address'
        })
    }

    if (emailList && !isEmailList(emailList)) {
        return 'One or multiple email addresses are invalid'
    }
}

export function validateBody(values: Object): string | void {
    if (!values.body_text) {
        return 'Body must be filled'
    }
}

export function validateSendEmail(values: Object): Array<string> {
    const errors = []

    if (!values.body_text) {
        errors.push('Body must be filled')
    }

    if (!values.to && !values.cc && !values.bcc) {
        errors.push('Email must have at least one recipient')
    }
    return errors
}

export function validateTags(values: Object): string | void {
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
                // we declare and hide this field
                // because it contains the text version of `body_html` field
                hide: true
            },
            body_html: {
                name: 'Body',
                widget: 'rich-field',
                textField: 'body_text'
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
                widget: 'input',
                validate: validateEmailList
            },
            cc: {
                name: 'Cc',
                widget: 'input',
                validate: validateEmailList
            },
            bcc: {
                name: 'Bcc',
                widget: 'input',
                validate: validateEmailList
            },
            subject: {
                name: 'Subject',
                widget: 'input',
            },
            body_text: {
                hide: true
            },
            body_html: {
                name: 'Body',
                widget: 'rich-field',
                textField: 'body_text'
            }
        },
        validate: validateSendEmail
    },
    replyToTicket: {
        compact: false,
        name: 'Reply to ticket',
        args: {
            body_text: {
                hide: true
            },
            body_html: {
                name: 'Body',
                widget: 'rich-field',
                textField: 'body_text'
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
                placeholder: 'Set subject...',
                widget: 'input'
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
    setTeamAssignee: {
        compact: true,
        name: 'Assign team'
    },
    trashTicket: {
        compact: true,
        name: 'Delete ticket',
    },
    facebookHideComment: {
        compact: true,
        name: 'Hide Facebook comment',
    },
    facebookLikeComment: {
        compact: true,
        name: 'Like Facebook comment',
    }
}

type Props = {
    rule: Object,
    actions: Object,
    children: Object,
    parent: Object,
    value: string,
    depth: number,
}

export default class Action extends React.Component<Props> {
    _renderBody = () => {
        const {value} = this.props
        let {children} = this.props

        if (!value) {
            return (
                <Errors inline>An action cannot be empty</Errors>
            )
        }

        if (value==='facebookHideComment' || value==='facebookLikeComment') {
            return (
                <span className="alert-warning"
                    style={{paddingLeft: '5px', paddingRight:'5px'}}>
                    An extensive use of automatic Facebook actions may deactivate your page on Facebook!
                </span>
            )
        }

        // Determine the display mode
        const config = actionsConfig[value]
        if (!config) {
            return null
        }

        const values = {}
        let errors = []

        // build an object with the keys and values of the action
        children.props.properties.forEach((property) => {
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
                <span
                    key="children"
                    className="compact-action"
                >
                    {children}
                </span>,
                config.note ? (
                    <div
                        className="rule-note"
                        key="note"
                    >
                        {config.note}
                    </div>
                ) : null,
                <Errors
                    key="errors"
                    inline
                >
                    {errors}
                </Errors>,
            ]
        }

        return (
            <div className="card-action">
                <Card>
                    <CardBody>
                        {children}
                        {!!config.note && <div className="rule-note">{config.note}</div>}
                        <Errors>{errors.map((error, id) => <div key={id}>{error}</div>)}</Errors>
                    </CardBody>
                </Card>
            </div>
        )
    }

    render() {
        const {actions, rule, parent, value, depth} = this.props

        const config = actionsConfig[value] || {}

        return (
            <div
                className={classnames('Action', {
                    'd-flex align-items-baseline': config.compact,
                })}
                style={{paddingLeft: computeLeftPadding(depth)}}
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
