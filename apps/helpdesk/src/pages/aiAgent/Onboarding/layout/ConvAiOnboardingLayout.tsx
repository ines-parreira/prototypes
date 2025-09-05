import React, { ReactNode } from 'react'

import classNames from 'classnames'
import { useParams } from 'react-router-dom'

import { useHideBanners } from 'AlertBanners/hooks/useHideBanners'
import { logEvent, SegmentEvent } from 'common/segment'
import {
    aiAgentRoutes,
    getAiAgentNavigationRoutes,
} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import OnboardingProgressTracker from 'pages/aiAgent/Onboarding/components/common/OnboardingProgressTracker/OnboardingProgressTracker'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import IconButton from 'pages/common/components/button/IconButton'
import history from 'pages/history'

import css from './ConvAiOnboardingLayout.less'

const onClose = (isInAiAgentTrial: boolean, shopName?: string) => {
    if (isInAiAgentTrial) {
        history.push('/app/home')
        return
    }
    if (shopName) {
        history.push(getAiAgentNavigationRoutes(shopName).main)
        return
    }
    history.push(aiAgentRoutes.overview)
}

const CloseButton: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <IconButton
            fillStyle="fill"
            intent="secondary"
            onClick={() => onClose()}
            size="medium"
        >
            close
        </IconButton>
    )
}

export const OnboardingBody: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    return <div className={css.onboardingBody}>{children}</div>
}

export const LoadingPulserIcon: React.FC<{ icon: string | JSX.Element }> = ({
    icon,
}) => {
    return (
        <div className={css.loadingPulserIcon}>
            <div>
                <div>
                    {typeof icon === 'string' ? (
                        <i className="material-icons">{icon}</i>
                    ) : (
                        icon
                    )}
                </div>
            </div>
        </div>
    )
}

export const OnboardingPreviewContainer: React.FC<{
    isLoading: boolean
    icon: string | JSX.Element
    caption?: string
    children?: ReactNode
}> = ({ children, isLoading, icon, caption }) => {
    const { step, shopName } = useParams<{ step: string; shopName: string }>()

    const { isInAiAgentTrial } = useTrialAccess(shopName)

    const onCloseAction = () => {
        logEvent(SegmentEvent.AiAgentNewOnboardingWizardButtonClicked, {
            step,
            shopName,
            type: 'close',
        })
        onClose(isInAiAgentTrial, shopName)
    }

    return (
        <div className={css.onboardingPreviewContainerWrapper}>
            <div className={css.onboardingPreviewContainer}>
                <div className={css.onboardingPreviewClose}>
                    <CloseButton onClose={onCloseAction} />
                </div>
                {isLoading && (
                    <div
                        className={classNames(css.ghostContainer, css.loading)}
                    >
                        <LoadingPulserIcon icon={icon} />
                    </div>
                )}
                {!isLoading && (
                    <>
                        <div className={css.ghostContainer}>{children}</div>
                        <div className={css.caption}>{caption}</div>
                    </>
                )}
            </div>
        </div>
    )
}

export const OnboardingContentContainer: React.FC<{
    children: ReactNode
    totalSteps: number
    currentStep: number
    onNextClick: () => void
    onBackClick: () => void
    isLoading?: boolean
    containerClassName?: string
}> = ({
    children,
    totalSteps,
    currentStep,
    onNextClick,
    onBackClick,
    isLoading,
    containerClassName,
}) => {
    const { step, shopName } = useParams<{ step: string; shopName: string }>()

    const { isInAiAgentTrial } = useTrialAccess(shopName)

    const onCloseAction = () => {
        logEvent(SegmentEvent.AiAgentNewOnboardingWizardButtonClicked, {
            Step: step,
            shopName,
            type: 'close',
        })
        onClose(isInAiAgentTrial, shopName)
    }

    const onNextAction = () => {
        logEvent(SegmentEvent.AiAgentNewOnboardingWizardButtonClicked, {
            Step: step,
            shopName,
            type: 'next',
        })
        onNextClick()
    }

    const onBackAction = () => {
        logEvent(SegmentEvent.AiAgentNewOnboardingWizardButtonClicked, {
            Step: step,
            shopName,
            type: 'back',
        })
        onBackClick()
    }

    return (
        <div
            className={classNames(
                css.onboardingContentContainer,
                containerClassName,
            )}
        >
            <div className={css.onboardingHeader}>
                <div title="Gorgias logo" className={css.logo} />
                <div className={css.onboardingHeaderClose}>
                    <CloseButton onClose={onCloseAction} />
                </div>
            </div>
            <div>{children}</div>
            <div className={css.progressTrackerContainer}>
                <OnboardingProgressTracker
                    step={currentStep}
                    totalSteps={totalSteps}
                    onBackClick={onBackAction}
                    onNextClick={onNextAction}
                    isLoading={isLoading ?? false}
                />
            </div>
        </div>
    )
}

export const ConvAiOnboardingLayout: React.FC<{
    children: ReactNode
}> = ({ children }) => {
    useHideBanners()
    return <div className={css.onboardingLayout}>{children}</div>
}
