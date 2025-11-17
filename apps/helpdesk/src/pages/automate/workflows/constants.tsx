import type { ReactNode } from 'react'
import React from 'react'

import conditionsMergeIcon from 'assets/img/workflows/icons/conditions-merge-sm.svg'
import orderSelectionIcon from 'assets/img/workflows/icons/order-selection-sm.svg'

import type {
    EndNodeType,
    VisualBuilderNode,
} from './models/visualBuilderGraph.types'

export const colorByVisualBuilderNodeType: Record<
    | Exclude<
          NonNullable<VisualBuilderNode['type']>,
          | 'channel_trigger'
          | 'end'
          | 'reusable_llm_prompt_trigger'
          | 'reusable_llm_prompt_call'
      >
    | 'custom_input'
    | 'merchant_input'
    | 'app',
    { color: string; backgroundColor: string }
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
    custom_input: {
        color: 'var(--neutral-grey-5)',
        backgroundColor: 'var(--neutral-grey-2)',
    },
    merchant_input: {
        color: 'var(--neutral-grey-5)',
        backgroundColor: 'var(--neutral-grey-2)',
    },
    cancel_order: {
        color: 'var(--neutral-grey-5)',
        backgroundColor: 'var(--neutral-grey-2)',
    },
    refund_order: {
        color: 'var(--neutral-grey-5)',
        backgroundColor: 'var(--neutral-grey-2)',
    },
    update_shipping_address: {
        color: 'var(--neutral-grey-5)',
        backgroundColor: 'var(--neutral-grey-2)',
    },
    remove_item: {
        color: 'var(--neutral-grey-5)',
        backgroundColor: 'var(--neutral-grey-2)',
    },
    replace_item: {
        color: 'var(--neutral-grey-5)',
        backgroundColor: 'var(--neutral-grey-2)',
    },
    create_discount_code: {
        color: 'var(--neutral-grey-5)',
        backgroundColor: 'var(--neutral-grey-2)',
    },
    refund_shipping_costs: {
        color: 'var(--neutral-grey-5)',
        backgroundColor: 'var(--neutral-grey-2)',
    },
    reship_for_free: {
        color: 'var(--neutral-grey-5)',
        backgroundColor: 'var(--neutral-grey-2)',
    },
    cancel_subscription: {
        color: 'var(--neutral-grey-5)',
        backgroundColor: 'var(--neutral-grey-2)',
    },
    skip_charge: {
        color: 'var(--neutral-grey-5)',
        backgroundColor: 'var(--neutral-grey-2)',
    },
    app: {
        color: 'var(--accessory-orange-3)',
        backgroundColor: 'var(--accessory-orange-1)',
    },
    llm_prompt_trigger: {
        color: 'var(--neutral-grey-6)',
        backgroundColor: 'var(--neutral-grey-3)',
    },
    edit_order_note: {
        color: 'var(--neutral-grey-5)',
        backgroundColor: 'var(--neutral-grey-2)',
    },
    liquid_template: {
        color: 'var(--accessory-yellow-3)',
        backgroundColor: 'var(--accessory-yellow-1)',
    },
}

export const iconByVisualBuilderNodeType: Record<
    | Exclude<
          NonNullable<VisualBuilderNode['type']>,
          | 'channel_trigger'
          | 'end'
          | 'reusable_llm_prompt_trigger'
          | 'reusable_llm_prompt_call'
      >
    | 'custom_input'
    | 'merchant_input'
    | 'app',
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
    custom_input: <i className="material-icons">input</i>,
    merchant_input: <i className="material-icons">settings</i>,
    cancel_order: <i className="material-icons">delete</i>,
    refund_order: <i className="material-icons">history</i>,
    update_shipping_address: <i className="material-icons">local_shipping</i>,
    remove_item: <i className="material-icons">remove</i>,
    create_discount_code: <i className="material-icons">percent</i>,
    refund_shipping_costs: <i className="material-icons">money_off</i>,
    reship_for_free: <i className="material-icons">local_shipping</i>,
    cancel_subscription: <i className="material-icons">unsubscribe</i>,
    skip_charge: <i className="material-icons">skip_next</i>,
    app: <i className="material-icons">key</i>,
    replace_item: <i className="material-icons">swap_horiz</i>,
    llm_prompt_trigger: <i className="material-icons">data_object</i>,
    edit_order_note: <i className="material-icons">note</i>,
    liquid_template: <i className="material-icons">data_object</i>,
}

export const labelByVisualBuilderNodeType: Record<
    Exclude<NonNullable<VisualBuilderNode['type']>, 'reusable_llm_prompt_call'>,
    string
> = {
    channel_trigger: 'Start',
    automated_message: 'Automated answer',
    multiple_choices: 'Multiple choice',
    text_reply: 'Collect text reply',
    file_upload: 'Collect file upload',
    order_selection: 'Order selection',
    http_request: 'HTTP request',
    shopper_authentication: 'Customer login',
    conditions: 'Conditions',
    end: 'End',
    order_line_item_selection: 'Item selection',
    cancel_order: 'Cancel order',
    refund_order: 'Refund order',
    update_shipping_address: 'Edit order shipping address',
    remove_item: 'Remove order item',
    cancel_subscription: 'Cancel subscription',
    skip_charge: 'Skip next subscription shipment',
    llm_prompt_trigger: 'Collect information',
    reusable_llm_prompt_trigger: 'Start',
    create_discount_code: 'Create discount code',
    refund_shipping_costs: 'Refund shipping costs',
    reship_for_free: 'Reship for free',
    replace_item: 'Replace order item',
    edit_order_note: 'Edit order note',
    liquid_template: 'Liquid template',
}

export const endNodeActionLabelByAction: Record<
    EndNodeType['data']['action'],
    string
> = {
    'ask-for-feedback': 'Ask for feedback',
    'create-ticket': 'Create ticket',
    end: 'End interaction',
    'end-success': 'Action successfully performed',
    'end-failure': 'Action not performed',
}
export const endNodeActionIconByAction: Record<
    EndNodeType['data']['action'],
    string
> = {
    'ask-for-feedback': 'thumb_up_alt',
    'create-ticket': 'forum',
    end: 'stop_circle',
    'end-success': 'done',
    'end-failure': 'error',
}

export const MAX_CONFIGURATION_SIZE_IN_BYTES = 2 * 1024 * 1024 // 2MB
export const MAX_TRANSLATIONS_SIZE_IN_BYTES = 2 * 1024 * 1024 // 2MB
export const MAX_STORAGE_LIMIT_RATE_WARNING_THRESHOLD = 0.9

export const MIN_DEBOUNCE_STEP_COUNT = 200
