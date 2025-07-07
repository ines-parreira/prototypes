import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialAlertBanner } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

export const TrialManageWorkflow = () => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { trialStartedBanner } = useTrialModalProps({})
    const { storeActivations } = useStoreActivations()
    const { gmv } = useTrialMetrics()

    const { canSeeTrialStartedBanner, canBookDemo } =
        useShoppingAssistantTrialAccess()

    const accountDomain = currentAccount.get('domain')

    const {
        openManageTrialModal,
        isManageTrialModalOpen,
        closeManageTrialModal,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
    })

    const handleManageTrial = () => {
        openManageTrialModal()
    }

    const primaryAction = useMemo(() => {
        if (canBookDemo) {
            return {
                label: 'Book a demo',
                onClick: () => {
                    window.open(
                        'https://www.gorgias.com/demo/customers/automate',
                        '_blank',
                    )
                },
            }
        }

        return {
            label: 'Upgrade Now',
            onClick: () => {},
        }
    }, [canBookDemo])

    return (
        <>
            {canSeeTrialStartedBanner && (
                <TrialAlertBanner
                    {...trialStartedBanner}
                    primaryAction={primaryAction}
                    secondaryAction={{
                        label: 'Manage Trial',
                        onClick: handleManageTrial,
                    }}
                />
            )}
            {isManageTrialModalOpen && (
                <TrialManageModal
                    title="Manage Shopping Assistant trial"
                    description={`Shopping Assistant drove ${gmv} uplift in GMV. Don’t lose momentum now – keep the gains going by upgrading today. `}
                    advantages={[`${gmv} GMV uplift`]}
                    onClose={closeManageTrialModal}
                    primaryAction={{
                        label: 'Upgrade Now',
                        onClick: () => {},
                    }}
                    secondaryAction={{
                        label: 'Opt Out',
                        onClick: closeManageTrialModal,
                    }}
                />
            )}
        </>
    )
}
