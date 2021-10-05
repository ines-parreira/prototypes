import React, {useEffect, useMemo, useState} from 'react'

import isHexColor from 'validator/lib/isHexColor'

import {useSelector} from 'react-redux'
import {useAsyncFn} from 'react-use'

import {Button, Container, FormGroup} from 'reactstrap'

import {HelpCenter} from '../../../../models/helpCenter/types'

import useAppDispatch from '../../../../hooks/useAppDispatch'

import {helpCenterUpdated} from '../../../../state/entities/helpCenters/actions'
import {getCurrentHelpCenter} from '../../../../state/entities/helpCenters/selectors'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'

import PageHeader from '../../../common/components/PageHeader'

import {DEFAULT_THEME, HELP_CENTER_DEFAULT_COLOR} from '../constants'
import {HelpCenterThemes, isHelpCenterTheme} from '../types'
import {FileUpload, useFileUpload} from '../hooks/useFileUpload'
import {useHelpcenterApi} from '../hooks/useHelpcenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'

import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import {UpdateToggle} from './UpdateToggle'
import {ImageUpload} from './ImageUpload'
import {ThemeSwitch} from './ThemeSwitch'

import css from './HelpCenterAppearanceView.less'

export const HelpCenterAppearanceView: React.FC = () => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const helpCenter = useSelector(getCurrentHelpCenter)
    const {client} = useHelpcenterApi()
    const helpCenterTheme: HelpCenterThemes =
        helpCenter?.theme && isHelpCenterTheme(helpCenter?.theme)
            ? helpCenter.theme
            : DEFAULT_THEME
    const helpCenterColor =
        helpCenter?.primary_color || HELP_CENTER_DEFAULT_COLOR
    const [selectedTheme, setSelectedTheme] = useState<HelpCenterThemes>(
        helpCenterTheme
    )
    const [currentColor, setCurrentColor] = useState(helpCenterColor)
    const primaryLogo = useFileUpload()
    const whiteLogo = useFileUpload()
    const favicon = useFileUpload()
    const bannerImage = useFileUpload()

    useEffect(() => {
        if (helpCenter?.theme) {
            if (isHelpCenterTheme(helpCenter?.theme)) {
                setSelectedTheme(helpCenter.theme)
            }
        }

        if (helpCenter?.primary_color) {
            setCurrentColor(helpCenter.primary_color)
        }
    }, [helpCenter])

    const [updateResponse, updateHelpCenter] = useAsyncFn(async () => {
        if (client && helpCenter) {
            const payload: Partial<HelpCenter> = {
                theme: selectedTheme,
                primary_color: currentColor,
            }

            if (primaryLogo.payload) {
                await primaryLogo.uploadFile().then((files) => {
                    if (files[0]) {
                        payload.brand_logo_url = files[0].url
                    }
                })
            } else if (primaryLogo.isTouched) {
                payload.brand_logo_url = null
            }

            if (whiteLogo.payload) {
                await whiteLogo.uploadFile().then((files) => {
                    if (files[0]) {
                        payload.brand_logo_white_url = files[0].url
                    }
                })
            } else if (whiteLogo.isTouched) {
                payload.brand_logo_white_url = null
            }

            if (favicon.payload) {
                await favicon.uploadFile().then((files) => {
                    if (files[0]) {
                        payload.favicon_url = files[0].url
                    }
                })
            } else if (favicon.isTouched) {
                payload.favicon_url = null
            }

            if (bannerImage.payload) {
                await bannerImage.uploadFile().then((files) => {
                    if (files[0]) {
                        payload.banner_image_url = files[0].url
                    }
                })
            } else if (bannerImage.isTouched) {
                payload.banner_image_url = null
            }

            const response = await client.updateHelpCenter(
                {
                    help_center_id: helpCenter.id,
                },
                payload
            )
            return response
        }

        throw Error('client or help center ID are missing!')
    }, [
        client,
        helpCenter,
        selectedTheme,
        currentColor,
        primaryLogo,
        favicon,
        bannerImage,
        whiteLogo,
    ])

    const allowSaveCurrentAppearance = useMemo(() => {
        if (selectedTheme !== helpCenter?.theme) {
            return Boolean(selectedTheme)
        }

        if (currentColor !== helpCenter?.primary_color) {
            return isHexColor(currentColor)
        }

        if (
            primaryLogo.isTouched ||
            whiteLogo.isTouched ||
            favicon.isTouched ||
            bannerImage.isTouched
        ) {
            return true
        }

        return false
    }, [
        helpCenter,
        selectedTheme,
        currentColor,
        primaryLogo,
        whiteLogo,
        favicon,
        bannerImage,
    ])

    const discardCurrentAppearance = () => {
        setSelectedTheme(helpCenterTheme)
        setCurrentColor(helpCenterColor)
        primaryLogo.discardFile()
        whiteLogo.discardFile()
        favicon.discardFile()
        bannerImage.discardFile()
    }

    const saveCurrentAppearance = async () => {
        try {
            const {data} = await updateHelpCenter()
            dispatch(helpCenterUpdated(data))

            void dispatch(
                notify({
                    message: 'Help Center successfully updated',
                    status: NotificationStatus.Success,
                })
            )

            primaryLogo.discardFile()
            whiteLogo.discardFile()
            bannerImage.discardFile()
            favicon.discardFile()
        } catch (err) {
            void dispatch(
                notify({
                    message: "Couldn't update the Help Center",
                    status: NotificationStatus.Error,
                })
            )
            console.error(err)
        }
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

    if (!helpCenter) {
        return null
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpcenterName={helpCenter.name}
                        activeLabel="Appearance"
                    />
                }
            />
            <HelpCenterNavigation helpcenterId={helpCenterId} />
            <Container
                fluid
                className="page-container"
                style={{maxWidth: 680, marginLeft: 0, paddingBottom: 18}}
            >
                <div className={css.section}>
                    <h3>Appearance</h3>
                    <p>Set up your Help Center’s logo, color and theme.</p>
                </div>
                <section className={css.logos}>
                    <ImageUpload
                        id="primary_logo"
                        title="Standard Logo"
                        info="Used in the main navigation when with the light theme."
                        file={primaryLogo.payload}
                        defaultPreview={helpCenter?.brand_logo_url || ''}
                        onChangeFile={primaryLogo.changeFile}
                        isTouched={primaryLogo.isTouched}
                        helpTextProps={{
                            highlight: getImageUploadHighlightText(
                                primaryLogo,
                                helpCenter?.brand_logo_url
                            ),
                            text: 'recommended size 1800 x 240',
                        }}
                    />
                    <ImageUpload
                        id="white_logo"
                        title="White Logo"
                        info="Used in the main navigation when with the dark theme."
                        file={whiteLogo.payload}
                        defaultPreview={helpCenter?.brand_logo_white_url || ''}
                        onChangeFile={whiteLogo.changeFile}
                        isTouched={whiteLogo.isTouched}
                        helpTextProps={{
                            highlight: getImageUploadHighlightText(
                                whiteLogo,
                                helpCenter?.brand_logo_white_url
                            ),
                            text: 'recommended size 1800 x 240',
                        }}
                    />
                    <ImageUpload
                        id="favicon"
                        title="Favicon"
                        info="This is shown in each browser beside your website’s name."
                        file={favicon.payload}
                        defaultPreview={helpCenter?.favicon_url || ''}
                        onChangeFile={favicon.changeFile}
                        isTouched={favicon.isTouched}
                        helpTextProps={{
                            highlight: getImageUploadHighlightText(
                                favicon,
                                helpCenter?.favicon_url
                            ),
                            text: 'recommended size 64 x 64',
                        }}
                        accept="image/png,image/jpeg,image/x-icon"
                        size="small"
                    />
                </section>
                <ThemeSwitch
                    selectedTheme={selectedTheme}
                    currentColor={currentColor}
                    onThemeChange={setSelectedTheme}
                    onColorChange={setCurrentColor}
                />
                <section className={css.section}>
                    <ImageUpload
                        id="banner_image"
                        title="Banner Background"
                        info="Your banner is an image  that’s displayed on the top of your home page."
                        file={bannerImage.payload}
                        defaultPreview={helpCenter?.banner_image_url || ''}
                        onChangeFile={bannerImage.changeFile}
                        isTouched={bannerImage.isTouched}
                        isFluid
                        helpTextProps={{
                            highlight: getImageUploadHighlightText(
                                bannerImage,
                                helpCenter?.banner_image_url
                            ),
                            text: 'recommended size 1440 x 316',
                        }}
                    />
                </section>
                <section>
                    <h3>Other settings</h3>
                    <UpdateToggle
                        activated={
                            helpCenter.search_deactivated_datetime === null
                        }
                        label="Enable search bar"
                        description="This makes the search bar visible or not in your Help Center
                        home page."
                        fieldName="search_deactivated"
                    />
                    <UpdateToggle
                        activated={
                            helpCenter.powered_by_deactivated_datetime === null
                        }
                        label="Powered by Gorgias"
                        description="Turns on/off the ‘Powered by Gorgias’ label in your Help Center footer."
                        fieldName="powered_by_deactivated"
                    />
                </section>
                <footer>
                    <FormGroup className="mt-5">
                        <Button
                            className="mr-2"
                            color="success"
                            disabled={
                                !allowSaveCurrentAppearance ||
                                updateResponse.loading
                            }
                            onClick={saveCurrentAppearance}
                        >
                            {updateResponse.loading
                                ? 'Saving...'
                                : 'Save Changes'}
                        </Button>
                        <Button onClick={discardCurrentAppearance}>
                            Cancel
                        </Button>
                    </FormGroup>
                </footer>
            </Container>
        </div>
    )
}

export default HelpCenterAppearanceView
