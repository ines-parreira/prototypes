import {WorkflowTemplate} from '../models/workflowConfiguration.types'

import {PRODUCT_RECOMMENDATION} from './productRecommendation'
import {SIZE_GUIDE} from './sizeGuide'
import {RETURN_AND_EXCHANGE_POLICY} from './returnAndExchangePolicy'
import {WARRANTY_POLICY} from './warrantyPolicy'
import {SUBSCRIPTION_MANAGEMENT} from './subscriptionManagement'
import {SHIPPING_POLICY} from './shippingPolicy'

export const WORKFLOW_TEMPLATES: Record<
    WorkflowTemplate['slug'],
    WorkflowTemplate
> = {
    [PRODUCT_RECOMMENDATION.slug]: PRODUCT_RECOMMENDATION,
    [SIZE_GUIDE.slug]: SIZE_GUIDE,
    [RETURN_AND_EXCHANGE_POLICY.slug]: RETURN_AND_EXCHANGE_POLICY,
    [WARRANTY_POLICY.slug]: WARRANTY_POLICY,
    [SHIPPING_POLICY.slug]: SHIPPING_POLICY,
    [SUBSCRIPTION_MANAGEMENT.slug]: SUBSCRIPTION_MANAGEMENT,
}
export const WORKFLOW_TEMPLATES_LIST = Object.values(WORKFLOW_TEMPLATES)
