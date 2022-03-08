import React, {useEffect, useMemo, useState} from 'react'
import axios from 'axios'
import {useAsyncFn} from 'react-use'
import {FormGroup} from 'reactstrap'
import isHexColor from 'validator/lib/isHexColor'
import {useSelector} from 'react-redux'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/InputField'
import {validLocaleCode} from 'models/helpCenter/utils'
import {Value} from 'pages/common/forms/SelectField/types'

import {getViewLanguage} from 'state/ui/helpCenter'
import {helpCenterUpdated} from 'state/entities/helpCenter/helpCenters'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {HelpCenter} from '../../../../models/helpCenter/types'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {useHelpCenterActions} from '../hooks/useHelpCenterActions'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {FileUpload, useFileUpload} from '../hooks/useFileUpload'
import {
    HELP_CENTER_AVAILABLE_FONTS,
    HELP_CENTER_DEFAULT_COLOR,
    HELP_CENTER_DEFAULT_FONT,
    HELP_CENTER_DEFAULT_THEME,
    HELP_CENTER_DEFAULT_LOCALE,
} from '../constants'
import {useCurrentHelpCenter} from '../providers/CurrentHelpCenter'
import {HelpCenterTheme, isHelpCenterTheme} from '../types'
import {getLocaleSelectOptions} from '../utils/localeSelectOptions'
import {useSupportedLocales} from '../providers/SupportedLocales'

import {ImageUpload} from './ImageUpload'
import {UpdateToggle} from './UpdateToggle'
import {FontSelectField} from './FontSelectField/FontSelectField'
import HelpCenterPageWrapper from './HelpCenterPageWrapper'
import {ThemeSwitch} from './ThemeSwitch'
import css from './HelpCenterAppearanceView.less'

