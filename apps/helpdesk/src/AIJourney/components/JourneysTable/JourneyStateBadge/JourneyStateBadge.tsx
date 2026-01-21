import React from 'react'

import classNames from 'classnames'

import type {
    JourneyCampaignStateEnum,
    JourneyStatusEnum,
} from '@gorgias/convert-client'

import {
    getCampaignStateLabelAndColor,
    getFlowStateLabelAndColor,
} from 'AIJourney/utils'

import css from './JourneyStateBadge.less'

export const JourneyStateBadge = ({
    state,
    isCampaign = false,
}: {
    state: JourneyCampaignStateEnum | JourneyStatusEnum
    isCampaign?: boolean
}) => {
    const { color, label } = isCampaign
        ? getCampaignStateLabelAndColor(state as JourneyCampaignStateEnum)
        : getFlowStateLabelAndColor(state as JourneyStatusEnum)

    return <span className={classNames(css.badge, css[color])}>{label}</span>
}
