import React, {useCallback, useContext, useMemo, useState} from 'react'
import classnames from 'classnames'
import {Container} from 'reactstrap'
import {Map} from 'immutable'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'
import PageHeader from 'pages/common/components/PageHeader'
import {
    ONBOARDING_WIZARD_LABELS,
    OnboardingWizardSteps,
} from 'pages/convert/onboarding/components/ConvertOnboardingWizardView/constants'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import history from 'pages/history'
import {useUpdateChannelConnection} from 'pages/convert/channelConnections/hooks/useUpdateChannelConnection'
import {ChannelConnection} from 'models/convert/channelConnection/types'
import {WizardContext} from 'pages/common/components/wizard/Wizard'

import {useInstallBundle} from 'pages/convert/bundles/hooks/useInstallBundle'
import ConvertInstallModal from 'pages/convert/bundles/components/ConvertInstallModal'
import {
    BundleActionResponse,
    BundleInstallationMethod,
} from 'models/convert/bundle/types'
import useIsManualInstallationMethodRequired from 'pages/convert/common/hooks/useIsManualInstallationMethodRequired'
import WizardFooter from '../WizardFooter'
import WizardCampaignsStep from '../WizardCampaignsStep'
import WizardInstallStep from '../WizardInstallStep'
import css from './WizardLayout.less'

type Props = {
    steps: OnboardingWizardSteps[]
    channelConnection: ChannelConnection | null
    integration: Map<any, any>
    storeIntegration: Map<any, any>
}

const WizardLayout = ({
    steps,
    integration,
    channelConnection,
    storeIntegration,
}: Props) => {
    const wizardContext = useContext(WizardContext)
    const {goToPreviousStep, goToNextStep} = useNavigateWizardSteps()
    const updateChannelConnection = useUpdateChannelConnection()

    const chatIntegrationId = integration.get('id') as number

    const isManualMethodRequired = useIsManualInstallationMethodRequired(
        integration.toJS(),
        storeIntegration.toJS()
    )

    // Install bundle
    const [installationMethod, setInstallationMethod] =
        useState<BundleInstallationMethod>(
            isManualMethodRequired
                ? BundleInstallationMethod.Manual
                : BundleInstallationMethod.OneClick
        )

    const [bundleData, setBundleData] = useState<BundleActionResponse>()

    const [isInstallModalOpen, setInstallModalOpen] = useState(false)

    const {isSubmitting, installBundle} = useInstallBundle(
        storeIntegration.get('id'),
        installationMethod
    )

    const nextStepLabel = useMemo(() => {
        if (
            wizardContext?.activeStep === OnboardingWizardSteps.Install &&
            installationMethod === BundleInstallationMethod.Manual
        ) {
            return 'Install manually'
        }

        return 'Finish Setup'
    }, [installationMethod, wizardContext?.activeStep])

    // Callbacks
    const handleFinishSetup = useCallback(async () => {
        if (updateChannelConnection.isLoading) return

        if (!!channelConnection) {
            await updateChannelConnection.mutateAsync([
                undefined,
                {channel_connection_id: channelConnection.id},
                {is_onboarded: true},
            ])
        }
    }, [channelConnection, updateChannelConnection])

    const handleNextStep = useCallback(async () => {
        if (wizardContext?.nextStep) {
            return goToNextStep()
        }

        if (wizardContext?.activeStep === OnboardingWizardSteps.Install) {
            const data = await installBundle()

            if (data) {
                setBundleData(data)
            } else {
                return
            }

            if (installationMethod === BundleInstallationMethod.Manual) {
                setInstallModalOpen(true)
                return
            }
        }

        await handleFinishSetup()
    }, [
        goToNextStep,
        handleFinishSetup,
        installBundle,
        installationMethod,
        wizardContext,
    ])

    const handleBack = useCallback(() => {
        if (wizardContext?.previousStep) {
            goToPreviousStep()
        } else {
            history.push(`/app/convert/${chatIntegrationId}/setup`)
        }
    }, [chatIntegrationId, goToPreviousStep, wizardContext])

    return (
        <div className={classnames('full-width', css.pageWrapper)}>
            <PageHeader title="Convert" />
            <Container fluid className={css.container}>
                {steps.length > 1 && (
                    <div className={css.wizardProgressHeader}>
                        <WizardProgressHeader
                            labels={ONBOARDING_WIZARD_LABELS}
                        />
                    </div>
                )}
                <WizardStep name={OnboardingWizardSteps.Campaigns}>
                    <WizardCampaignsStep integration={integration} />
                </WizardStep>
                <WizardStep name={OnboardingWizardSteps.Install}>
                    <WizardInstallStep
                        integration={integration}
                        isManualMethodRequired={isManualMethodRequired}
                        installationMethod={installationMethod}
                        setInstallationMethod={setInstallationMethod}
                    />
                    <ConvertInstallModal
                        isOpen={isInstallModalOpen}
                        integration={storeIntegration}
                        chatIntegration={integration}
                        onSubmit={handleFinishSetup}
                        onClose={() => setInstallModalOpen(false)}
                        initialBundleData={bundleData}
                    />
                </WizardStep>
            </Container>
            <WizardFooter
                integrationId={chatIntegrationId}
                nextStepLabel={nextStepLabel}
                handleNextStep={handleNextStep}
                handleBack={handleBack}
                isLoading={isSubmitting}
            />
        </div>
    )
}

export default WizardLayout
