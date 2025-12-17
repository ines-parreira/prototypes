import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { LegacyLabel as Label } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import type { HelpCenter } from 'models/helpCenter/types'
import { HelpCenterCreationWizardStep } from 'models/helpCenter/types'
import WizardFooter, {
    FOOTER_BUTTONS,
} from 'pages/common/components/wizard/WizardFooter'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'
import ColorField from 'pages/common/forms/ColorField'
import { FontSelectField } from 'pages/settings/common/FontSelectField/FontSelectField'
import {
    HELP_CENTER_AVAILABLE_FONTS,
    HELP_CENTER_STEPS_DESCRIPTIONS,
    HELP_CENTER_STEPS_LABELS,
    HELP_CENTER_STEPS_TITLES,
    NEXT_ACTION,
} from 'pages/settings/helpCenter/constants'
import { useFileUpload } from 'pages/settings/helpCenter/hooks/useFileUpload'
import type { HelpCenterLayout } from 'pages/settings/helpCenter/types/layout.enum'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import HelpCenterPreview from '../../../HelpCenterPreview/HelpCenterPreview'
import HelpCenterPreviewHomePage from '../../../HelpCenterPreview/HelpCenterPreviewHomePage'
import { ImageUpload } from '../../../ImageUpload'
import { LayoutSwitch } from '../../../LayoutSwitch'
import { useHelpCenterCreationWizard } from '../../hooks/useHelpCenterCreationWizard'

import css from './HelpCenterCreationWizardStepBranding.less'

type Props = {
    helpCenter?: HelpCenter
}

const HelpCenterCreationWizardStepBranding: React.FC<Props> = ({
    helpCenter,
}) => {
    const dispatch = useAppDispatch()
    const {
        helpCenter: newHelpCenter,
        handleFormUpdate,
        handleAction,
        handleSave,
        isLoading: isLoading,
    } = useHelpCenterCreationWizard(
        helpCenter,
        HelpCenterCreationWizardStep.Branding,
    )
    const brandLogo = useFileUpload()

    const isHelpCenterOnePagerEnabled = useFlag(
        FeatureFlagKey.HelpCenterOnePager,
    )

    const handlePrimaryColorChange = (primaryColor: string) => {
        handleFormUpdate({ primaryColor })
    }

    const handlePrimaryFontFamilyChange = (primaryFontFamily: string) => {
        handleFormUpdate({ primaryFontFamily })
    }

    const handleLayoutChange = (layout: HelpCenterLayout) => {
        handleFormUpdate({ layout })
    }

    const handleBrandLogoChange = async () => {
        if (!brandLogo.isTouched) return
        try {
            const brandLogoUrl = await brandLogo.getFileUploadURL()
            handleFormUpdate({ brandLogoUrl })
            return brandLogoUrl
        } catch {
            dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to upload the logo. Please try again.',
                }),
            )
        }
    }

    const onFooterAction = async (buttonClicked: FOOTER_BUTTONS) => {
        const url = await handleBrandLogoChange()
        const payload = url !== undefined ? { brandLogoUrl: url } : {}

        switch (buttonClicked) {
            case FOOTER_BUTTONS.BACK:
                handleAction(NEXT_ACTION.PREVIOUS_STEP)
                break
            case FOOTER_BUTTONS.NEXT:
                handleSave({
                    redirectTo: NEXT_ACTION.NEXT_STEP,
                    stepName: HelpCenterCreationWizardStep.Articles,
                    payload,
                })
                break
            case FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER:
                handleSave({
                    redirectTo: NEXT_ACTION.BACK_HOME,
                    stepName: HelpCenterCreationWizardStep.Branding,
                    payload,
                })
                break
            default:
                break
        }
    }

    const logoUrl = brandLogo.isTouched
        ? brandLogo.serializedFile
        : newHelpCenter.brandLogoUrl

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
                        logoUrl={logoUrl}
                    >
                        <HelpCenterPreviewHomePage
                            layout={newHelpCenter.layout}
                            primaryColor={newHelpCenter.primaryColor}
                            primaryFont={newHelpCenter.primaryFontFamily}
                        />
                    </HelpCenterPreview>
                }
            >
                <div className={css.customizationContainer}>
                    <div className={css.brandingStepContainer}>
                        <div className="heading-section-semibold">Branding</div>
                        <div>
                            <Label htmlFor="brand_logo">Logo</Label>
                            <div className={css.brandingLogoDescription}>
                                Displayed in the header of your Help Center.
                            </div>
                            <ImageUpload
                                id="brand_logo"
                                imageRole="wizardLogo"
                                file={brandLogo.payload}
                                defaultPreview={
                                    newHelpCenter.brandLogoUrl || ''
                                }
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
                    {isHelpCenterOnePagerEnabled && (
                        <div>
                            <LayoutSwitch
                                selectedLayout={newHelpCenter.layout}
                                onLayoutChange={handleLayoutChange}
                                isOnePagerDisabled={false}
                            />
                        </div>
                    )}
                </div>
            </WizardStepSkeleton>
        </>
    )
}

export default HelpCenterCreationWizardStepBranding
