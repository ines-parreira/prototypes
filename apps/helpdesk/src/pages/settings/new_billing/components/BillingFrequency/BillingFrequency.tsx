import { Cadence } from 'models/billing/types'
import { getCadenceName } from 'models/billing/utils'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'

import css from './BillingFrequency.less'

export type BillingFrequencyProps = {
    selectedCadence: Cadence | null
    onCadenceSelect: (cadence: Cadence) => void
    disabledCadences?: Set<Cadence>
}

const BillingFrequency = ({
    selectedCadence,
    onCadenceSelect,
    disabledCadences = new Set(),
}: BillingFrequencyProps) => {
    const hasDisabledCadences = disabledCadences.size > 0
    const disabledCadenceNames = Array.from(disabledCadences)
        .map((cadence) => getCadenceName(cadence))
        .join(' and ')
    return (
        <div className={css.container}>
            <div className={css.radioButtons}>
                {Object.values(Cadence).map((cadence) => (
                    <PreviewRadioButton
                        key={cadence}
                        isSelected={selectedCadence === cadence}
                        value={cadence}
                        onClick={() => onCadenceSelect(cadence)}
                        label={getCadenceName(cadence)}
                        isDisabled={disabledCadences.has(cadence)}
                    />
                ))}
            </div>
            {hasDisabledCadences && (
                <div className={css.disabledMessage}>
                    <i className="material-icons">info</i>
                    <span>
                        {disabledCadenceNames} billing is not available for your
                        current plan configuration. Please contact our billing
                        team via chat or at{' '}
                        <a href="mailto:support@gorgias.com">
                            support@gorgias.com
                        </a>{' '}
                        to change your billing frequency.
                    </span>
                </div>
            )}
        </div>
    )
}

export default BillingFrequency
