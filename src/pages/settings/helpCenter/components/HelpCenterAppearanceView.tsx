import React, {useEffect, useMemo, useState} from 'react'
import axios from 'axios'
import {useAsyncFn} from 'react-use'
import {Button, Container, FormGroup} from 'reactstrap'
import isHexColor from 'validator/lib/isHexColor'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {HelpCenter} from '../../../../models/helpCenter/types'
import {helpCenterUpdated} from '../../../../state/entities/helpCenters/actions'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'
import {
    HELP_CENTER_DEFAULT_COLOR,
    HELP_CENTER_DEFAULT_THEME,
} from '../constants'
import {useCurrentHelpCenter} from '../hooks/useCurrentHelpCenter'
import {FileUpload, useFileUpload} from '../hooks/useFileUpload'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {HelpCenterTheme, isHelpCenterTheme} from '../types'

import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import {ImageUpload} from './ImageUpload'
import {PageContainer} from './PageContainer'
import {ThemeSwitch} from './ThemeSwitch'
import {UpdateToggle} from './UpdateToggle'

import css from './HelpCenterAppearanceView.less'

export const HelpCenterAppearanceView: React.FC = () => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const {helpCenter} = useCurrentHelpCenter()
    const {client} = useHelpCenterApi()
    const helpCenterTheme: HelpCenterTheme =
        helpCenter?.theme && isHelpCenterTheme(helpCenter?.theme)
            ? helpCenter.theme
            : HELP_CENTER_DEFAULT_THEME
    const helpCenterColor =
        helpCenter?.primary_color || HELP_CENTER_DEFAULT_COLOR
    const [selectedTheme, setSelectedTheme] = useState<HelpCenterTheme>(
        helpCenterTheme
    )
    const [currentColor, setCurrentColor] = useState(helpCenterColor)
    const primaryLogo = useFileUpload()
    const lightLogo = useFileUpload()
    const favicon = useFileUpload()
    const bannerImage = useFileUpload()

    useEffect(() => {
        if (helpCenter?.theme && isHelpCenterTheme(helpCenter.theme)) {
            setSelectedTheme(helpCenter.theme)
        }

        if (helpCenter?.primary_color) {
            setCurrentColor(helpCenter.primary_color)
        }
    }, [helpCenter])

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
                }

                payload.brand_logo_url = await getFileUploadURL(primaryLogo)
                payload.brand_logo_light_url = await getFileUploadURL(lightLogo)
                payload.favicon_url = await getFileUploadURL(favicon)
                payload.banner_image_url = await getFileUploadURL(bannerImage)

                const {data} = await client.updateHelpCenter(
                    {
                        help_center_id: helpCenter.id,
                    },
                    payload
                )

                dispatch(helpCenterUpdated(data))

                discardAllFiles()

                void dispatch(
                    notify({
                        message: 'Help Center successfully updated',
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
                        message: `Couldn't update the Help Center: ${errorMessage}`,
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
        primaryLogo,
        favicon,
        bannerImage,
        lightLogo,
    ])

    const canSaveCurrentAppearance = useMemo(() => {
        if (updateResponse.loading) {
            return false
        }

        if (selectedTheme !== helpCenter?.theme) {
            return Boolean(selectedTheme)
        }

        if (currentColor !== helpCenter?.primary_color) {
            return isHexColor(currentColor)
        }

        if (
            primaryLogo.isTouched ||
            lightLogo.isTouched ||
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
        lightLogo,
        favicon,
        bannerImage,
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

    if (!helpCenter) {
        return (
            <Container fluid className="page-container">
                <Loader />
            </Container>
        )
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpCenterName={helpCenter.name}
                        activeLabel="Appearance"
                    />
                }
            />
            <HelpCenterNavigation helpCenterId={helpCenterId} />
            <PageContainer>
                <section>
                    <div className={css.heading}>
                        <h3>Appearance</h3>
                        <p>Set up your Help Center’s logo, color and theme.</p>
                    </div>
                </section>
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
                            text: 'maximum 10 MB',
                        }}
                    />
                    <ImageUpload
                        id="light_logo"
                        title="Light Logo"
                        info="Used in the main navigation when with the dark theme."
                        file={lightLogo.payload}
                        defaultPreview={helpCenter?.brand_logo_light_url || ''}
                        onChangeFile={lightLogo.changeFile}
                        isTouched={lightLogo.isTouched}
                        helpTextProps={{
                            highlight: getImageUploadHighlightText(
                                lightLogo,
                                helpCenter?.brand_logo_light_url
                            ),
                            text: 'maximum 10 MB',
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
                <section>
                    <ThemeSwitch
                        selectedTheme={selectedTheme}
                        currentColor={currentColor}
                        onThemeChange={setSelectedTheme}
                        onColorChange={setCurrentColor}
                    />
                </section>
                <section>
                    <div className={css.heading}>
                        <h3>Banner settings</h3>
                        <p>
                            This is displayed on top of your help center’s{' '}
                            <strong>home page</strong>.
                        </p>
                    </div>
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
                            text: 'recommended size 1440 x 316 - Maximum 10 MB',
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
                    <FormGroup>
                        <Button
                            className="mr-2"
                            color="success"
                            disabled={!canSaveCurrentAppearance}
                            onClick={saveCurrentAppearance}
                        >
                            {updateResponse.loading
                                ? 'Saving...'
                                : 'Save Changes'}
                        </Button>
                        <Button onClick={resetCurrentAppearance}>Cancel</Button>
                    </FormGroup>
                </footer>
            </PageContainer>
        </div>
    )
}

export default HelpCenterAppearanceView
