import React, {useMemo, useState} from 'react'

import helpCenterImagePreview from 'assets/img/paywalls/screens/helpcenter.png'
import Paywall, {PaywallTheme} from 'pages/common/components/Paywall/Paywall'
import UpgradeButton from 'pages/common/components/UpgradeButton'
import useAppSelector from 'hooks/useAppSelector'
import {HelpdeskPrice, PlanInterval} from 'models/billing/types'
import {isHelpdeskPrice} from 'models/billing/utils'
import {getCurrentHelpdeskProduct, getPrices} from 'state/billing/selectors'
import {openChat} from 'utils'
import {convertLegacyPlanNameToPublicPlanName, PlanName} from 'utils/paywalls'

import HelpCenterChangePlanModal from './HelpCenterChangePlanModal'

const HelpCenterPaywall = (): JSX.Element => {
    const [isPlanChangeModalOpen, setIsPlanChangeModalOpen] = useState(false)
    const helpdeskPrice = useAppSelector(getCurrentHelpdeskProduct)
    const currentPlanName = helpdeskPrice
        ? convertLegacyPlanNameToPublicPlanName(helpdeskPrice.name)
        : null
    const displayContactUsButton = currentPlanName === PlanName.Enterprise
    const isEnterprisePlan = !!helpdeskPrice?.custom
    const prices = useAppSelector(getPrices)
    const availableHelpdeskPrice = useMemo(
        () =>
            prices.find(
                (price) =>
                    isHelpdeskPrice(price) &&
                    price.public &&
                    price.interval ===
                        (helpdeskPrice?.interval || PlanInterval.Month) &&
                    !price.custom &&
                    price.name === currentPlanName
            ) as HelpdeskPrice,
        [currentPlanName, helpdeskPrice, prices]
    )

    return (
        <Paywall
            pageHeader="Help Center"
            requiredUpgrade={currentPlanName || PlanName.Basic}
            header="Change plans to activate your Help Center"
            description={
                <>
                    Create your own Help Center in order to help users better
                    understand your product and answer frequently asked
                    questions.
                    {currentPlanName === PlanName.Enterprise
                        ? 'Contact your customer success manager to upgrade today!'
                        : currentPlanName === PlanName.Advanced
                        ? 'You can contact your customer success manager or do it from here to upgrade today!'
                        : null}
                </>
            }
            paywallTheme={
                (currentPlanName as unknown as PaywallTheme) ||
                PaywallTheme.Default
            }
            previewImage={helpCenterImagePreview}
            customCta={
                displayContactUsButton ? (
                    <UpgradeButton
                        className="mb-5 d-inline-block"
                        onClick={(e) => e && openChat(e)}
                        label="Contact Us"
                    />
                ) : (
                    <UpgradeButton
                        className="mb-5 d-inline-block"
                        onClick={() => setIsPlanChangeModalOpen(true)}
                        label="Upgrade Your Plan"
                    />
                )
            }
            shouldKeepPlan
            modal={
                !isEnterprisePlan &&
                availableHelpdeskPrice && (
                    <HelpCenterChangePlanModal
                        helpdeskPrice={availableHelpdeskPrice}
                        isOpen={isPlanChangeModalOpen}
                        onClose={() => setIsPlanChangeModalOpen(false)}
                    />
                )
            }
        />
    )
}

export default HelpCenterPaywall
