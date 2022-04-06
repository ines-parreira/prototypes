import React, {ReactNode} from 'react'
import classnames from 'classnames'
import {Map, List} from 'immutable'
import {Card, CardBody} from 'reactstrap'
import {Link} from 'react-router-dom'

import _isFunction from 'lodash/isFunction'
import _isArray from 'lodash/isArray'

import {computeLeftPadding} from '../utils.js'
import {templateRegex} from '../../../utils/template'

import Errors from '../Errors'

import {isEmailList, findProperty} from '../../../../../utils'
import {RuleItemActions} from '../../../../settings/rules/types'

import ActionSelect from './ActionSelect'
import ActionWarning from './ActionWarning'
import css from './Action.less'

type Email = {
    body_text?: Maybe<string>
    to?: Maybe<string>
    cc?: Maybe<string>
    bcc?: Maybe<string>
}

export function validateEmailList(
    value: string,
    schemas: Map<any, any>
): string | void {
    let emailList = value

    // verify that all template variables are email addresses
    // if yes, we replace variables with valid email addresses to pass the validation
    // else, we replace variables with an invalid email address to fail the validation
    if (templateRegex.test(value)) {
        emailList = emailList.replace(
            templateRegex,
            (match: string, path: string): string => {
                const prop = findProperty(path, schemas, true)
                if (prop && prop.format === 'email') {
                    return 'placeholder@gorgias.io'
                }

                return 'bad address'
            }
        )
    }

    if (emailList && !isEmailList(emailList)) {
        return 'One or multiple email addresses are invalid'
    }
}

export function validateBody(values: Email): string | void {
    if (!values.body_text) {
        return 'Body must be filled'
    }
}

export function validateSendEmail(values: Email): Array<string> {
    const errors = []

    if (!values.body_text) {
        errors.push('Body must be filled')
    }

    if (!values.to && !values.cc && !values.bcc) {
        errors.push('Email must have at least one recipient')
    }
    return errors
}

export function validateTags(values: {tags: Maybe<string>}): string | void {
    if (!values.tags) {
        return 'Tags cannot be empty'
    }
}

type ValidateFn =
    | typeof validateEmailList
    | typeof validateBody
    | typeof validateSendEmail
    | typeof validateTags

export type ActionConfig = {
    type?: string
    compact: boolean
    name: string
    args?: {
        subject?: {
            name?: string
            widget?: string
            placeholder?: string
        }
        body_text?: {
            hide: boolean
        }
        body_html?: {
            name: string
            widget: string
            textField: string
        }
        to?: {
            name: string
            placeholder: string
            required: boolean
            widget: string
            validate: ValidateFn
        }
        cc?: {
            name: string
            widget: string
            validate: ValidateFn
        }
        bcc?: {
            name: string
            widget: string
            validate: ValidateFn
        }
        snooze_timedelta?: {
            widget?: string
            validate?: ValidateFn
        }
    }
    validate?: ValidateFn
}

