import React from 'react'

import classNames from 'classnames'

import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import css from './CampaignStateBadge.less'

export default function CampaignStateBadge({
    state,
}: {
    state: JourneyCampaignStateEnum
}) {
    let color: string
    let label: string
    switch (state) {
        case JourneyCampaignStateEnum.Draft:
            color = 'yellow'
            label = 'Draft'
            break
        case JourneyCampaignStateEnum.Scheduled:
            color = 'yellow'
            label = 'Scheduled'
            break
        case JourneyCampaignStateEnum.Active:
            color = 'blue'
            label = 'Sending'
            break
        case JourneyCampaignStateEnum.Canceled:
            color = 'red'
            label = 'Canceled'
            break
        case JourneyCampaignStateEnum.Sent:
            color = 'green'
            label = 'Delivered'
            break
        default:
            color = 'grey'
            label = 'Unknown'
    }

    return <span className={classNames(css.badge, css[color])}>{label}</span>
}
