import React, {useMemo} from 'react'

import {useTriggers} from '../../containers/TriggersProvider'

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
    const content = useMemo(() => {
        const baseProps = {
            id,
            trigger,
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
            case CampaignTriggerKey.VisitCount:
                return <VisitCountTrigger {...baseProps} />
            case CampaignTriggerKey.SessionTime:
                return <SessionTimeTrigger {...baseProps} />
            case CampaignTriggerKey.ExitIntent:
                return <ExitIntentTrigger />

            default:
                return <div />
        }
    }, [id, trigger, onUpdateTrigger, onDeleteTrigger])

    return (
        <BaseTriggerRow
            id={id}
            isFirst={isFirst}
            trigger={trigger}
            onDeleteTrigger={onDeleteTrigger}
        >
            {content}
        </BaseTriggerRow>
    )
}
