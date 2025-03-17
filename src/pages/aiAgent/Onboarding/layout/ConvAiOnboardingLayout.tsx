import React, { ReactNode } from 'react'

import { aiAgentRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import OnboardingProgressTracker from 'pages/aiAgent/Onboarding/components/common/OnboardingProgressTracker/OnboardingProgressTracker'
import GorgiasLogoExtendedIcon from 'pages/aiAgent/Onboarding/layout/GorgiasLogoExtended'
import IconButton from 'pages/common/components/button/IconButton'
import history from 'pages/history'

import css from './ConvAiOnboardingLayout.less'

const onClose = () => {
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

export const OnboardingBody: React.FC = ({ children }) => {
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
}> = ({ children, isLoading, icon, caption }) => {
    return (
        <div className={css.onboardingPreviewContainerWrapper}>
            <div className={css.onboardingPreviewContainer}>
                <div className={css.onboardingPreviewClose}>
                    <CloseButton onClose={onClose} />
                </div>
                {isLoading && (
                    <div className={css.ghostContainer}>
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
}> = ({
    children,
    totalSteps,
    currentStep,
    onNextClick,
    onBackClick,
    isLoading,
}) => {
    return (
        <div className={css.onboardingContentContainer}>
            <div className={css.onboardingHeader}>
                <GorgiasLogoExtendedIcon />
                <div className={css.onboardingHeaderClose}>
                    <CloseButton onClose={onClose} />
                </div>
            </div>
            <div>{children}</div>
            <div className={css.progressTrackerContainer}>
                <OnboardingProgressTracker
                    step={currentStep}
                    totalSteps={totalSteps}
                    onBackClick={onBackClick}
                    onNextClick={onNextClick}
                    isLoading={isLoading ?? false}
                />
            </div>
        </div>
    )
}

export const ConvAiOnboardingLayout: React.FC<{
    children: ReactNode
}> = ({ children }) => {
    return <div className={css.onboardingLayout}>{children}</div>
}
