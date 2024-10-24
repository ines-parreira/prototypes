import React, {useMemo} from 'react'

import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import {OutOfStockProductPagesTrigger} from 'pages/convert/campaigns/components/AdvancedTriggerFactory/OutOfStockProductPagesTrigger'

import {useTriggers} from '../../containers/TriggersProvider'

import {CampaignTrigger} from '../../types/CampaignTrigger'
import {CampaignTriggerType} from '../../types/enums/CampaignTriggerType.enum'
import {isAllowedToUpdateTrigger} from '../../utils/isAllowedToUpdateTrigger'

import {AmountSpentTrigger} from './AmountSpentTrigger'
import {BaseTriggerRow} from './BaseTriggerRow'

import {BusinessHoursTrigger} from './BusinessHoursTrigger'
import {CartValueTrigger} from './CartValueTrigger'
import {CurrentProductTagsTrigger} from './CurrentProductTagsTrigger'
import {CurrentUrlTrigger} from './CurrentUrlTrigger'
import {CustomerCountryTrigger} from './CustomerCountryTrigger'
import {ExitIntentTrigger} from './ExitIntentTrigger'
import {OrderedProductsTriggers} from './OrderedProductsTriggers'
import {OrdersCountTrigger} from './OrdersCountTrigger'
import {ProductTagsTrigger} from './ProductTagsTrigger'
import {SessionTimeTrigger} from './SessionTimeTrigger'
import {ShopifyTagsTrigger} from './ShopifyTagsTrigger'
import css from './style.less'
import {TimeSpentOnPageTrigger} from './TimeSpentOnPageTrigger'
import {VisitCountTrigger} from './VisitCountTrigger'

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
            case CampaignTriggerType.OutOfStockProductPages:
                return <OutOfStockProductPagesTrigger />

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
            onDeleteTrigger={
                trigger.type !== CampaignTriggerType.CurrentUrl
                    ? onDeleteTrigger
                    : null
            }
        >
            {content}
            {!isAllowedToEdit && (
                <div
                    aria-label={`Paywall ${trigger.type}`}
                    className={css.triggerPaywall}
                />
            )}
        </BaseTriggerRow>
    )
}
