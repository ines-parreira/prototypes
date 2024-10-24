import {WorkflowTemplate} from '../models/workflowConfiguration.types'

import {ADD_EMAIL_TO_KLAVIYO_LIST} from './addEmailToKlaviyoList'
import {AVAILABLE_DISCOUNTS} from './availableDiscounts'
import {MANAGE_RECHARGE_SUBSCRIPTION} from './manageRechargeSubscription'
import {PRODUCT_INGREDIENTS} from './productIngredients'
import {PRODUCT_RECOMMENDATION} from './productRecommendation'
import {PRODUCT_UNIQUE_ATTRIBUTES} from './productUniqueAttributes'
import {RESTOCK_UPDATES} from './restockUpdates'
import {RETURN_AND_EXCHANGE_POLICY} from './returnAndExchangePolicy'
import {SHELF_LIFE_INFORMATION} from './shelfLifeInformation'
import {SHIPPING_POLICY} from './shippingPolicy'
import {SHOW_LOYALTY_LION_POINT_BALANCE} from './showLoyaltyLionPointBalance'
import {SIZE_GUIDE} from './sizeGuide'
import {SUBSCRIPTION_MANAGEMENT} from './subscriptionManagement'
import {WARRANTY_POLICY} from './warrantyPolicy'

export const WORKFLOW_TEMPLATES: Record<
    WorkflowTemplate['slug'],
    WorkflowTemplate
> = {
    [SHELF_LIFE_INFORMATION.slug]: SHELF_LIFE_INFORMATION,
    [RESTOCK_UPDATES.slug]: RESTOCK_UPDATES,
    [PRODUCT_INGREDIENTS.slug]: PRODUCT_INGREDIENTS,
    [PRODUCT_UNIQUE_ATTRIBUTES.slug]: PRODUCT_UNIQUE_ATTRIBUTES,
    [PRODUCT_RECOMMENDATION.slug]: PRODUCT_RECOMMENDATION,
    [SIZE_GUIDE.slug]: SIZE_GUIDE,
    [AVAILABLE_DISCOUNTS.slug]: AVAILABLE_DISCOUNTS,
    [RETURN_AND_EXCHANGE_POLICY.slug]: RETURN_AND_EXCHANGE_POLICY,
    [WARRANTY_POLICY.slug]: WARRANTY_POLICY,
    [SHIPPING_POLICY.slug]: SHIPPING_POLICY,
    [SUBSCRIPTION_MANAGEMENT.slug]: SUBSCRIPTION_MANAGEMENT,
    [ADD_EMAIL_TO_KLAVIYO_LIST.slug]: ADD_EMAIL_TO_KLAVIYO_LIST,
    [SHOW_LOYALTY_LION_POINT_BALANCE.slug]: SHOW_LOYALTY_LION_POINT_BALANCE,
    [MANAGE_RECHARGE_SUBSCRIPTION.slug]: MANAGE_RECHARGE_SUBSCRIPTION,
}
export const WORKFLOW_TEMPLATES_LIST = Object.values(WORKFLOW_TEMPLATES)