export const actionsConfig: {[key: string]: ActionConfig} = {
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
                hide: true,
            },
            body_html: {
                name: 'Body',
                widget: 'rich-field',
                textField: 'body_text',
            },
        },
        validate: validateBody,
    },
    sendEmail: {
        compact: false,
        name: 'Send email',
        args: {
            to: {
                name: 'To',
                placeholder: "Don't forget to add a recipient!",
                required: true,
                widget: 'input',
                validate: validateEmailList,
            },
            cc: {
                name: 'Cc',
                widget: 'input',
                validate: validateEmailList,
            },
            bcc: {
                name: 'Bcc',
                widget: 'input',
                validate: validateEmailList,
            },
            subject: {
                name: 'Subject',
                widget: 'input',
            },
            body_text: {
                hide: true,
            },
            body_html: {
                name: 'Body',
                widget: 'rich-field',
                textField: 'body_text',
            },
        },
        validate: validateSendEmail,
    },
    replyToTicket: {
        compact: false,
        name: 'Reply to customer',
        args: {
            body_text: {
                hide: true,
            },
            body_html: {
                name: 'Body',
                widget: 'rich-field',
                textField: 'body_text',
            },
        },
        validate: validateBody,
    },
    addInternalNote: {
        compact: false,
        name: 'Add internal note',
        args: {
            body_text: {
                hide: true,
            },
            body_html: {
                name: 'Body',
                widget: 'rich-field',
                textField: 'body_text',
            },
        },
        validate: validateBody,
    },
    applyMacro: {
        compact: true,
        name: 'Apply macro',
    },
    addTags: {
        compact: true,
        name: 'Add tags',
        validate: validateTags,
    },
    removeTags: {
        compact: true,
        name: 'Remove tags',
        validate: validateTags,
    },
    setTags: {
        compact: true,
        name: 'Reset tags',
        validate: validateTags,
    },
    setSubject: {
        compact: true,
        name: 'Set subject',
        args: {
            subject: {
                placeholder: 'Set subject...',
                widget: 'input',
            },
        },
    },
    setStatus: {
        compact: true,
        name: 'Set status',
    },
    snoozeTicket: {
        compact: true,
        name: 'Snooze for',
        args: {
            snooze_timedelta: {
                widget: 'snooze-picker',
            },
        },
    },
    setAssignee: {
        compact: true,
        name: 'Assign agent',
    },
    setTeamAssignee: {
        compact: true,
        name: 'Assign team',
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
    },
}

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    children: ReactNode
    parent: List<any>
    value: keyof typeof actionsConfig
    depth: number
    schemas?: Map<any, any>
    leftsiblings?: List<any>
}

export default class Action extends React.Component<Props> {
    _renderBody = () => {
        const {value} = this.props
        let {children} = this.props

        if (!value) {
            return <Errors inline>An action cannot be empty</Errors>
        }

        if (
            value === 'facebookHideComment' ||
            value === 'facebookLikeComment'
        ) {
            return (
                <ActionWarning>
                    An extensive use of automatic Facebook actions may
                    deactivate your page on Facebook!
                </ActionWarning>
            )
        }

        // Determine the display mode
        const config = actionsConfig[value]
        if (!config) {
            return null
        }

        const values: {[key: string]: unknown} = {}
        let errors: string[] | string = []

        // build an object with the keys and values of the action
        ;(
            children as {
                props: {
                    properties: {key: {name: string}; value: {value: unknown}}[]
                }
            }
        ).props.properties.forEach((property) => {
            values[property.key.name] = property.value.value
        })

        if (values && _isFunction(config.validate)) {
            errors = (config as {validate: (values: any) => string[]}).validate(
                values
            )
        }

        if (!_isArray(errors)) {
            errors = [errors]
        }

        // add 'compact' as a property of children
        children = React.Children.map(children, (child) =>
            React.cloneElement(child as any, {compact: !!config.compact})
        )

        if (config.compact) {
            return [
                <span
                    key="children"
                    className={classnames(css.compactAction, 'compact-action')}
                >
                    {children}
                </span>,
                value === 'setTeamAssignee' ? (
                    <ActionWarning key="warning">
                        To set up team auto-assignment, go to the{' '}
                        <Link to="/app/settings/ticket-assignment">
                            Ticket assignment
                        </Link>{' '}
                        page
                    </ActionWarning>
                ) : null,
                <Errors className={css.inlineErrors} key="errors" inline>
                    {errors}
                </Errors>,
            ]
        }

        return (
            <div className="card-action">
                <Card>
                    <CardBody>
                        {children}
                        <Errors>
                            {errors.map((error, id) => (
                                <div key={id}>{error}</div>
                            ))}
                        </Errors>
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
                    value={value as any}
                />
                {this._renderBody()}
            </div>
        )
    }
}
