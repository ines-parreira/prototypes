import React, {ReactNode} from 'react'

import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import orderSelectionIcon from 'assets/img/workflows/icons/order-selection-sm.svg'

import {VisualBuilderNode} from './models/visualBuilderGraph.types'

export const colorByVisualBuilderNodeType: Record<
    Exclude<NonNullable<VisualBuilderNode['type']>, 'trigger_button' | 'end'>,
    {color: string; backgroundColor: string}
> = {
    automated_message: {
        color: colors['📺 Classic'].Accessory.Purple_text.value,
        backgroundColor: colors['📺 Classic'].Accessory.Pink_bg.value,
    },
    multiple_choices: {
        color: colors['📺 Classic'].Main.Variations.Primary_4.value,
        backgroundColor: colors['📺 Classic'].Accessory.Blue_bg.value,
    },
    text_reply: {
        color: colors['📺 Classic'].Accessory.Brown_text.value,
        backgroundColor: colors['📺 Classic'].Accessory.Orange_bg.value,
    },
    file_upload: {
        color: colors['📺 Classic'].Accessory.Green_text.value,
        backgroundColor: colors['📺 Classic'].Accessory.Green_bg.value,
    },
    order_selection: {
        color: colors['📺 Classic'].Accessory.Blue_text.value,
        backgroundColor: colors['📺 Classic'].Accessory.Teal_bg.value,
    },
    http_request: {
        color: '#605708',
        backgroundColor: colors['📺 Classic'].Accessory.Yellow_bg.value,
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
    order_selection: <img src={orderSelectionIcon} alt="" />,
    http_request: <i className="material-icons">webhook</i>,
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
    end: 'End flow',
}

export const WAS_THIS_HELPFUL_WORKFLOW_ID = '01GWPRH2G05DYYFBB1GNVNRB19'
export const ORDER_SELECTION_WORKFLOW_ID = '01H6XMB9DXNERSDSMPAM84JJ6J'
export const NO_ORDERS_WORKFLOW_ID = '01H7FR7QJ4YG1QWXTXNJ5WV1EH'

export const MAX_STORAGE_LIMIT_RATE_WARNING_THRESHOLD = 0.75
