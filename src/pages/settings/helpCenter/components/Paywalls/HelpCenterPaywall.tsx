import React, {useState} from 'react'

import helpCenterImagePreview from 'assets/img/paywalls/screens/helpcenter.png'
import {PlanInterval} from 'models/billing/types'
import Paywall, {PaywallTheme} from 'pages/common/components/Paywall/Paywall'
import UpgradeButton from 'pages/common/components/UpgradeButton'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentPlan, getPlans} from 'state/billing/selectors'
import {openChat} from 'utils'
import {convertLegacyPlanNameToPublicPlanName, PlanName} from 'utils/paywalls'

import HelpCenterChangePlanModal from './HelpCenterChangePlanModal'

const HelpCenterPaywall = (): JSX.Element => {
    const [isPlanChangeModalOpen, setIsPlanChangeModalOpen] = useState(false)
    const plans = useAppSelector(getPlans)
    const currentPlan = useAppSelector(getCurrentPlan)
    const currentPlanName = currentPlan
        ? convertLegacyPlanNameToPublicPlanName(currentPlan.name)
        : null

    const displayContactUsButton = currentPlanName === PlanName.Enterprise
    const isEnterprisePlan = !!currentPlan?.custom
    const availablePlans = plans.filter(
        (plan) =>
            plan.interval === (currentPlan?.interval || PlanInterval.Month) &&
            plan.public &&
            !plan.custom
    )
    const suitablePlanWithoutAutomationAddOn =
        !isEnterprisePlan &&
        availablePlans.find(
            (plan) =>
                plan.name === currentPlanName && !plan.automation_addon_included
        )

    return (
        <Paywall
            pageHeader="Help Center"
            requiredUpgrade={currentPlanName || PlanName.Basic}
            header="Change plans to activate your Help Center"
            description={
                <>
                    Create your own help center in order to help users better
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
                currentPlan &&
                suitablePlanWithoutAutomationAddOn && (
                    <HelpCenterChangePlanModal
                        currentPlan={currentPlan}
                        suitablePlanWithoutAutomationAddOn={
                            suitablePlanWithoutAutomationAddOn
                        }
                        isOpen={isPlanChangeModalOpen}
                        onClose={() => setIsPlanChangeModalOpen(false)}
                    />
                )
            }
        />
    )
}

export default HelpCenterPaywall
