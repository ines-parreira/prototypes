import type React from 'react'
import { useEffect, useState } from 'react'

import type { Map } from 'immutable'
import { Link, Redirect } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { IntegrationType } from 'models/integration/types'
import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
} from 'models/integration/types/gorgiasChat'
import PageHeader from 'pages/common/components/PageHeader'
import Wizard from 'pages/common/components/wizard/Wizard'
import WizardStep from 'pages/common/components/wizard/WizardStep'

import GorgiasChatCreationWizardStepAutomate from './components/steps/GorgiasChatCreationWizardStepAutomate'
import GorgiasChatCreationWizardStepBasics from './components/steps/GorgiasChatCreationWizardStepBasics'
import GorgiasChatCreationWizardStepBranding from './components/steps/GorgiasChatCreationWizardStepBranding'
import { GorgiasChatCreationWizardStepInstallation } from './components/steps/GorgiasChatCreationWizardStepInstallation'

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
    const steps = Object.values(GorgiasChatCreationWizardSteps)

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
                    {hasIntegrationLoaded && (
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
                                name={GorgiasChatCreationWizardSteps.Automate}
                            >
                                <GorgiasChatCreationWizardStepAutomate
                                    isSubmitting={isSubmitting}
                                    integration={integration}
                                />
                            </WizardStep>
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
                    )}
                </div>
            </div>
        </>
    )
}

export default GorgiasChatCreationWizard
