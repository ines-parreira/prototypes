import React from 'react'

import {PlanInterval} from 'models/billing/types'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'

import css from './BillingFrequency.less'

export type BillingFrequencyProps = {
    selectedInterval: PlanInterval | null
    onFrequencySelect: (interval: PlanInterval) => void
}

const BillingFrequency = ({
    selectedInterval,
    onFrequencySelect,
}: BillingFrequencyProps) => {
    return (
        <div className={css.container}>
            <PreviewRadioButton
                isSelected={selectedInterval === PlanInterval.Month}
                value={PlanInterval.Month}
                onClick={() => onFrequencySelect(PlanInterval.Month)}
                label="Monthly"
            />
            <PreviewRadioButton
                isSelected={selectedInterval === PlanInterval.Year}
                value={PlanInterval.Year}
                onClick={() => onFrequencySelect(PlanInterval.Year)}
                label="Yearly"
            />
        </div>
    )
}

export default BillingFrequency
