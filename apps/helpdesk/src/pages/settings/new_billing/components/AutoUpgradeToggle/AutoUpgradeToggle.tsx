import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

import classnames from 'classnames'
import { useLocation } from 'react-router-dom'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import warningIcon from 'assets/img/icons/warning.svg'
import type { Plan, ProductType } from 'models/billing/types'
import {
    getPlanPriceFormatted,
    getPlanUnitsPerCadence,
    isEnterprise,
} from 'models/billing/utils'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ToggleInput from 'pages/common/forms/ToggleInput'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'

import type { SelectedPlans } from '../../types'
import { getNextTier } from '../../utils/getNextTier'

import css from './AutoUpgradeToggle.less'

export type AutoUpgradeToggleProps = {
    type: ProductType
    selectedPlans: SelectedPlans
    setSelectedPlans: React.Dispatch<React.SetStateAction<SelectedPlans>>
    availablePlans?: Plan[]
}

const AutoUpgradeToggle = ({
    type,
    selectedPlans,
    setSelectedPlans,
    availablePlans = [],
}: AutoUpgradeToggleProps) => {
    const selectedPlan = selectedPlans[type]
    const [isModalOpen, setIsModalOpen] = useState(false)
    const isConvertSubscriber = useIsConvertSubscriber()
    const location = useLocation()

    const autoUpgradeValue = Boolean(selectedPlan.autoUpgrade)

    const nextTier =
        selectedPlan.plan && getNextTier(availablePlans, selectedPlan.plan)

    const { nextTierAmount, nextTierName } = useMemo(() => {
        if (nextTier) {
            return {
                nextTierAmount: getPlanPriceFormatted(nextTier),
                nextTierName: getPlanUnitsPerCadence(nextTier),
            }
        }
        return { nextTierAmount: null, nextTierName: null }
    }, [nextTier])

    const isEnterprisePlan = isEnterprise(selectedPlan.plan) || !nextTier

    const handleAutoUpgradePlan = (nextValue: boolean) => {
        setSelectedPlans((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                autoUpgrade: nextValue,
            },
        }))
    }

    useEffect(() => {
        // Auto-select auto-upgrade on subscribe to Convert or arriving from CTA link
        if (!isConvertSubscriber || location.hash === '#auto-upgrade') {
            handleAutoUpgradePlan(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConvertSubscriber])

    return (
        <>
            <div className={css.container}>
                <div className={css.separator}></div>
                <div
                    className={classnames({
                        [css.flex]: !isEnterprisePlan,
                    })}
                >
                    <ToggleInput
                        isToggled={autoUpgradeValue}
                        onClick={handleAutoUpgradePlan}
                        aria-label={`Enable auto-upgrade`}
                        isDisabled={isEnterprisePlan}
                        className="mr-4"
                        caption={
                            isEnterprisePlan ? (
                                <>
                                    Auto-upgrade is not available for the
                                    selected plan.
                                </>
                            ) : (
                                <>
                                    Get automatically upgraded to the next plan
                                    if you reach your click allowance to keep
                                    displaying campaigns to your customers.
                                </>
                            )
                        }
                    >
                        <span className={css.label}>
                            Click allowance auto-upgrade
                        </span>
                        {!autoUpgradeValue && !isEnterprisePlan && (
                            <>
                                <img
                                    src={warningIcon}
                                    alt="warning icon"
                                    id={`auto-upgrade-disabled-${type}`}
                                    className={`material-icons ${css.warning} ml-1`}
                                />
                                <Tooltip
                                    target={`auto-upgrade-disabled-${type}`}
                                    placement="top-start"
                                >
                                    Without auto-upgrade, campaigns will stop
                                    being displayed if you reach 100% of your
                                    allowance before the end of the billing
                                    period.
                                </Tooltip>
                            </>
                        )}
                    </ToggleInput>
                    {!isEnterprisePlan && (
                        <div>
                            <Button
                                fillStyle="ghost"
                                size="small"
                                intent="secondary"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Learn more
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <Modal
                size="medium"
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <ModalHeader title="Keep your campaigns live at any time!" />
                <ModalBody className="p-3">
                    <p>
                        Maximize your revenue from campaigns by keeping them
                        live even if you reach your monthly allowance before the
                        end of your billing period.
                    </p>
                    <p>
                        <b>Activate auto-upgrade</b> to prevent campaign
                        distribution interruption. If you reach your click
                        allowance, we will automatically upgrade you to the next
                        Convert plan, and campaigns will continue to be
                        displayed to your customers.
                    </p>
                    <ul>
                        <li>
                            {`You'll be charged a proportion of ${nextTierAmount}
                            (plus tax) based on the number of days remaining in
                            the billing period.`}
                        </li>
                        <li>
                            {`You'll stay on the new plan after the auto-upgrade (
                            ${nextTierName} for ${nextTierAmount}).`}
                        </li>
                        <li>
                            Once upgraded, auto-upgrade will be deactivated and
                            can be reactivated manually. You can turn it back on
                            in <b>Settings &gt; Billing & usage</b>.
                        </li>
                    </ul>
                </ModalBody>
            </Modal>
        </>
    )
}

export default AutoUpgradeToggle
