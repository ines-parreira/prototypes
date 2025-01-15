import React, {ReactNode} from 'react'

import gorgiasLogoExtended from 'assets/img/gorgias-logo-extended.svg'
import IconButton from 'pages/common/components/button/IconButton'

import css from './ConvAiOnboardingLayout.less'

interface ConvAiOnboardingLayoutProps {
    preview: ReactNode
    content: ReactNode
    previewLogo: string
    onClose: () => void
    isLoading?: boolean
}

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

const Header: React.FC<{onClose: () => void}> = ({onClose}) => {
    return (
        <div className={css.onboardingHeader}>
            <GorgiasBrand />
            <CloseButton onClose={onClose} />
        </div>
    )
}

const Body: React.FC = ({children}) => {
    return <div className={css.onboardingBody}>{children}</div>
}

const LoadingPulserIcon: React.FC<{icon: string}> = ({icon}) => {
    return (
        <div className={css.loadingPulserIcon}>
            <div>
                <div>
                    <i className="material-icons">{icon}</i>
                </div>
            </div>
        </div>
    )
}

const PreviewContainer: React.FC<{isLoading: boolean; icon: string}> = ({
    children,
    isLoading,
    icon,
}) => {
    return (
        <div className={css.onboardingPreviewContainerWrapper}>
            <div className={css.onboardingPreviewContainer}>
                {isLoading ? <LoadingPulserIcon icon={icon} /> : children}
            </div>
        </div>
    )
}

export const ConvAiOnboardingLayout: React.FC<ConvAiOnboardingLayoutProps> = ({
    preview,
    content,
    previewLogo,
    onClose,
    isLoading = false,
}) => {
    return (
        <div className={css.onboardingLayout}>
            <Header onClose={onClose} />
            <Body>
                <div className={css.onboardingContentContainer}>{content}</div>
                <PreviewContainer isLoading={isLoading} icon={previewLogo}>
                    {preview}
                </PreviewContainer>
            </Body>
        </div>
    )
}
