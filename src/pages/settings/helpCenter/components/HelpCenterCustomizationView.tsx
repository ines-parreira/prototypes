import React, {useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {Button, Container, FormGroup} from 'reactstrap'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {
    LocaleCode,
    LocalSocialNavigationLink,
    NavigationLink,
} from '../../../../models/helpCenter/types'
import {
    changeViewLanguage,
    getViewLanguage,
} from '../../../../state/helpCenter/ui'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'
import {SocialNavigationLinks} from '../components/SocialNavigationLinks'
import {HELP_CENTER_DEFAULT_LOCALE, SOCIAL_NAVIGATION_LINKS} from '../constants'
import {useCurrentHelpCenter} from '../hooks/useCurrentHelpCenter'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {useLocales} from '../hooks/useLocales'
import {
    useNavigationLinks,
    useSocialNavigationLinks,
} from '../hooks/useNavigationLinks'
import {getLocaleSelectOptions} from '../utils/localeSelectOptions'
import {saveNavigationLinks, saveSocialLinks} from '../utils/navigationLinks'
import css from '../../settings.less'

import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import {NavSection} from './NavSection'

export const HelpCenterCustomizationView = () => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const {isReady, client} = useHelpCenterApi()
    const locales = useLocales()
    const {helpCenter} = useCurrentHelpCenter()
    const selectedLocale =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [links, setLinks] = useState<NavigationLink[]>([])

    const handleOnChangeLocale = (locale: LocaleCode) => {
        dispatch(changeViewLanguage(locale))
    }

    useEffect(() => {
        async function init() {
            if (isReady && client && selectedLocale) {
                await client
                    .listNavigationLinks({
                        help_center_id: helpCenterId,
                        locale: selectedLocale,
                    })
                    .then((response) => setLinks(response.data.data))
            }
        }

        void init()
    }, [isReady, helpCenterId, selectedLocale, client])

    const linksWithoutSocial = useMemo(
        () =>
            links.filter((link) =>
                link.meta?.network
                    ? !Object.keys(SOCIAL_NAVIGATION_LINKS).includes(
                          link.meta?.network
                      )
                    : true
            ),
        [links]
    )

    const socialLinks = useMemo(
        () =>
            Object.entries(
                SOCIAL_NAVIGATION_LINKS
            ).map<LocalSocialNavigationLink>(([socialKey, socialLink]) => {
                const currentRemoteLink = links.find((link) =>
                    link.meta?.network
                        ? socialKey === link.meta.network.toLowerCase()
                        : false
                )

                if (currentRemoteLink) {
                    return {
                        id: currentRemoteLink.id,
                        label: currentRemoteLink.label,
                        value: currentRemoteLink.value,
                        group: currentRemoteLink.group,
                        meta: currentRemoteLink.meta,
                        created_datetime: currentRemoteLink.created_datetime,
                        updated_datetime: currentRemoteLink.updated_datetime,
                    }
                }

                return socialLink
            }),
        [links]
    )

    const headerNavigation = useNavigationLinks('header', linksWithoutSocial)
    const footerNavigation = useNavigationLinks('footer', linksWithoutSocial)
    const socialNavigation = useSocialNavigationLinks(socialLinks, {
        allowEmpty: true,
    })

    const handleOnReset = () => {
        headerNavigation.resetFields()
        footerNavigation.resetFields()
    }
    const handleOnSave = async () => {
        if (client) {
            try {
                await saveNavigationLinks(
                    client,
                    linksWithoutSocial,
                    headerNavigation.links.filter(
                        (link) => link.label && link.value
                    ),
                    {
                        group: 'header',
                        helpCenterId: helpCenterId,
                        locale: selectedLocale,
                    }
                )

                await saveNavigationLinks(
                    client,
                    linksWithoutSocial,
                    footerNavigation.links.filter(
                        (link) => link.label && link.value
                    ),
                    {
                        group: 'footer',
                        helpCenterId: helpCenterId,
                        locale: selectedLocale,
                    }
                )

                await saveSocialLinks(client, socialNavigation.links, {
                    helpCenterId: helpCenterId,
                    locale: selectedLocale,
                })

                const navigationLinks = await client.listNavigationLinks({
                    help_center_id: helpCenterId,
                    locale: selectedLocale,
                })

                setLinks(navigationLinks.data.data)

                void dispatch(
                    notify({
                        message: 'Links saved with success',
                        status: NotificationStatus.Success,
                    })
                )
            } catch (err) {
                // ?   These messages are not really meaningful because if one request fails,
                // ? we are saying we failed to save them.
                void dispatch(
                    notify({
                        message: 'Failed to save the links',
                        status: NotificationStatus.Error,
                    })
                )

                console.error(err)
            }
        }
    }

    if (!helpCenter) {
        return (
            <Container fluid className={css.pageContainer}>
                <Loader />
            </Container>
        )
    }

    const localesOptions = getLocaleSelectOptions(
        locales,
        helpCenter.supported_locales
    )

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpCenterName={helpCenter.name}
                        activeLabel="Customization"
                    />
                }
            />
            <HelpCenterNavigation helpCenterId={helpCenterId} />
            <Container fluid className={css.pageContainer}>
                <div className={css.contentWrapper}>
                    <NavSection
                        availableLocales={localesOptions}
                        description="Change navigation elements at the top of the Help Center."
                        items={headerNavigation.links}
                        name="header"
                        selectedLocale={selectedLocale}
                        title="Header settings"
                        onChangeLink={(ev, key, id) => {
                            headerNavigation.update(ev.target.value, id, key)
                        }}
                        onClickAdd={() => headerNavigation.add(selectedLocale)}
                        onChangeLocale={handleOnChangeLocale}
                        onClickRemove={headerNavigation.remove}
                    />
                    <NavSection
                        availableLocales={localesOptions}
                        description="Change navigation elements at the bottom of the Help Center."
                        items={footerNavigation.links}
                        name="footer"
                        selectedLocale={selectedLocale}
                        title="Footer settings"
                        onChangeLink={(ev, key, id) => {
                            footerNavigation.update(ev.target.value, id, key)
                        }}
                        onClickAdd={() => footerNavigation.add(selectedLocale)}
                        onChangeLocale={handleOnChangeLocale}
                        onClickRemove={footerNavigation.remove}
                    />
                    <SocialNavigationLinks
                        links={socialNavigation.links}
                        locale={selectedLocale}
                        onBlurLink={(ev, key, id) => {
                            socialNavigation.update(ev.target.value, id, key)
                        }}
                    />
                    <FormGroup>
                        <Button
                            disabled={
                                !headerNavigation.isListValid() ||
                                !footerNavigation.isListValid() ||
                                !socialNavigation.isListValid()
                            }
                            className="mr-2"
                            color="success"
                            onClick={handleOnSave}
                        >
                            Save Changes
                        </Button>
                        <Button onClick={handleOnReset}>Cancel</Button>
                    </FormGroup>
                </div>
            </Container>
        </div>
    )
}

export default HelpCenterCustomizationView
