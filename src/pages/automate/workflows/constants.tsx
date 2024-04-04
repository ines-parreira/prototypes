import React, {ReactNode} from 'react'

import orderSelectionIcon from 'assets/img/workflows/icons/order-selection-sm.svg'
import conditionsMergeIcon from 'assets/img/workflows/icons/conditions-merge-sm.svg'

import {EndNodeType, VisualBuilderNode} from './models/visualBuilderGraph.types'

export const colorByVisualBuilderNodeType: Record<
    Exclude<NonNullable<VisualBuilderNode['type']>, 'trigger_button' | 'end'>,
    {color: string; backgroundColor: string}
> = {
    automated_message: {
        color: 'var(--accessory-magenta-3)',
        backgroundColor: 'var(--accessory-magenta-1)',
    },
    shopper_authentication: {
        color: 'var(--accessory-violet-3)',
        backgroundColor: 'var(--accessory-violet-1)',
    },
    conditions: {
        color: 'var(--accessory-red-3)',
        backgroundColor: 'var(--accessory-red-1)',
    },
    multiple_choices: {
        color: 'var(--main-primary-4)',
        backgroundColor: 'var(--accessory-blue-1)',
    },
    text_reply: {
        color: 'var(--accessory-orange-3)',
        backgroundColor: 'var(--accessory-orange-1)',
    },
    file_upload: {
        color: 'var(--accessory-green-3)',
        backgroundColor: 'var(--accessory-green-1)',
    },
    order_selection: {
        color: 'var(--accessory-blue-3)',
        backgroundColor: 'var(--accessory-teal-1)',
    },
    http_request: {
        color: 'var(--accessory-yellow-3)',
        backgroundColor: 'var(--accessory-yellow-1)',
    },
    order_line_item_selection: {
        color: 'var(--accessory-teal-3)',
        backgroundColor: 'var(--accessory-teal-1)',
    },
}

export const iconByVisualBuilderNodeType: Record<
    Exclude<NonNullable<VisualBuilderNode['type']>, 'trigger_button' | 'end'>,
    ReactNode
> = {
    automated_message: <i className="material-icons">chat_bubble</i>,
    multiple_choices: <i className="material-icons">view_list</i>,
    text_reply: <i className="material-icons">short_text</i>,
    file_upload: <i className="material-icons">attach_file</i>,
    order_selection: <img src={orderSelectionIcon} alt="box" />,
    http_request: <i className="material-icons">webhook</i>,
    shopper_authentication: <i className="material-icons">person</i>,
    conditions: <img src={conditionsMergeIcon} alt="merge" />,
    order_line_item_selection: <i className="material-icons">label</i>,
}

export const labelByVisualBuilderNodeType: Record<
    NonNullable<VisualBuilderNode['type']>,
    string
> = {
    trigger_button: 'Start flow',
    automated_message: 'Automated answer',
    multiple_choices: 'Multiple choice',
    text_reply: 'Collect text reply',
    file_upload: 'Collect file upload',
    order_selection: 'Order selection',
    http_request: 'HTTP request',
    shopper_authentication: 'Customer login',
    conditions: 'Conditions',
    end: 'End flow',
    order_line_item_selection: 'Item selection',
}

export const endNodeActionLabelByAction: Record<
    EndNodeType['data']['action'],
    string
> = {
    'ask-for-feedback': 'Ask for feedback',
    'create-ticket': 'Create ticket',
    end: 'End interaction',
}
export const endNodeActionIconByAction: Record<
    EndNodeType['data']['action'],
    string
> = {
    'ask-for-feedback': 'thumb_up_alt',
    'create-ticket': 'forum',
    end: 'stop_circle',
}

export const MAX_CONFIGURATION_SIZE_IN_BYTES = 2 * 1024 * 1024 // 2MB
export const MAX_TRANSLATIONS_SIZE_IN_BYTES = 8 * 1024 * 1024 // 8MB
export const MAX_STORAGE_LIMIT_RATE_WARNING_THRESHOLD = 0.9
