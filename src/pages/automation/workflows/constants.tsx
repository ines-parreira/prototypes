import React, {ReactNode} from 'react'

import colors from 'assets/tokens/colors.json'
import orderSelectionIcon from 'assets/img/workflows/icons/order-selection-sm.svg'

import {WorkflowTemplate} from './models/workflowConfiguration.types'
import {VisualBuilderNode} from './models/visualBuilderGraph.types'
import {PRODUCT_RECOMMENDATION} from './workflowTemplates/productRecommendation'
import {SIZE_GUIDE} from './workflowTemplates/sizeGuide'
import {RETURN_AND_EXCHANGE_POLICY} from './workflowTemplates/returnAndExchangePolicy'
import {WARRANTY_POLICY} from './workflowTemplates/warrantyPolicy'
import {SUBSCRIPTION_MANAGEMENT} from './workflowTemplates/subscriptionManagement'
import {SHIPPING_POLICY} from './workflowTemplates/shippingPolicy'

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
}

export const WAS_THIS_HELPFUL_WORKFLOW_ID = '01GWPRH2G05DYYFBB1GNVNRB19'
export const ORDER_SELECTION_WORKFLOW_ID = '01H6XMB9DXNERSDSMPAM84JJ6J'
export const NO_ORDERS_WORKFLOW_ID = '01H7FR7QJ4YG1QWXTXNJ5WV1EH'

export const WORKFLOW_TEMPLATES: Record<
    WorkflowTemplate['slug'],
    WorkflowTemplate
> = {
    [PRODUCT_RECOMMENDATION.slug]: PRODUCT_RECOMMENDATION,
    [SIZE_GUIDE.slug]: SIZE_GUIDE,
    [RETURN_AND_EXCHANGE_POLICY.slug]: RETURN_AND_EXCHANGE_POLICY,
    [WARRANTY_POLICY.slug]: WARRANTY_POLICY,
    [SUBSCRIPTION_MANAGEMENT.slug]: SUBSCRIPTION_MANAGEMENT,
    [SHIPPING_POLICY.slug]: SHIPPING_POLICY,
}
export const WORKFLOW_TEMPLATES_LIST = Object.values(WORKFLOW_TEMPLATES)
