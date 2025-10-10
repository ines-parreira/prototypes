import { LegacyButton as Button } from '@gorgias/axiom'

import css from './WizardFooter.less'

export enum FOOTER_BUTTONS {
    SAVE_AND_CUSTOMIZE_LATER = 'saveAndCustomizeLater',
    CANCEL = 'cancel',
    NEXT = 'next',
    BACK = 'back',
    FINISH = 'finish',
    CREATE_AND_CUSTOMIZE = 'createAndCustomize',
}

type Props = {
    displaySaveAndCustomizeLater?: boolean
    displayCancelButton?: boolean
    displayNextButton?: boolean
    displayBackButton?: boolean
    displayFinishButton?: boolean
    displayCreateAndCustomizeButton?: boolean
    isDisabled?: boolean
    onClick: (footerButtonClicked: FOOTER_BUTTONS) => void
}

const WizardFooter: React.FC<Props> = ({
    displaySaveAndCustomizeLater,
    displayCancelButton,
    displayNextButton,
    displayBackButton,
    displayFinishButton,
    displayCreateAndCustomizeButton,
    isDisabled,
    onClick,
}) => {
    return (
        <>
            {displaySaveAndCustomizeLater && (
                <Button
                    fillStyle="ghost"
                    onClick={() =>
                        onClick(FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER)
                    }
                    isDisabled={isDisabled}
                >
                    Save &amp; Customize Later
                </Button>
            )}
            {displayCancelButton && (
                <Button
                    fillStyle="ghost"
                    intent="secondary"
                    isDisabled={isDisabled}
                    onClick={() => onClick(FOOTER_BUTTONS.CANCEL)}
                >
                    Cancel
                </Button>
            )}

            <div className={css.wizardButtons}>
                <div className={css.wizardButtons}>
                    {displayBackButton && (
                        <Button
                            intent="secondary"
                            onClick={() => onClick(FOOTER_BUTTONS.BACK)}
                            isDisabled={isDisabled}
                        >
                            Back
                        </Button>
                    )}
                    {displayNextButton && (
                        <Button
                            onClick={() => onClick(FOOTER_BUTTONS.NEXT)}
                            isLoading={isDisabled}
                        >
                            Next
                        </Button>
                    )}
                    {displayFinishButton && (
                        <Button
                            onClick={() => onClick(FOOTER_BUTTONS.FINISH)}
                            isDisabled={isDisabled}
                        >
                            Finish
                        </Button>
                    )}
                </div>
            </div>

            {displayCreateAndCustomizeButton && (
                <Button
                    onClick={() => onClick(FOOTER_BUTTONS.CREATE_AND_CUSTOMIZE)}
                    isLoading={isDisabled}
                >
                    Create & Customize
                </Button>
            )}
        </>
    )
}

export default WizardFooter
