import React from 'react'

import { Cadence } from 'models/billing/types'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'

import css from './BillingFrequency.less'

export type BillingFrequencyProps = {
    selectedCadence: Cadence | null
    onCadenceSelect: (cadence: Cadence) => void
}

const BillingFrequency = ({
    selectedCadence,
    onCadenceSelect,
}: BillingFrequencyProps) => {
    return (
        <div className={css.container}>
            <PreviewRadioButton
                isSelected={selectedCadence === Cadence.Month}
                value={Cadence.Month}
                onClick={() => onCadenceSelect(Cadence.Month)}
                label="Monthly"
            />
            <PreviewRadioButton
                isSelected={selectedCadence === Cadence.Year}
                value={Cadence.Year}
                onClick={() => onCadenceSelect(Cadence.Year)}
                label="Yearly"
            />
        </div>
    )
}

export default BillingFrequency
