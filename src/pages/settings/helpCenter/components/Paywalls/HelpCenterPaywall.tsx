import React, {useState} from 'react'
import {Map} from 'immutable'

import helpCenterImagePreview from 'assets/img/paywalls/screens/helpcenter.png'
import {PlanInterval} from 'models/billing/types'
import Paywall, {PaywallTheme} from 'pages/common/components/Paywall/Paywall'
import UpgradeButton from 'pages/common/components/UpgradeButton'
import useAppSelector from 'hooks/useAppSelector'
import {
    DEPRECATED_getCurrentPlan,
    DEPRECATED_getPlans,
} from 'state/billing/selectors'
import {openChat} from 'utils'
import {convertLegacyPlanNameToPublicPlanName, PlanName} from 'utils/paywalls'

import HelpCenterChangePlanModal from './HelpCenterChangePlanModal'

const HelpCenterPaywall = (): JSX.Element => {
    const [isPlanChangeModalOpen, setIsPlanChangeModalOpen] = useState(false)
    const plans = useAppSelector(DEPRECATED_getPlans)
    const currentPlan = useAppSelector(DEPRECATED_getCurrentPlan)
    const planName = currentPlan.get('name') as string
    const currentPlanName = convertLegacyPlanNameToPublicPlanName(planName)

    const displayContactUsButton = currentPlanName === PlanName.Enterprise
    const isEnterprisePlan = currentPlan.get('custom', false) as boolean
    const availablePlans = plans.filter(
        (plan: Map<any, any>) =>
            (plan.get('interval') as string) ===
                (currentPlan.get('interval') || PlanInterval.Month) &&
            (plan.get('public') as boolean) &&
            !(plan.get('custom') as boolean)
    ) as Map<any, any>
    const suitablePlanWithoutAutomationAddOn: Map<any, any> =
        !isEnterprisePlan &&
        availablePlans.find(
            (plan: Map<any, any>) =>
                plan.get('name') === currentPlanName &&
                plan.get('automation_addon_included', false) === false
        )

    return (
        <Paywall
            pageHeader="Help Center"
            requiredUpgrade={currentPlanName}
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
            paywallTheme={currentPlanName as string as PaywallTheme}
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
                suitablePlanWithoutAutomationAddOn && (
                    <HelpCenterChangePlanModal
                        currentPlan={currentPlan}
                        suitablePlanWithoutAutomationAddOn={suitablePlanWithoutAutomationAddOn.toJS()}
                        isOpen={isPlanChangeModalOpen}
                        onClose={() => setIsPlanChangeModalOpen(false)}
                    />
                )
            }
        />
    )
}

export default HelpCenterPaywall
