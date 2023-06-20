import React, {useMemo} from 'react'

import {useIsRevenueBetaTester} from 'pages/common/hooks/useIsRevenueBetaTester'

import {useTriggers} from '../../containers/TriggersProvider'

import {isAllowedToUpdateTrigger} from '../../utils/isAllowedToUpdateTrigger'

import {CampaignTrigger} from '../../types/CampaignTrigger'
import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'

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
    const {onUpdateTrigger, onDeleteTrigger} = useTriggers()
    const isRevenueBetaTester: boolean = useIsRevenueBetaTester()

    const isAllowedToEdit = isAllowedToUpdateTrigger(
        trigger,
        isRevenueBetaTester
    )

    const content = useMemo(() => {
        const baseProps = {
            id,
            trigger,
            isAllowedToEdit,
            onUpdateTrigger,
            onDeleteTrigger,
        }

        switch (trigger.key) {
            case CampaignTriggerKey.CurrentUrl:
                return <CurrentUrlTrigger {...baseProps} />
            case CampaignTriggerKey.BusinessHours:
                return <BusinessHoursTrigger {...baseProps} />
            case CampaignTriggerKey.TimeSpentOnPage:
                return <TimeSpentOnPageTrigger {...baseProps} />
            case CampaignTriggerKey.CartValue:
                return <CartValueTrigger {...baseProps} />
            case CampaignTriggerKey.ProductTags:
                return <ProductTagsTrigger {...baseProps} />
            case CampaignTriggerKey.CurrentProductTags:
                return <CurrentProductTagsTrigger {...baseProps} />
            case CampaignTriggerKey.VisitCount:
                return <VisitCountTrigger {...baseProps} />
            case CampaignTriggerKey.SessionTime:
                return <SessionTimeTrigger {...baseProps} />
            case CampaignTriggerKey.ExitIntent:
                return <ExitIntentTrigger />
            case CampaignTriggerKey.OrdersCount:
                return <OrdersCountTrigger {...baseProps} />
            case CampaignTriggerKey.AmountSpent:
                return <AmountSpentTrigger {...baseProps} />
            case CampaignTriggerKey.CustomerTags:
                return <ShopifyTagsTrigger {...baseProps} />
            case CampaignTriggerKey.CountryCode:
                return <CustomerCountryTrigger {...baseProps} />
            case CampaignTriggerKey.OrderedProducts:
                return <OrderedProductsTriggers {...baseProps} />

            default:
                return <div />
        }
    }, [isAllowedToEdit, id, trigger, onUpdateTrigger, onDeleteTrigger])

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
                    data-testid={`paywall-${trigger.key}`}
                    className={css.triggerPaywall}
                />
            )}
        </BaseTriggerRow>
    )
}