export const HelpCenterAppearanceView: React.FC = () => {
    const dispatch = useAppDispatch()
    const helpCenter = useCurrentHelpCenter()
    const {fetchHelpCenterTranslations} = useHelpCenterActions()
    const {client} = useHelpCenterApi()
    const helpCenterTheme: HelpCenterTheme =
        helpCenter.theme && isHelpCenterTheme(helpCenter.theme)
            ? helpCenter.theme
            : HELP_CENTER_DEFAULT_THEME
    const helpCenterColor =
        helpCenter.primary_color || HELP_CENTER_DEFAULT_COLOR
    const helpCenterFont =
        helpCenter.primary_font_family || HELP_CENTER_DEFAULT_FONT
    const [selectedTheme, setSelectedTheme] =
        useState<HelpCenterTheme>(helpCenterTheme)
    const [currentColor, setCurrentColor] = useState(helpCenterColor)
    const [currentFont, setCurrentFont] = useState(helpCenterFont)
    const primaryLogo = useFileUpload()
    const lightLogo = useFileUpload()
    const favicon = useFileUpload()
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const locales = useSupportedLocales()
    const [selectedLanguage, setSelectedLanguage] = useState(viewLanguage)
    const [bannerText, setBannerText] = useState<string>('')
    const [bannerImageUrl, setBannerImageUrl] = useState<string>('')
    const bannerImage = useFileUpload()

    const translation = useMemo(() => {
        return helpCenter.translations?.find(
            (t) => t.locale === selectedLanguage
        )
    }, [helpCenter.translations, selectedLanguage])

    const isBannerTextUpdated = useMemo(() => {
        return bannerText !== (translation?.banner_text || '')
    }, [bannerText, translation])

    useEffect(() => {
        if (helpCenter.theme && isHelpCenterTheme(helpCenter.theme)) {
            setSelectedTheme(helpCenter.theme)
        }

        if (helpCenter.primary_color) {
            setCurrentColor(helpCenter.primary_color)
        }
    }, [helpCenter])

    useEffect(() => {
        void fetchHelpCenterTranslations()
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

    const localeOptions = useMemo(
        () => getLocaleSelectOptions(locales, helpCenter.supported_locales),
        [locales, helpCenter.supported_locales]
    )

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

    const [updateResponse, saveCurrentAppearance] = useAsyncFn(async () => {
        if (client && helpCenter) {
            try {
                const payload: Partial<HelpCenter> = {
                    theme: selectedTheme,
                    primary_color: currentColor,
                    primary_font_family: currentFont,
                }

                payload.brand_logo_url = await getFileUploadURL(primaryLogo)
                payload.brand_logo_light_url = await getFileUploadURL(lightLogo)
                payload.favicon_url = await getFileUploadURL(favicon)

                const {data: updateHelpCenter} = await client.updateHelpCenter(
                    {
                        help_center_id: helpCenter.id,
                    },
                    payload
                )

                let translations = helpCenter.translations

                if (isBannerTextUpdated || bannerImage.isTouched) {
                    const bannerImageUrl = await getFileUploadURL(bannerImage)
                    const {data: updatedTranslation} =
                        await client.updateHelpCenterTranslation(
                            {
                                help_center_id: helpCenter.id,
                                locale: selectedLanguage,
                            },
                            {
                                banner_text: bannerText,
                                banner_image_url: bannerImageUrl,
                            }
                        )

                    translations = helpCenter.translations?.map((translation) =>
                        translation.locale === updatedTranslation.locale
                            ? updatedTranslation
                            : translation
                    )
                }

                dispatch(helpCenterUpdated({...updateHelpCenter, translations}))

                discardAllFiles()

                void dispatch(
                    notify({
                        message: 'Help Center updated with success',
                        status: NotificationStatus.Success,
                    })
                )
            } catch (err) {
                const errorMessage =
                    axios.isAxiosError(err) && err.response?.status === 413
                        ? 'one or more files are larger than the size limit.'
                        : 'please try again later.'

                void dispatch(
                    notify({
                        message: `Failed to update the Help Center: ${errorMessage}`,
                        status: NotificationStatus.Error,
                    })
                )

                console.error(err)
            }
        }

        throw Error('client or help center ID are missing!')
    }, [
        client,
        helpCenter,
        selectedTheme,
        currentColor,
        currentFont,
        primaryLogo,
        favicon,
        lightLogo,
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

        if (currentFont !== helpCenter.primary_font_family) {
            return Boolean(currentFont)
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
        currentFont,
        primaryLogo,
        lightLogo,
        favicon,
        bannerImage,
        isBannerTextUpdated,
        updateResponse,
    ])

    const discardAllFiles = () => {
        primaryLogo.discardFile()
        lightLogo.discardFile()
        favicon.discardFile()
        bannerImage.discardFile()
    }

    const resetCurrentAppearance = () => {
        setSelectedTheme(helpCenterTheme)
        setCurrentColor(helpCenterColor)
        discardAllFiles()
    }

    const getImageUploadHighlightText = (
        upload: FileUpload,
        currentImage?: string | null
    ) => {
        return (upload.isTouched && upload.payload) ||
            (!upload.isTouched && currentImage)
            ? 'Replace image'
            : 'Upload image'
    }

    return (
        <HelpCenterPageWrapper helpCenter={helpCenter}>
            <div className={css.heading}>
                <h3>Appearance</h3>
                <p>Set up your help center's logo, color and theme.</p>
            </div>
            <div className={css.heading}>
                <h4>Logo &amp; Favicon</h4>
                <p>
                    Select which logo you want to display on Light &amp; Dark
                    mode as well as the favicon.
                </p>
            </div>
            <section className={css.logos}>
                <ImageUpload
                    id="primary_logo"
                    title="Standard Logo"
                    info="Used in the main navigation when with the light theme."
                    file={primaryLogo.payload}
                    defaultPreview={helpCenter.brand_logo_url || ''}
                    onChangeFile={primaryLogo.changeFile}
                    isTouched={primaryLogo.isTouched}
                    helpTextProps={{
                        highlight: getImageUploadHighlightText(
                            primaryLogo,
                            helpCenter.brand_logo_url
                        ),
                        text: 'maximum 10 MB',
                    }}
                />
                <ImageUpload
                    id="light_logo"
                    title="Light Logo"
                    info="Used in the main navigation when with the dark theme."
                    file={lightLogo.payload}
                    defaultPreview={helpCenter.brand_logo_light_url || ''}
                    onChangeFile={lightLogo.changeFile}
                    isTouched={lightLogo.isTouched}
                    helpTextProps={{
                        highlight: getImageUploadHighlightText(
                            lightLogo,
                            helpCenter.brand_logo_light_url
                        ),
                        text: 'maximum 10 MB',
                    }}
                />
                <ImageUpload
                    id="favicon"
                    title="Favicon"
                    info="This is shown in each browser beside your website’s name."
                    file={favicon.payload}
                    defaultPreview={helpCenter.favicon_url || ''}
                    onChangeFile={favicon.changeFile}
                    isTouched={favicon.isTouched}
                    helpTextProps={{
                        highlight: getImageUploadHighlightText(
                            favicon,
                            helpCenter.favicon_url
                        ),
                        text: 'recommended size 64 x 64',
                    }}
                    accept="image/png,image/jpeg,image/x-icon"
                    size="small"
                />
            </section>
            <section>
                <ThemeSwitch
                    selectedTheme={selectedTheme}
                    currentColor={currentColor}
                    onThemeChange={setSelectedTheme}
                    onColorChange={setCurrentColor}
                />
            </section>
            <section style={{marginTop: -20}}>
                <FontSelectField
                    title="Primary font"
                    help="This font will be applied to the website. It will also be applied to articles unless another font is enforced on the article editor side."
                    value={currentFont}
                    fontOptions={HELP_CENTER_AVAILABLE_FONTS}
                    onChange={(value) => {
                        setCurrentFont(value)
                    }}
                />
            </section>
            <section>
                <div className={css.bannerHeader}>
                    <div className={css.bannerHeaderText}>
                        <div className={css.heading}>
                            <h3>Banner settings</h3>
                            <p>
                                This is displayed on top of your help center’s{' '}
                                <strong>home page</strong>.
                            </p>
                        </div>
                    </div>
                    <div className={css.bannerHeaderLocale}>
                        <SelectField
                            fixedWidth={true}
                            value={selectedLanguage}
                            options={localeOptions}
                            onChange={handleOnChangeLocale}
                            aria-label="language selector"
                        />
                    </div>
                </div>
                <div>
                    <InputField
                        type="text"
                        name="name"
                        label="Banner title"
                        help="This title is displayed on your homepage header."
                        placeholder="Banner title"
                        value={bannerText}
                        onChange={setBannerText}
                    />
                </div>
                <ImageUpload
                    id="banner_image"
                    title="Banner Background"
                    info="Your banner is an image that’s displayed on the top of your home page."
                    file={bannerImage.payload}
                    defaultPreview={bannerImageUrl || ''}
                    onChangeFile={bannerImage.changeFile}
                    isTouched={bannerImage.isTouched}
                    isFluid
                    helpTextProps={{
                        highlight: getImageUploadHighlightText(
                            bannerImage,
                            helpCenter.banner_image_url
                        ),
                        text: 'recommended size 1440 x 316 - Maximum 10 MB',
                    }}
                />
            </section>
            <section>
                <h3>Other settings</h3>
                <UpdateToggle
                    activated={helpCenter.search_deactivated_datetime === null}
                    label="Enable search bar"
                    description="Use this toggle to display or hide the search bar in your Help Center."
                    fieldName="search_deactivated"
                />
                <UpdateToggle
                    activated={
                        helpCenter.powered_by_deactivated_datetime === null
                    }
                    label="Powered by Gorgias"
                    description="Use this toggle to display or hide the Gorgias branding on the footer in Help Center."
                    fieldName="powered_by_deactivated"
                />
            </section>
            <footer>
                <FormGroup>
                    <Button
                        className="mr-2"
                        intent={ButtonIntent.Primary}
                        isDisabled={!canSaveCurrentAppearance}
                        onClick={saveCurrentAppearance}
                    >
                        {updateResponse.loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                        intent={ButtonIntent.Secondary}
                        onClick={resetCurrentAppearance}
                    >
                        Cancel
                    </Button>
                </FormGroup>
            </footer>
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterAppearanceView
