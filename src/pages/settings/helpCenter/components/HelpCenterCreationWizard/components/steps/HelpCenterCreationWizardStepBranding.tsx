/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'

import {HelpCenter, HelpCenterCreationWizardStep} from 'models/helpCenter/types'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import {
    HELP_CENTER_AVAILABLE_FONTS,
    HELP_CENTER_STEPS_DESCRIPTIONS,
    HELP_CENTER_STEPS_LABELS,
    HELP_CENTER_STEPS_TITLES,
} from 'pages/settings/helpCenter/constants'
import WizardFooter, {
    FOOTER_BUTTONS,
} from 'pages/common/components/wizard/WizardFooter'
import Label from 'pages/common/forms/Label/Label'

import ColorField from 'pages/common/forms/ColorField'
import {FontSelectField} from 'pages/settings/common/FontSelectField/FontSelectField'
import {useFileUpload} from 'pages/settings/helpCenter/hooks/useFileUpload'
import {useHelpCenterCreationWizard} from '../../hooks/useHelpCenterCreationWizard'
import {ImageUpload} from '../../../ImageUpload'
import HelpCenterPreviewHomePage from '../../../HelpCenterPreview/HelpCenterPreviewHomePage'
import HelpCenterPreview from '../../../HelpCenterPreview/HelpCenterPreview'
import css from './HelpCenterCreationWizardStepBranding.less'

type Props = {
    helpCenter?: HelpCenter
}

const HelpCenterCreationWizardStepBranding: React.FC<Props> = ({
    helpCenter,
}) => {
    const {
        helpCenter: newHelpCenter,
        updateData: updateBrandingData,
        onSave,
        isLoading: isLoading,
    } = useHelpCenterCreationWizard(
        helpCenter,
        HelpCenterCreationWizardStep.Branding
    )
    const brandLogo = useFileUpload()

    const handlePrimaryColorChange = (primaryColor: string) => {
        updateBrandingData({primaryColor})
    }

    const handlePrimaryFontFamilyChange = (primaryFontFamily: string) => {
        updateBrandingData({primaryFontFamily})
    }

    const handleBrandLogoChange = async () => {
        if (!brandLogo.isTouched) return
        const brandLogoUrl = await brandLogo.getFileUploadURL()
        updateBrandingData({brandLogoUrl})
    }

    const onFooterAction = async (buttonClicked: FOOTER_BUTTONS) => {
        await handleBrandLogoChange()

        switch (buttonClicked) {
            case FOOTER_BUTTONS.BACK:
                break
            case FOOTER_BUTTONS.NEXT:
                break
            case FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER:
                break
            default:
                break
        }
    }

    return (
        <>
            <WizardStepSkeleton
                step={HelpCenterCreationWizardStep.Branding}
                labels={HELP_CENTER_STEPS_LABELS}
                titles={HELP_CENTER_STEPS_TITLES}
                descriptions={HELP_CENTER_STEPS_DESCRIPTIONS}
                footer={
                    <WizardFooter
                        displaySaveAndCustomizeLater
                        displayNextButton
                        displayBackButton
                        onClick={onFooterAction}
                        isDisabled={isLoading}
                    />
                }
                preview={
                    <HelpCenterPreview
                        name={newHelpCenter.name}
                        logoUrl={newHelpCenter.brandLogoUrl!}
                    >
                        <HelpCenterPreviewHomePage
                            primaryColor={newHelpCenter.primaryColor}
                            primaryFont={newHelpCenter.primaryFontFamily}
                        />
                    </HelpCenterPreview>
                }
            >
                <div className={css.brandingStepContainer}>
                    <div>
                        <Label htmlFor="brand_logo">Logo</Label>
                        <div className={css.brandingLogoDescription}>
                            Displayed in the header of your Help Center.
                        </div>
                        <ImageUpload
                            id="brand_logo"
                            imageRole="wizardLogo"
                            file={brandLogo.payload}
                            defaultPreview={newHelpCenter.brandLogoUrl || ''}
                            onChangeFile={brandLogo.changeFile}
                            isTouched={brandLogo.isTouched}
                            helpTextProps={{
                                highlight: 'Upload image',
                                text: ' - Recommended size 1640 x 624, 500KB or less',
                                className: css.imageUpload,
                            }}
                        />
                    </div>
                    <div className={css.brandingColorFontGroup}>
                        <ColorField
                            className={css.colorPicker}
                            value={newHelpCenter.primaryColor}
                            onChange={handlePrimaryColorChange}
                            label="Accent color"
                        />
                        <div>
                            <Label className="mb-2">Main font</Label>
                            <FontSelectField
                                value={newHelpCenter.primaryFontFamily}
                                defaultFonts={HELP_CENTER_AVAILABLE_FONTS}
                                placeholder="Select a primary font"
                                onChange={handlePrimaryFontFamilyChange}
                            />
                        </div>
                    </div>
                </div>
            </WizardStepSkeleton>
        </>
    )
}

export default HelpCenterCreationWizardStepBranding
