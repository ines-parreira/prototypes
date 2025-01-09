import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import React, {useMemo} from 'react'
import {useParams} from 'react-router-dom'

import {
    AiAgentOnboardingWizardStep,
    StoreConfiguration,
} from 'models/aiAgent/types'
import {useAiAgentStoreConfigurationContext} from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import PageHeader from 'pages/common/components/PageHeader'
import Wizard from 'pages/common/components/wizard/Wizard'
import WizardStep from 'pages/common/components/wizard/WizardStep'

import {isAiAgentOnboardingWizardStep} from '../components/StoreConfigForm/StoreConfigForm.utils'
import css from './AiAgentOnboardingWizard.less'
import AiAgentOnboardingWizardKnowledge from './AiAgentOnboardingWizardKnowledge'
import AiAgentOnboardingWizardPersonalize from './AiAgentOnboardingWizardPersonalize'

export type AiAgentOnboardingWizardProps = {
    shopType: string
    shopName: string
    storeConfiguration?: StoreConfiguration
}

const AiAgentOnboardingWizardComponent = (
    props: AiAgentOnboardingWizardProps
) => {
    const steps = useMemo(() => Object.values(AiAgentOnboardingWizardStep), [])

    const stepName = props.storeConfiguration?.wizard?.stepName

    const wizardStep =
        stepName && isAiAgentOnboardingWizardStep(stepName)
            ? stepName
            : AiAgentOnboardingWizardStep.Personalize

    return (
        <>
            <div className={classnames(css.page, 'ai-agent-onboarding-wizard')}>
                <PageHeader title="Set up AI Agent" />
                <div className={css.wrapper}>
                    <Wizard steps={steps} startAt={wizardStep}>
                        <WizardStep
                            name={AiAgentOnboardingWizardStep.Personalize}
                        >
                            <AiAgentOnboardingWizardPersonalize {...props} />
                        </WizardStep>
                        <WizardStep
                            name={AiAgentOnboardingWizardStep.Knowledge}
                        >
                            <AiAgentOnboardingWizardKnowledge {...props} />
                        </WizardStep>
                    </Wizard>
                </div>
            </div>
        </>
    )
}

const AiAgentOnboardingWizard = () => {
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const {storeConfiguration, isLoading} =
        useAiAgentStoreConfigurationContext()

    if (isLoading) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    return (
        <AiAgentOnboardingWizardComponent
            shopType={shopType}
            shopName={shopName}
            storeConfiguration={storeConfiguration}
        />
    )
}

export default AiAgentOnboardingWizard
