import { Map } from 'immutable'

import { UploadType } from 'common/types'
import { isCustomFieldValueEmpty } from 'custom-fields/helpers/isCustomFieldValueEmpty'
import { ACTION_TYPES, ActionType } from 'models/rule/types'
import { templateRegex } from 'pages/common/utils/template'
import { ManagedRulesSlugs } from 'state/rules/types'
import { findProperty, isEmailList } from 'utils'

type Email = {
    body_text?: Maybe<string>
    to?: Maybe<string>
    cc?: Maybe<string>
    bcc?: Maybe<string>
}

export function validateEmailList(value: string, schemas: Map<any, any>) {
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
            },
        )
    }

    if (emailList && !isEmailList(emailList)) {
        return 'One or multiple email addresses are invalid'
    }
}

export function validateSubject(values: { subject?: string }) {
    if (!values.subject) {
        return 'Subject must be filled'
    }
}

export function validateBody(values: Email) {
    if (!values.body_text) {
        return 'Body must be filled'
    }
}

export function validateApplyMacro(values: { macro?: string }) {
    if (!values.macro) {
        return 'Macro must be selected'
    }
}

export function validateSetCustomFieldValue(values: {
    custom_field_id?: number
    value?: number | string | boolean
}) {
    if (!values.custom_field_id) {
        return 'Field must be selected'
    }
    if (isCustomFieldValueEmpty(values.value)) {
        return 'Value must be set'
    }
}

export function validateAssignAgent(values: { assignee_user?: string | null }) {
    if (values.assignee_user === '' || values.assignee_user === undefined) {
        return 'Agent must be selected'
    }
}

export function validateAssignTeam(values: { assignee_team?: string | null }) {
    if (values.assignee_team === '' || values.assignee_team === undefined) {
        return 'Team must be selected'
    }
}

export function validateSendEmail(values: Email) {
    const MAX_NUMBER_RECIPIENTS = 15

    const errors = []

    const numberOfRecipients = [values.bcc, values.cc, values.to].reduce(
        (acc, recipients) =>
            recipients ? recipients.split(',').length + acc : acc,
        0,
    )

    if (numberOfRecipients > MAX_NUMBER_RECIPIENTS) {
        errors.push(
            `Total number of recipients must be less than ${
                MAX_NUMBER_RECIPIENTS + 1
            }`,
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

export function validateTags(values: { tags?: string | null }): string | void {
    if (!values.tags) {
        return 'Tags cannot be empty'
    }
}

type ValidateFn =
    | typeof validateBody
    | typeof validateSendEmail
    | typeof validateTags
    | typeof validateSubject
    | typeof validateSetCustomFieldValue
    | typeof validateApplyMacro
    | typeof validateAssignAgent
    | typeof validateAssignTeam

export type Properties = {
    hide: boolean
    name: string
    placeholder: string
    required: boolean
    textField: string
    uploadType: UploadType
    validate: typeof validateEmailList
    widget: string
}

export type Argument = {
    subject: Partial<Pick<Properties, 'name' | 'placeholder' | 'widget'>>
    body_text: Pick<Properties, 'hide'>
    body_html: Pick<Properties, 'name' | 'textField' | 'widget'> &
        Partial<Pick<Properties, 'uploadType'>>
    to: Pick<
        Properties,
        'name' | 'placeholder' | 'required' | 'validate' | 'widget'
    >
    cc: Pick<Properties, 'name' | 'validate' | 'widget'>
    bcc: Pick<Properties, 'name' | 'validate' | 'widget'>
    snooze_timedelta: Pick<Properties, 'widget'>
    priority: Pick<Properties, 'widget'>
    custom_field_id: Pick<Properties, 'widget'>
    value: Pick<Properties, 'widget'>
}

export type ActionConfig = {
    type?: string
    compact: boolean
    name: string
    args?: Partial<Argument>
    validate?: ValidateFn
}

export function isValidActionKey(
    value: string,
): value is 'notify' | ActionType {
    return value === 'notify' || ACTION_TYPES.includes(value as ActionType)
}

export const actionsConfig: { [key in ActionType | 'notify']: ActionConfig } = {
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
                uploadType: UploadType.PublicAttachment,
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
                uploadType: UploadType.PublicAttachment,
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
                uploadType: UploadType.PublicAttachment,
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
                uploadType: UploadType.PublicAttachment,
            },
        },
        validate: validateBody,
    },
    applyMacro: {
        compact: true,
        name: 'Apply macro',
        validate: validateApplyMacro,
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
        validate: validateSubject,
    },
    setStatus: {
        compact: true,
        name: 'Set status',
    },
    setPriority: {
        compact: true,
        name: 'Set priority',
        args: {
            priority: {
                widget: 'priority-select',
            },
        },
    },
    setCustomFieldValue: {
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
        validate: validateAssignAgent,
    },
    setTeamAssignee: {
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
    excludeFromAutoMerge: {
        compact: true,
        name: 'Exclude ticket from Auto-Merge',
    },
    excludeFromCSAT: {
        compact: true,
        name: 'Exclude ticket from CSAT',
    },
}

export const actionsConfigWithManagedRules: { [key: string]: ActionConfig } = {
    ...actionsConfig,
    [ManagedRulesSlugs.AutoReplyFAQ]: {
        compact: true,
        name: 'Help-center article recommendation',
    },
}
