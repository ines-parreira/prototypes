import {Map} from 'immutable'

import {MacroActionName} from 'models/macroAction/types'
import {templateRegex} from 'pages/common/utils/template'
import {ManagedRulesSlugs} from 'state/rules/types'
import {isEmailList, findProperty} from 'utils'
import {isCustomFieldValueEmpty} from 'utils/customFields'

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

export function validateSubject(values: {subject: string}): string | void {
    if (!values.subject) {
        return 'Subject must be filled'
    }
}

export function validateBody(values: Email): string | void {
    if (!values.body_text) {
        return 'Body must be filled'
    }
}

export function validateApplyMacro(values: {macro: string}): string | void {
    if (!values.macro) {
        return 'Macro must be selected'
    }
}

export function validateSetCustomFieldValue(values: {
    custom_field_id: number
    value: number | string | boolean
}): string | void {
    if (!values.custom_field_id) {
        return 'Field must be selected'
    }
    if (isCustomFieldValueEmpty(values.value)) {
        return 'Value must be set'
    }
}

export function validateAssignAgent(values: {
    assignee_user: string | null
}): string | void {
    if (values.assignee_user === '') {
        return 'Agent must be selected'
    }
}

export function validateAssignTeam(values: {
    assignee_team: string | null
}): string | void {
    if (values.assignee_team === '') {
        return 'Team must be selected'
    }
}

export function validateSendEmail(values: Email): Array<string> {
    const MAX_NUMBER_RECIPIENTS = 15

    const errors = []

    const numberOfRecipients = [values.bcc, values.cc, values.to].reduce(
        (acc, recipients) =>
            recipients ? recipients.split(',').length + acc : acc,
        0
    )

    if (numberOfRecipients > MAX_NUMBER_RECIPIENTS) {
        errors.push(
            `Total number of recipients must be less than ${
                MAX_NUMBER_RECIPIENTS + 1
            }`
        )
    }

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
    | typeof validateSubject
    | typeof validateSetCustomFieldValue
    | typeof validateApplyMacro
    | typeof validateAssignAgent
    | typeof validateAssignTeam

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
        custom_field_id?: {
            widget: string
        }
        value?: {
            widget: string
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
    [MacroActionName.AddInternalNote]: {
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
        validate: validateApplyMacro,
    },
    [MacroActionName.AddTags]: {
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
    [MacroActionName.SetSubject]: {
        compact: true,
        name: 'Set subject',
        args: {
            subject: {
                placeholder: 'Set subject...',
                widget: 'input',
            },
        },
        validate: validateSubject,
    },
    [MacroActionName.SetStatus]: {
        compact: true,
        name: 'Set status',
    },
    [MacroActionName.SetCustomFieldValue]: {
        compact: true,
        name: 'Set ticket field',
        args: {
            custom_field_id: {
                widget: 'custom_field-select',
            },
            value: {
                widget: 'custom_field-input',
            },
        },
        validate: validateSetCustomFieldValue,
    },
    [MacroActionName.SnoozeTicket]: {
        compact: true,
        name: 'Snooze for',
        args: {
            snooze_timedelta: {
                widget: 'snooze-picker',
            },
        },
    },
    [MacroActionName.SetAssignee]: {
        compact: true,
        name: 'Assign agent',
        validate: validateAssignAgent,
    },
    [MacroActionName.SetTeamAssignee]: {
        compact: true,
        name: 'Assign team',
        validate: validateAssignTeam,
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
    [MacroActionName.ExcludeFromCSAT]: {
        compact: true,
        name: 'Exclude ticket from CSAT',
    },
}

export const actionsConfigWithManagedRules: {[key: string]: ActionConfig} = {
    ...actionsConfig,
    [ManagedRulesSlugs.AutoReplyFAQ]: {
        compact: true,
        name: 'Help-center article recommendation',
    },
}
