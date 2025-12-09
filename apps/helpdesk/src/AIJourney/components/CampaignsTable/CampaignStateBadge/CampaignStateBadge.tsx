import React from 'react'

import classNames from 'classnames'

import type { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import { getCampaignStateLabelAndColor } from 'AIJourney/utils'

import css from './CampaignStateBadge.less'

export default function CampaignStateBadge({
    state,
}: {
    state: JourneyCampaignStateEnum
}) {
    const { color, label } = getCampaignStateLabelAndColor(state)

    return <span className={classNames(css.badge, css[color])}>{label}</span>
}
