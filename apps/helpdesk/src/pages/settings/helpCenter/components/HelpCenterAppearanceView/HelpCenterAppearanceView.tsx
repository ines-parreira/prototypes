import type React from 'react'
import { createRef, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useAsyncFn } from '@repo/hooks'
import { isAxiosError } from 'axios'
import { FormGroup, FormText } from 'reactstrap'
import isHexColor from 'validator/lib/isHexColor'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { LocaleCode, UpdateHelpCenterDto } from 'models/helpCenter/types'
import { validLocaleCode } from 'models/helpCenter/utils'
import InputField from 'pages/common/forms/input/InputField'
import type { Value } from 'pages/common/forms/SelectField/types'
import {
    HELP_CENTER_AVAILABLE_FONTS,
    HELP_CENTER_DEFAULT_COLOR,
    HELP_CENTER_DEFAULT_FONT,
    HELP_CENTER_DEFAULT_LOCALE,
    HELP_CENTER_DEFAULT_THEME,
} from 'pages/settings/helpCenter/constants'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import type { FileUpload } from 'pages/settings/helpCenter/hooks/useFileUpload'
import { useFileUpload } from 'pages/settings/helpCenter/hooks/useFileUpload'
import { useHelpCenterActions } from 'pages/settings/helpCenter/hooks/useHelpCenterActions'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import type { HelpCenterTheme } from 'pages/settings/helpCenter/types'
import { isHelpCenterTheme } from 'pages/settings/helpCenter/types'
import settingsCss from 'pages/settings/settings.less'
import type {
    Client,
    Components,
} from 'rest_api/help_center_api/client.generated'
import { hasNestedCategories } from 'state/entities/helpCenter/categories'
import { helpCenterUpdated } from 'state/entities/helpCenter/helpCenters/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getViewLanguage } from 'state/ui/helpCenter'
import { reportError } from 'utils/errors'

import { FontSelectField } from '../../../common/FontSelectField/FontSelectField'
import type { HelpCenterLayout } from '../../types/layout.enum'
import { isHelpCenterLayout } from '../../types/layout.enum'
import { getHelpCenterLayout } from '../../utils/helpCenter.utils'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import { ImageRepositioningModal } from '../ImageRepositioningModal'
import { ImageUpload } from '../ImageUpload'
import { LanguageSelect } from '../LanguageSelect/LanguageSelect'
import { LayoutSwitch } from '../LayoutSwitch'
import { RepositionableImageUpload } from '../RepositionableImageUpload/RepositionableImageUpload'
import { ThemeSwitch } from '../ThemeSwitch'
import { UpdateToggle } from '../UpdateToggle'

import css from './HelpCenterAppearanceView.less'

