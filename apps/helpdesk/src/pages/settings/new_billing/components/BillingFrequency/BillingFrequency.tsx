import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { Cadence } from 'models/billing/types'
import { getCadenceName, isOtherCadenceDowngrade } from 'models/billing/utils'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'

import css from './BillingFrequency.less'

export type BillingFrequencyProps = {
    currentCadence: Cadence
    selectedCadence: Cadence | null
    allowDowngrades: boolean
    disabledCadences?: Set<Cadence>
    onCadenceSelect: (cadence: Cadence) => void
}

const BillingFrequency = ({
    currentCadence,
    selectedCadence,
    allowDowngrades,
    disabledCadences = new Set(),
    onCadenceSelect,
}: BillingFrequencyProps) => {
    const canUseQuarterlyBilling =
        useFlag(FeatureFlagKey.BillingQuarterlyFrequency) ||
        currentCadence === Cadence.Quarter

    const hasDisabledCadences = disabledCadences.size > 0
    const disabledCadenceNames = Array.from(disabledCadences)
        .filter(
            (cadence: Cadence) =>
                cadence !== Cadence.Quarter || canUseQuarterlyBilling,
        )
        .map((cadence) => getCadenceName(cadence))
        .join(' and ')

    return (
        <div className={css.container}>
            <div className={css.radioButtons}>
                {Object.values(Cadence)
                    .filter(
                        (cadence: Cadence) =>
                            cadence !== Cadence.Quarter ||
                            canUseQuarterlyBilling,
                    )
                    .map((cadence) => (
                        <PreviewRadioButton
                            key={cadence}
                            isSelected={selectedCadence === cadence}
                            value={cadence}
                            onClick={() => onCadenceSelect(cadence)}
                            label={getCadenceName(cadence)}
                            isDisabled={
                                disabledCadences.has(cadence) ||
                                (!allowDowngrades &&
                                    isOtherCadenceDowngrade(
                                        currentCadence,
                                        cadence,
                                    ))
                            }
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
