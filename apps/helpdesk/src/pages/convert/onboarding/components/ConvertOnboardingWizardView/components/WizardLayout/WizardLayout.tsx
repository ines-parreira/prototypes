import React, { useCallback, useContext, useMemo, useState } from 'react'

import { reportError } from '@repo/logging'
import { history } from '@repo/routing'
import { useQueryClient } from '@tanstack/react-query'
import classnames from 'classnames'
import type { Map } from 'immutable'
import { Container } from 'reactstrap'

import { getPrimaryLanguageFromChatConfig } from 'config/integrations/gorgias_chat'
import type { BundleActionResponse } from 'models/convert/bundle/types'
import { BundleInstallationMethod } from 'models/convert/bundle/types'
import {
    campaignKeys,
    useCreateCampaign,
    useListCampaigns,
} from 'models/convert/campaign/queries'
import type { ChannelConnection } from 'models/convert/channelConnection/types'
import type { GorgiasChatIntegration } from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import { WizardContext } from 'pages/common/components/wizard/Wizard'
import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import ConvertInstallModal from 'pages/convert/bundles/components/ConvertInstallModal'
import { useInstallBundle } from 'pages/convert/bundles/hooks/useInstallBundle'
import { ONBOARDING_CAMPAIGN_TEMPLATES_LIST } from 'pages/convert/campaigns/templates'
import { useUpdateChannelConnection } from 'pages/convert/channelConnections/hooks/useUpdateChannelConnection'
import useIsManualInstallationMethodRequired from 'pages/convert/common/hooks/useIsManualInstallationMethodRequired'
import {
    ONBOARDING_WIZARD_LABELS,
    OnboardingWizardSteps,
} from 'pages/convert/onboarding/components/ConvertOnboardingWizardView/constants'

import WizardCampaignsStep from '../WizardCampaignsStep'
import WizardFooter from '../WizardFooter'
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
    const { goToPreviousStep, goToNextStep } = useNavigateWizardSteps()
    const queryClient = useQueryClient()
    const updateChannelConnection = useUpdateChannelConnection()

    const chatIntegration = integration.toJS() as GorgiasChatIntegration

    const createCampaign = useCreateCampaign()
    const { data: campaigns } = useListCampaigns(
        {
            channelConnectionId: channelConnection?.id,
        },
        {
            enabled: !!channelConnection,
        },
    )

    const chatIntegrationId = integration.get('id') as number

    const isManualMethodRequired = useIsManualInstallationMethodRequired(
        chatIntegration,
        storeIntegration.toJS(),
    )

    // Install bundle
    const [installationMethod, setInstallationMethod] =
        useState<BundleInstallationMethod>(
            isManualMethodRequired
                ? BundleInstallationMethod.Manual
                : BundleInstallationMethod.OneClick,
        )

    const [bundleData, setBundleData] = useState<BundleActionResponse>()

    const [isInstallModalOpen, setInstallModalOpen] = useState(false)

    const { isSubmitting, installBundle } = useInstallBundle(
        storeIntegration.get('id'),
        installationMethod,
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

    const uncreatedCampaigns = useMemo(() => {
        if (!campaigns) return ONBOARDING_CAMPAIGN_TEMPLATES_LIST

        return ONBOARDING_CAMPAIGN_TEMPLATES_LIST.filter(
            (template) =>
                !campaigns.some(
                    (campaign) => campaign.template_id === template.slug,
                ),
        )
    }, [campaigns])

    // Callbacks
    const handleFinishSetup = useCallback(async () => {
        if (!!channelConnection) {
            try {
                await Promise.all(
                    uncreatedCampaigns.map(async (campaign) => {
                        const data = await campaign.getConfiguration(
                            storeIntegration,
                            integration,
                        )
                        await createCampaign.mutateAsync([
                            undefined,
                            {
                                ...data,
                                variants: [],
                                language: getPrimaryLanguageFromChatConfig(
                                    chatIntegration.meta,
                                ),
                                channel_connection_id: channelConnection.id,
                            },
                        ])
                    }),
                )
            } catch (e) {
                // do not block the onboarding process if there is an error in creating default campaigns
                reportError(e, {
                    tags: {
                        section: 'convert-onboarding',
                        team: 'convert',
                    },
                })
            }

            await queryClient.invalidateQueries({
                queryKey: campaignKeys.list({
                    channelConnectionId: channelConnection.id,
                }),
            })

            await updateChannelConnection.mutateAsync([
                undefined,
                { channel_connection_id: channelConnection.id },
                { is_onboarded: true },
            ])
        }
    }, [
        channelConnection,
        chatIntegration,
        createCampaign,
        integration,
        queryClient,
        storeIntegration,
        uncreatedCampaigns,
        updateChannelConnection,
    ])

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
                isLoading={
                    isSubmitting ||
                    updateChannelConnection.isLoading ||
                    createCampaign.isLoading
                }
            />
        </div>
    )
}

export default WizardLayout