export const HelpCenterAppearanceView: React.FC = () => {
    const dispatch = useAppDispatch()
    const helpCenter = useCurrentHelpCenter()
    const { fetchHelpCenterTranslations } = useHelpCenterActions()
    const { client } = useHelpCenterApi()
    const helpCenterTheme: HelpCenterTheme =
        helpCenter.theme && isHelpCenterTheme(helpCenter.theme)
            ? helpCenter.theme
            : HELP_CENTER_DEFAULT_THEME
    const helpCenterColor =
        helpCenter.primary_color || HELP_CENTER_DEFAULT_COLOR
    const helpCenterFont =
        helpCenter.primary_font_family || HELP_CENTER_DEFAULT_FONT
    const helpCenterLayout: HelpCenterLayout = getHelpCenterLayout(helpCenter)
    const [currentBrandName, setCurrentBrandName] = useState(helpCenter.name)
    const [selectedTheme, setSelectedTheme] =
        useState<HelpCenterTheme>(helpCenterTheme)
    const [currentColor, setCurrentColor] = useState(helpCenterColor)
    const [currentPrimaryFont, setCurrentPrimaryFont] = useState(helpCenterFont)
    const [selectedLayout, setSelectedLayout] =
        useState<HelpCenterLayout>(helpCenterLayout)
    const primaryLogo = useFileUpload()
    const lightLogo = useFileUpload()
    const favicon = useFileUpload()
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [selectedLanguage, setSelectedLanguage] = useState(viewLanguage)
    const [bannerText, setBannerText] = useState<string>('')
    const [bannerImageUrl, setBannerImageUrl] = useState<string>('')
    const bannerImage = useFileUpload()
    const [localImage, setLocalImage] = useState<File | undefined>(undefined)
    const bannerInputRef = createRef<HTMLInputElement>()
    const [isSavingBannerImage, setIsSavingBannerImage] = useState(false)
    const isHelpCenterHasNestedCategories = useAppSelector(hasNestedCategories)

    const translation = useMemo(() => {
        return helpCenter.translations?.find(
            (t) => t.locale === selectedLanguage,
        )
    }, [helpCenter.translations, selectedLanguage])

    const isBannerTextUpdated = useMemo(() => {
        return bannerText !== (translation?.banner_text || '')
    }, [bannerText, translation])

    const isHelpCenterOnePagerEnabled = useFlag(
        FeatureFlagKey.HelpCenterOnePager,
    )

    useEffect(() => {
        if (helpCenter.theme && isHelpCenterTheme(helpCenter.theme)) {
            setSelectedTheme(helpCenter.theme)
        }

        if (helpCenter.primary_color) {
            setCurrentColor(helpCenter.primary_color)
        }

        if (helpCenter.layout && isHelpCenterLayout(helpCenter.layout)) {
            setSelectedLayout(helpCenter.layout)
        }
    }, [helpCenter])

    useEffect(() => {
        void fetchHelpCenterTranslations()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setBannerText(translation?.banner_text || '')
        setBannerImageUrl(translation?.banner_image_url || '')
    }, [translation])

    useEffect(() => {
        // Discard to reset bannerImage state (isTouched and upload file) when the preview image changes.
        bannerImage.discardFile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bannerImageUrl])

    function handleOnChangeLocale(locale: Value) {
        setSelectedLanguage(validLocaleCode(locale))
    }

    const getFileUploadURL = async (file: FileUpload) => {
        if (file.payload) {
            const uploadedFile = await file.uploadFile()

            return uploadedFile?.url
        } else if (file.isTouched) {
            return null
        }

        return undefined
    }

    const bannerImageSubmitWrapper = async ({
        callback,
        batchApply,
    }: {
        callback: () => Promise<{
            updatedTranslation: Components.Schemas.HelpCenterTranslationDto
        }>
        batchApply: boolean
    }) => {
        if (client && helpCenter) {
            try {
                const { updatedTranslation } = await callback()

                const translations = helpCenter.translations?.map(
                    (translation) =>
                        translation.locale === updatedTranslation.locale
                            ? updatedTranslation
                            : batchApply
                              ? {
                                    ...translation,
                                    banner_image_url:
                                        updatedTranslation.banner_image_url,
                                    banner_image_vertical_offset:
                                        updatedTranslation.banner_image_vertical_offset,
                                }
                              : translation,
                )

                dispatch(
                    helpCenterUpdated({
                        ...helpCenter,
                        translations:
                            translations as Components.Schemas.GetHelpCenterDto['translations'],
                    }),
                )

                void dispatch(
                    notify({
                        message: 'Help Center updated with success',
                        status: NotificationStatus.Success,
                    }),
                )
            } catch (err) {
                const errorMessage =
                    isAxiosError(err) && err.response?.status === 413
                        ? 'one or more files are larger than the size limit.'
                        : 'please try again later.'

                void dispatch(
                    notify({
                        message: `Failed to update the Help Center: ${errorMessage}`,
                        status: NotificationStatus.Error,
                    }),
                )

                reportError(err as Error)
            }
        }

        throw Error('client or help center ID are missing!')
    }

    const [updateResponse, saveCurrentAppearance] = useAsyncFn(async () => {
        if (client && helpCenter) {
            try {
                const payload: UpdateHelpCenterDto = {
                    theme: selectedTheme,
                    primary_color: currentColor,
                    primary_font_family: currentPrimaryFont,
                    name: currentBrandName,
                    layout: selectedLayout,
                }

                payload.brand_logo_url = await getFileUploadURL(primaryLogo)
                payload.brand_logo_light_url = await getFileUploadURL(lightLogo)
                payload.favicon_url = await getFileUploadURL(favicon)

                const { data: updateHelpCenter } =
                    await client.updateHelpCenter(
                        {
                            help_center_id: helpCenter.id,
                        },
                        payload,
                    )

                let translations = helpCenter.translations

                if (isBannerTextUpdated || bannerImage.isTouched) {
                    const bannerImageUrl = await getFileUploadURL(bannerImage)
                    const { data: updatedTranslation } =
                        await client.updateHelpCenterTranslation(
                            {
                                help_center_id: helpCenter.id,
                                locale: selectedLanguage,
                            },
                            {
                                banner_text: bannerText,
                                banner_image_url: bannerImageUrl,
                            },
                        )

                    translations = helpCenter.translations?.map(
                        (translation) =>
                            translation.locale === updatedTranslation.locale
                                ? updatedTranslation
                                : translation,
                    ) as Components.Schemas.GetHelpCenterDto['translations']
                }

                dispatch(
                    helpCenterUpdated({ ...updateHelpCenter, translations }),
                )

                discardAllFiles()

                void dispatch(
                    notify({
                        message: 'Help Center updated with success',
                        status: NotificationStatus.Success,
                    }),
                )
            } catch (err) {
                const errorMessage =
                    isAxiosError(err) && err.response?.status === 413
                        ? 'one or more files are larger than the size limit.'
                        : 'please try again later.'

                void dispatch(
                    notify({
                        message: `Failed to update the Help Center: ${errorMessage}`,
                        status: NotificationStatus.Error,
                    }),
                )

                reportError(err as Error)
            }
        }

        throw Error('client or help center ID are missing!')
    }, [
        client,
        helpCenter,
        selectedTheme,
        currentColor,
        currentPrimaryFont,
        currentBrandName,
        primaryLogo,
        favicon,
        lightLogo,
        selectedLayout,
    ])

    const canSaveCurrentAppearance = useMemo(() => {
        if (updateResponse.loading) {
            return false
        }

        if (selectedTheme !== helpCenter.theme) {
            return Boolean(selectedTheme)
        }

        if (currentColor !== helpCenter.primary_color) {
            return isHexColor(currentColor)
        }

        if (currentPrimaryFont !== helpCenter.primary_font_family) {
            return Boolean(currentPrimaryFont)
        }

        if (selectedLayout !== helpCenter.layout) {
            return Boolean(selectedLayout)
        }

        if (!!currentBrandName && currentBrandName !== helpCenter.name) {
            return Boolean(currentBrandName)
        }

        if (
            primaryLogo.isTouched ||
            lightLogo.isTouched ||
            favicon.isTouched ||
            bannerImage.isTouched ||
            isBannerTextUpdated
        ) {
            return true
        }

        return false
    }, [
        helpCenter,
        selectedTheme,
        currentColor,
        currentPrimaryFont,
        currentBrandName,
        primaryLogo,
        lightLogo,
        favicon,
        bannerImage,
        isBannerTextUpdated,
        updateResponse,
        selectedLayout,
    ])

    const discardAllFiles = () => {
        primaryLogo.discardFile()
        lightLogo.discardFile()
        favicon.discardFile()
    }

    const resetCurrentAppearance = () => {
        setSelectedTheme(helpCenterTheme)
        setCurrentColor(helpCenterColor)
        setCurrentBrandName(helpCenter.name)
        setCurrentPrimaryFont(helpCenterFont)
        setSelectedLayout(helpCenterLayout)
        setBannerText(translation?.banner_text || '')
        bannerImage.discardFile()
        discardAllFiles()
    }

    const getImageUploadHighlightText = (
        upload: FileUpload,
        currentImage?: string | null,
    ) => {
        return (upload.isTouched && upload.payload) ||
            (!upload.isTouched && currentImage)
            ? 'Replace image'
            : 'Upload image'
    }

    const saveBannerImage = async (
        locale: LocaleCode,
        bannerImageUrl: string | null | undefined,
        offset: number,
    ) => {
        const { data: updatedTranslation } = await (
            client as Client
        ).updateHelpCenterTranslation(
            {
                help_center_id: helpCenter.id,
                locale: locale,
            },
            {
                banner_image_url: bannerImageUrl,
                banner_image_vertical_offset: offset,
            },
        )
        return updatedTranslation
    }

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            isDirty={canSaveCurrentAppearance}
            onSaveChanges={saveCurrentAppearance}
        >
            <section className={css.sectionWrapper}>
                <div className={css.heading}>
                    <h3>Branding</h3>
                    <p>{`Set up your Help Center's logo, color and theme.`}</p>
                </div>
                <div className={settingsCss.mb24}>
                    <InputField
                        type="text"
                        className={settingsCss.mb16}
                        name="name"
                        label="Brand name"
                        caption="This is going to be displayed whenever your logo isn’t available and also in search engines."
                        placeholder="Ex. Customer Support"
                        value={currentBrandName}
                        isRequired
                        onChange={setCurrentBrandName}
                    />
                </div>
                <div className={css.logos}>
                    <ImageUpload
                        id="primary_logo"
                        title="Standard Logo"
                        info="Used in the main navigation when with the light theme."
                        imageRole="logo"
                        file={primaryLogo.payload}
                        defaultPreview={helpCenter.brand_logo_url || ''}
                        onChangeFile={primaryLogo.changeFile}
                        isTouched={primaryLogo.isTouched}
                        helpTextProps={{
                            highlight: getImageUploadHighlightText(
                                primaryLogo,
                                helpCenter.brand_logo_url,
                            ),
                            text: ' - recommended size 1640 x 624',
                            className: css.imageUpload,
                        }}
                    />
                    <ImageUpload
                        id="light_logo"
                        title="White Logo"
                        info="Used in the main navigation when with the dark theme."
                        imageRole="logo"
                        file={lightLogo.payload}
                        defaultPreview={helpCenter.brand_logo_light_url || ''}
                        onChangeFile={lightLogo.changeFile}
                        isTouched={lightLogo.isTouched}
                        helpTextProps={{
                            highlight: getImageUploadHighlightText(
                                lightLogo,
                                helpCenter.brand_logo_light_url,
                            ),
                            text: ' - recommended size 1640 x 624',
                            className: css.imageUpload,
                        }}
                    />
                    <ImageUpload
                        id="favicon"
                        title="Favicon"
                        info="This is shown in each browser beside your website’s name."
                        imageRole="favicon"
                        file={favicon.payload}
                        defaultPreview={helpCenter.favicon_url || ''}
                        onChangeFile={favicon.changeFile}
                        isTouched={favicon.isTouched}
                        helpTextProps={{
                            text: 'Ideally a 48px square PNG',
                            className: css.imageUpload,
                        }}
                        accept="image/png,image/jpeg,image/x-icon"
                    />
                </div>
                <div className={settingsCss.mb16}>
                    <ThemeSwitch
                        selectedTheme={selectedTheme}
                        currentColor={currentColor}
                        onThemeChange={setSelectedTheme}
                        onColorChange={setCurrentColor}
                    />
                </div>
                <div className={settingsCss.mb16}>
                    <>
                        <label
                            className="control-label"
                            htmlFor={'primary-font'}
                        >
                            Main font
                        </label>
                        <div id="primary-font">
                            <FontSelectField
                                value={currentPrimaryFont}
                                defaultFonts={HELP_CENTER_AVAILABLE_FONTS}
                                placeholder="Select a main font"
                                onChange={(value) => {
                                    setCurrentPrimaryFont(value)
                                }}
                            />
                        </div>
                        <FormText color="muted">
                            This font will be applied to the website and set by
                            default to new articles. This will override the
                            default font in existing articles.
                        </FormText>
                    </>
                </div>
            </section>
            {isHelpCenterOnePagerEnabled && (
                <section className={css.sectionWrapper}>
                    <LayoutSwitch
                        selectedLayout={selectedLayout}
                        onLayoutChange={setSelectedLayout}
                        isOnePagerDisabled={isHelpCenterHasNestedCategories}
                    />
                </section>
            )}
            <section className={css.sectionWrapper}>
                <div className={css.bannerHeader}>
                    <div className={css.bannerHeaderText}>
                        <div className={css.heading}>
                            <h3>Banner settings</h3>
                            <p>
                                Add a banner background image and set titles in
                                multiple languages.
                            </p>
                        </div>
                    </div>
                    <div className={css.bannerHeaderLocale}>
                        <LanguageSelect
                            value={selectedLanguage}
                            onChange={handleOnChangeLocale}
                        />
                    </div>
                </div>
                <UpdateToggle
                    activated={helpCenter.search_deactivated_datetime === null}
                    label="Search bar"
                    description="Allow customers to search articles and categories."
                    fieldName="search_deactivated"
                />
                <div>
                    <InputField
                        className={settingsCss.mb16}
                        type="text"
                        name="name"
                        label="Title"
                        placeholder="Banner title"
                        value={bannerText}
                        onChange={setBannerText}
                    />
                </div>
                <RepositionableImageUpload
                    id="banner_image"
                    title="Background"
                    imageRole="bannerImage"
                    file={bannerImage.payload}
                    defaultPreview={bannerImageUrl || ''}
                    onChangeFile={(payload: File | undefined) => {
                        bannerImage.changeFile(payload)
                        setLocalImage(payload)
                    }}
                    isTouched={bannerImage.isTouched}
                    helpTextProps={{
                        highlight: getImageUploadHighlightText(
                            bannerImage,
                            bannerImageUrl,
                        ),
                        text: 'Recommended file size: 2500px wide, 500KB or less. Max file size: 10MB.',
                    }}
                    verticalOffset={translation?.banner_image_vertical_offset}
                    inputRef={bannerInputRef}
                    onSubmit={async (offset: number) => {
                        const callback = async () => {
                            const { data: updatedTranslation } = await (
                                client as Client
                            ).updateHelpCenterTranslation(
                                {
                                    help_center_id: helpCenter.id,
                                    locale: selectedLanguage,
                                },
                                {
                                    banner_image_vertical_offset: offset,
                                },
                            )

                            return { updatedTranslation }
                        }
                        await bannerImageSubmitWrapper({
                            callback: callback,
                            batchApply: false,
                        })
                    }}
                    isSavingBannerImage={isSavingBannerImage}
                />

                <ImageRepositioningModal
                    localImage={localImage}
                    onCloseModal={() => {
                        setLocalImage(undefined)
                        bannerImage.discardFile()
                    }}
                    bannerInputRef={bannerInputRef}
                    onSubmit={async (offset: number, batchApply: boolean) => {
                        const callback = async () => {
                            setIsSavingBannerImage(true)
                            try {
                                const bannerImageUrl =
                                    await getFileUploadURL(bannerImage)
                                if (batchApply) {
                                    const otherTranslations =
                                        helpCenter.translations
                                            ? helpCenter.translations.filter(
                                                  (x) =>
                                                      x.locale !==
                                                      selectedLanguage,
                                              )
                                            : []

                                    for (const translation of otherTranslations) {
                                        await saveBannerImage(
                                            translation.locale,
                                            bannerImageUrl,
                                            offset,
                                        )
                                    }
                                }

                                const updatedTranslation =
                                    await saveBannerImage(
                                        selectedLanguage,
                                        bannerImageUrl,
                                        offset,
                                    )

                                return { updatedTranslation }
                            } finally {
                                setIsSavingBannerImage(false)
                            }
                        }
                        await bannerImageSubmitWrapper({
                            callback: callback,
                            batchApply: batchApply,
                        })
                    }}
                />
            </section>
            <footer>
                <FormGroup>
                    <Button
                        className="mr-2"
                        isDisabled={!canSaveCurrentAppearance}
                        onClick={saveCurrentAppearance}
                    >
                        {updateResponse.loading || isSavingBannerImage
                            ? 'Saving...'
                            : 'Save Changes'}
                    </Button>
                    <Button intent="secondary" onClick={resetCurrentAppearance}>
                        Cancel
                    </Button>
                </FormGroup>
            </footer>
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterAppearanceView
