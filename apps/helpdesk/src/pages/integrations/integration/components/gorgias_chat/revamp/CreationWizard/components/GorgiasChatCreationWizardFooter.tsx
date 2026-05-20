import type React from 'react'

import { Button, ButtonVariant } from '@gorgias/axiom'

import css from './GorgiasChatCreationWizardFooter.less'

type FooterButtonConfig = {
    label: string
    onClick: () => void
    isLoading?: boolean
    isDisabled?: boolean
}

type Props = {
    backButton?: FooterButtonConfig
    cancelButton?: FooterButtonConfig
    primaryButton: FooterButtonConfig
    exitButton?: FooterButtonConfig
}

export const GorgiasChatCreationWizardFooter: React.FC<Props> = ({
    backButton,
    cancelButton,
    primaryButton,
    exitButton,
}) => {
    return (
        <div className={css.wizardButtons}>
            <div className={css.wizardNavigationButtons}>
                {cancelButton && (
                    <Button
                        variant={ButtonVariant.Secondary}
                        isDisabled={cancelButton.isDisabled}
                        onClick={cancelButton.onClick}
                    >
                        {cancelButton.label}
                    </Button>
                )}
                {backButton && (
                    <Button
                        variant={ButtonVariant.Secondary}
                        isDisabled={backButton.isDisabled}
                        onClick={backButton.onClick}
                    >
                        {backButton.label}
                    </Button>
                )}
                <Button
                    onClick={primaryButton.onClick}
                    isLoading={primaryButton.isLoading}
                    isDisabled={primaryButton.isDisabled}
                    variant={ButtonVariant.Primary}
                >
                    {primaryButton.label}
                </Button>
                {exitButton && (
                    <Button
                        variant={ButtonVariant.Secondary}
                        onClick={exitButton.onClick}
                        isDisabled={exitButton.isDisabled}
                    >
                        {exitButton.label}
                    </Button>
                )}
            </div>
        </div>
    )
}
