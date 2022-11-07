import React, {useMemo} from 'react'

import {useTriggers} from '../../containers/TriggersProvider'

import {CampaignTrigger} from '../../types/CampaignTrigger'
import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'

import {BaseTriggerRow} from './BaseTriggerRow'

import {BusinessHoursTrigger} from './BusinessHoursTrigger'
import {CurrentUrlTrigger} from './CurrentUrlTrigger'
import {TimeSpentOnPageTrigger} from './TimeSpentOnPageTrigger'

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
