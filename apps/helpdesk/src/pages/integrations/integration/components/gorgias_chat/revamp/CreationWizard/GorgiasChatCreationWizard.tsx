import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

import type { Map } from 'immutable'
import { Link, Redirect } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { IntegrationType } from 'models/integration/types'
import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
} from 'models/integration/types/gorgiasChat'
import { PageHeader } from 'pages/common/components/PageHeader'
import { Wizard } from 'pages/common/components/wizard/Wizard'
import { WizardStep } from 'pages/common/components/wizard/WizardStep'
import {
    ChatPreviewPanelContext,
    useChatPreviewPanel,
} from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { GorgiasChatCreationWizardStepAutomate } from './steps/Automate/GorgiasChatCreationWizardStepAutomate'
import { GorgiasChatCreationWizardStepBasics } from './steps/Basics/GorgiasChatCreationWizardStepBasics'
import { GorgiasChatCreationWizardStepBranding } from './steps/Brand/GorgiasChatCreationWizardStepBranding'
import { GorgiasChatCreationWizardStepInstallation } from './steps/Installation/GorgiasChatCreationWizardStepInstallation'

import css from './GorgiasChatCreationWizard.less'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    isUpdate: boolean
}

const GorgiasChatCreationWizard: React.FC<Props> = ({
    integration,
    loading,
    isUpdate,
}) => {
    const { ...chatPreviewPanel } = useChatPreviewPanel()

    const { hasAccess: hasAiAgentAccess, isLoading: isAiAgentAccessLoading } =
        useAiAgentAccess()

    const steps = useMemo(() => {
        const allSteps = Object.values(GorgiasChatCreationWizardSteps)
        if (!hasAiAgentAccess) {
            return allSteps.filter(
                (step) => step !== GorgiasChatCreationWizardSteps.Automate,
            )
        }
        return allSteps
    }, [hasAiAgentAccess])

    const integrationId = integration.get('id')

    const [hasIntegrationLoaded, setHasIntegrationLoaded] = useState(
        !isUpdate || integrationId,
    )

    const wizardStatus = integration.getIn(['meta', 'wizard', 'status'])

    const wizardStep = integration.getIn(
        ['meta', 'wizard', 'step'],
        GorgiasChatCreationWizardSteps.Basics,
    )

    const initialStep = wizardStep

    useEffect(() => {
        if (!isUpdate || integrationId) {
            setHasIntegrationLoaded(true)
        }
    }, [isUpdate, integrationId])

    const name = integration.get('name')

    const isSubmitting =
        loading.get('updateIntegration') === integration.get('id', true)

    return (
        <>
            {wizardStatus === GorgiasChatCreationWizardStatus.Published && (
                <Redirect to="/app/settings/channels/gorgias_chat" />
            )}
            <div className={css.page}>
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link
                                    to={`/app/settings/channels/${IntegrationType.GorgiasChat}`}
                                >
                                    Chat
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {isUpdate ? name : 'New Chat'}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />
                <div className={css.wrapper}>
                    {hasIntegrationLoaded && !isAiAgentAccessLoading && (
                        <ChatPreviewPanelContext.Provider
                            value={chatPreviewPanel}
                        >
                            <Wizard steps={steps} startAt={initialStep}>
                                <WizardStep
                                    name={GorgiasChatCreationWizardSteps.Basics}
                                >
                                    <GorgiasChatCreationWizardStepBasics
                                        isUpdate={isUpdate}
                                        isSubmitting={isSubmitting}
                                        integration={integration}
                                    />
                                </WizardStep>
                                <WizardStep
                                    name={
                                        GorgiasChatCreationWizardSteps.Branding
                                    }
                                >
                                    <GorgiasChatCreationWizardStepBranding
                                        isSubmitting={isSubmitting}
                                        integration={integration}
                                    />
                                </WizardStep>
                                {hasAiAgentAccess && (
                                    <WizardStep
                                        name={
                                            GorgiasChatCreationWizardSteps.Automate
                                        }
                                    >
                                        <GorgiasChatCreationWizardStepAutomate
                                            isSubmitting={isSubmitting}
                                            integration={integration}
                                        />
                                    </WizardStep>
                                )}
                                <WizardStep
                                    name={
                                        GorgiasChatCreationWizardSteps.Installation
                                    }
                                >
                                    <GorgiasChatCreationWizardStepInstallation
                                        isSubmitting={isSubmitting}
                                        integration={integration}
                                    />
                                </WizardStep>
                            </Wizard>
                        </ChatPreviewPanelContext.Provider>
                    )}
                </div>
            </div>
        </>
    )
}

export { GorgiasChatCreationWizard }
