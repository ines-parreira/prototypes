import React, {ReactNode} from 'react'

import gorgiasLogoExtended from 'assets/img/gorgias-logo-extended.svg'
import OnboardingProgressTracker from 'pages/aiAgent/Onboarding/components/common/OnboardingProgressTracker/OnboardingProgressTracker'
import IconButton from 'pages/common/components/button/IconButton'

import css from './ConvAiOnboardingLayout.less'

const GorgiasBrand: React.FC = () => {
    return (
        <img src={gorgiasLogoExtended} alt="Gorgias" width="100" height="26" />
    )
}

const CloseButton: React.FC<{onClose: () => void}> = ({onClose}) => {
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

export const OnboardingHeader: React.FC<{onClose: () => void}> = ({
    onClose,
}) => {
    return (
        <div className={css.onboardingHeader}>
            <GorgiasBrand />
            <CloseButton onClose={onClose} />
        </div>
    )
}

export const OnboardingBody: React.FC = ({children}) => {
    return <div className={css.onboardingBody}>{children}</div>
}

const LoadingPulserIcon: React.FC<{icon: string | JSX.Element}> = ({icon}) => {
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
}> = ({children, isLoading, icon}) => {
    return (
        <div className={css.onboardingPreviewContainerWrapper}>
            <div className={css.onboardingPreviewContainer}>
                <div
                    className={css.ghostContainer}
                    style={{display: isLoading ? 'flex' : 'none'}}
                >
                    <LoadingPulserIcon icon={icon} />
                </div>
                <div
                    style={{display: isLoading ? 'none' : 'flex'}}
                    className={css.ghostContainer}
                >
                    {children}
                </div>
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
}> = ({children}) => {
    return <div className={css.onboardingLayout}>{children}</div>
}
