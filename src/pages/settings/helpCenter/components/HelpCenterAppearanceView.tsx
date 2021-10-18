import React, {useEffect, useMemo, useState} from 'react'
import axios from 'axios'
import classNames from 'classnames'
import {useSelector} from 'react-redux'
import {useAsyncFn} from 'react-use'
import {Button, Container, FormGroup} from 'reactstrap'
import isHexColor from 'validator/lib/isHexColor'

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

                resetCurrentAppearance()

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

    const resetCurrentAppearance = () => {
        setSelectedTheme(helpCenterTheme)
        setCurrentColor(helpCenterColor)
        primaryLogo.discardFile()
        lightLogo.discardFile()
        favicon.discardFile()
        bannerImage.discardFile()
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
                className={classNames('page-container', css.container)}
            >
                <div className={css.section}>
                    <h3>Appearance</h3>
                    <p>Set up your Help Center’s logo, color and theme.</p>
                </div>
                <div className={classNames(css.section, css.logos)}>
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
                </div>
                <div className={css.section}>
                    <ThemeSwitch
                        selectedTheme={selectedTheme}
                        currentColor={currentColor}
                        onThemeChange={setSelectedTheme}
                        onColorChange={setCurrentColor}
                    />
                </div>
                <div className={css.section}>
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
                </div>
                <div className={css.section}>
                    <h3 className="mb-3">Other settings</h3>
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
                </div>
                <footer>
                    <FormGroup className="mt-5">
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
            </Container>
        </div>
    )
}

export default HelpCenterAppearanceView
