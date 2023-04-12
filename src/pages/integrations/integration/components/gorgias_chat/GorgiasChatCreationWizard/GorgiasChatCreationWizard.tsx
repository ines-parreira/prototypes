import React from 'react'
import {Map} from 'immutable'
import {Link, Redirect} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import {IntegrationType} from 'models/integration/types'

import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
} from 'models/integration/types/gorgiasChat'

import Wizard from 'pages/common/components/wizard/Wizard'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import PageHeader from 'pages/common/components/PageHeader'

import GorgiasChatCreationWizardStepBasics from './components/steps/GorgiasChatCreationWizardStepBasics'
import GorgiasChatCreationWizardStepBranding from './components/steps/GorgiasChatCreationWizardStepBranding'
import GorgiasChatCreationWizardStepInstallation from './components/steps/GorgiasChatCreationWizardStepInstallation'

import css from './GorgiasChatCreationWizard.less'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    isUpdate: boolean
}

const steps = Object.values(GorgiasChatCreationWizardSteps)

const GorgiasChatCreationWizard: React.FC<Props> = ({
    integration,
    loading,
    isUpdate,
}) => {
    const isAutomationSettingsRevampEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]

    const wizardStatus = integration.getIn(['meta', 'wizard', 'status'])

    const initialStep = integration.getIn(
        ['meta', 'wizard', 'step'],
        GorgiasChatCreationWizardSteps.Basics
    )

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
                                {isUpdate
                                    ? name
                                    : isAutomationSettingsRevampEnabled
                                    ? 'New Chat'
                                    : 'New chat integration'}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />
                <div className={css.wrapper}>
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
                            name={GorgiasChatCreationWizardSteps.Branding}
                        >
                            <GorgiasChatCreationWizardStepBranding
                                isSubmitting={isSubmitting}
                                integration={integration}
                            />
                        </WizardStep>
                        <WizardStep
                            name={GorgiasChatCreationWizardSteps.Installation}
                        >
                            <GorgiasChatCreationWizardStepInstallation
                                integration={integration}
                            />
                        </WizardStep>
                    </Wizard>
                </div>
            </div>
        </>
    )
}

export default GorgiasChatCreationWizard
