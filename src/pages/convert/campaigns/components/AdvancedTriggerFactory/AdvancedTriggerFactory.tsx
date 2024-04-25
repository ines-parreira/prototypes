import React, {useMemo} from 'react'

import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import {useTriggers} from '../../containers/TriggersProvider'

import {isAllowedToUpdateTrigger} from '../../utils/isAllowedToUpdateTrigger'

import {CampaignTrigger} from '../../types/CampaignTrigger'
import {CampaignTriggerType} from '../../types/enums/CampaignTriggerType.enum'

import {BaseTriggerRow} from './BaseTriggerRow'

import {BusinessHoursTrigger} from './BusinessHoursTrigger'
import {CartValueTrigger} from './CartValueTrigger'
import {CurrentUrlTrigger} from './CurrentUrlTrigger'
import {ExitIntentTrigger} from './ExitIntentTrigger'
import {ProductTagsTrigger} from './ProductTagsTrigger'
import {SessionTimeTrigger} from './SessionTimeTrigger'
import {TimeSpentOnPageTrigger} from './TimeSpentOnPageTrigger'
import {VisitCountTrigger} from './VisitCountTrigger'
import {ShopifyTagsTrigger} from './ShopifyTagsTrigger'
import {CurrentProductTagsTrigger} from './CurrentProductTagsTrigger'
import {OrdersCountTrigger} from './OrdersCountTrigger'
import {CustomerCountryTrigger} from './CustomerCountryTrigger'
import {OrderedProductsTriggers} from './OrderedProductsTriggers'

import css from './style.less'
import {AmountSpentTrigger} from './AmountSpentTrigger'

type Props = {
    trigger: CampaignTrigger
    id: string
    isFirst?: boolean
}

export const AdvancedTriggerFactory = ({
    isFirst = false,
    id,
    trigger,
}: Props): JSX.Element => {
    const {onUpdateTrigger, onDeleteTrigger, onTriggerValidationUpdate} =
        useTriggers()
    const isConvertSubscriber: boolean = useIsConvertSubscriber()

    const isAllowedToEdit = isAllowedToUpdateTrigger(
        trigger,
        isConvertSubscriber
    )

    const content = useMemo(() => {
        const baseProps = {
            id,
            trigger,
            isAllowedToEdit,
            onUpdateTrigger,
            onDeleteTrigger,
            onTriggerValidationUpdate,
        }

        switch (trigger.type) {
            case CampaignTriggerType.CurrentUrl:
                return <CurrentUrlTrigger {...baseProps} />
            case CampaignTriggerType.BusinessHours:
                return <BusinessHoursTrigger {...baseProps} />
            case CampaignTriggerType.TimeSpentOnPage:
                return <TimeSpentOnPageTrigger {...baseProps} />
            case CampaignTriggerType.CartValue:
                return <CartValueTrigger {...baseProps} />
            case CampaignTriggerType.ProductTags:
                return <ProductTagsTrigger {...baseProps} />
            case CampaignTriggerType.CartProductTags:
                return <CurrentProductTagsTrigger {...baseProps} />
            case CampaignTriggerType.VisitCount:
                return <VisitCountTrigger {...baseProps} />
            case CampaignTriggerType.SessionTime:
                return <SessionTimeTrigger {...baseProps} />
            case CampaignTriggerType.ExitIntent:
                return <ExitIntentTrigger />
            case CampaignTriggerType.OrdersCount:
                return <OrdersCountTrigger {...baseProps} />
            case CampaignTriggerType.AmountSpent:
                return <AmountSpentTrigger {...baseProps} />
            case CampaignTriggerType.CustomerTags:
                return <ShopifyTagsTrigger {...baseProps} />
            case CampaignTriggerType.CountryCode:
                return <CustomerCountryTrigger {...baseProps} />
            case CampaignTriggerType.OrderedProducts:
                return <OrderedProductsTriggers {...baseProps} />

            default:
                return <div />
        }
    }, [
        isAllowedToEdit,
        id,
        trigger,
        onUpdateTrigger,
        onDeleteTrigger,
        onTriggerValidationUpdate,
    ])

    return (
        <BaseTriggerRow
            id={id}
            isAllowedToEdit={isAllowedToEdit}
            isFirst={isFirst}
            trigger={trigger}
            onDeleteTrigger={onDeleteTrigger}
        >
            {content}
            {!isAllowedToEdit && (
                <div
                    data-testid={`paywall-${trigger.type}`}
                    className={css.triggerPaywall}
                />
            )}
        </BaseTriggerRow>
    )
}
