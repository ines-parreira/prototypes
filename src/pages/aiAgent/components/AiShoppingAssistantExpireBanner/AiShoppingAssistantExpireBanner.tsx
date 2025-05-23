import { useMemo } from 'react'

import moment from 'moment'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { getAiShoppingAssistantTrialExtensionEnabledFlag } from 'pages/aiAgent/Activation/utils'
import { AIButton } from 'pages/common/components/AIButton/AIButton'
import { getCurrentAutomatePlan } from 'state/billing/selectors'

import css from './AiShoppingAssistantExpireBanner.less'

type AiShoppingAssistantExpireBannerProps = {
    deactiveDatetime?: string
}
const AiShoppingAssistantExpireBanner: React.FC<
    AiShoppingAssistantExpireBannerProps
> = ({ deactiveDatetime }) => {
    const bypassPlanCheck = useFlag(
        FeatureFlagKey.AiSalesAgentBypassPlanCheck,
        false,
    )
    const trialExtensionPeriodInDays =
        getAiShoppingAssistantTrialExtensionEnabledFlag()
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const hasNewAutomatePlan = (currentAutomatePlan?.generation ?? 0) >= 6

    const { earlyAccessModal, showEarlyAccessModal } = useActivation(
        window.location.pathname,
    )

    const days = useMemo(() => {
        if (!deactiveDatetime) {
            return undefined
        }

        const deactiveDate = moment(deactiveDatetime)
        const currentDate = moment()
        if (trialExtensionPeriodInDays) {
            return deactiveDate
                .add(trialExtensionPeriodInDays, 'days')
                .diff(currentDate, 'days')
        }
        return deactiveDate.diff(currentDate, 'days')
    }, [deactiveDatetime, trialExtensionPeriodInDays])

    if (
        days === undefined ||
        days < 0 ||
        !(bypassPlanCheck || !hasNewAutomatePlan)
    ) {
        return null
    }

    return (
        <>
            <div className={css.container}>
                <div className={css.contentContainer}>
                    <div className={css.title}>
                        Your trial for Shopping Assistant expires{' '}
                        {days > 0 ? `in ${days} days` : `today`}.
                    </div>
                    <div className={css.content}>
                        Shopping Assistant is already driving more revenue for
                        your store. Let’s keep that going—upgrade now and stay
                        ahead.
                    </div>
                </div>
                <div className={css.buttonContainer}>
                    <AIButton onClick={showEarlyAccessModal}>Upgrade</AIButton>
                </div>
            </div>
            {earlyAccessModal}
        </>
    )
}

export default AiShoppingAssistantExpireBanner
