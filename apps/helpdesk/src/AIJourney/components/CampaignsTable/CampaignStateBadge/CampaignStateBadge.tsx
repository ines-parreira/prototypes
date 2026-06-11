import React from 'react'

import classNames from 'classnames'
import moment from 'moment'

import { Tooltip, TooltipContent } from '@gorgias/axiom'
import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import { getCampaignStateLabelAndColor } from 'AIJourney/utils'

import css from './CampaignStateBadge.less'

export function CampaignStateBadge({
    state,
    scheduledDatetime,
}: {
    state: JourneyCampaignStateEnum
    scheduledDatetime?: string | null
}) {
    const { color, label } = getCampaignStateLabelAndColor(state)
    const badge = (
        <span className={classNames(css.badge, css[color])}>{label}</span>
    )

    if (state === JourneyCampaignStateEnum.Scheduled && scheduledDatetime) {
        return (
            <Tooltip trigger={badge}>
                <TooltipContent
                    title={moment
                        .utc(scheduledDatetime)
                        .local()
                        .format('MMM D, YYYY [at] h:mm A')}
                />
            </Tooltip>
        )
    }

    return badge
}
