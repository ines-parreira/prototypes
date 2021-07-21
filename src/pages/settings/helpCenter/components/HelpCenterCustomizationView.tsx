import React from 'react'
import {useSelector} from 'react-redux'
import {Button, Container, FormGroup} from 'reactstrap'

import {
    LocaleCode,
    NavigationLinkDto,
} from '../../../../models/helpCenter/types'

import useAppDispatch from '../../../../hooks/useAppDispatch'

import {NotificationStatus} from '../../../../state/notifications/types'
import {notify} from '../../../../state/notifications/actions'

import PageHeader from '../../../common/components/PageHeader'
import {readHelpcenterById} from '../../../../state/entities/helpCenters/selectors'

import {
    HELP_CENTER_LANGUAGE_DEFAULT,
    SOCIAL_NAVIGATION_LINKS,
} from '../constants'

import {
    useNavigationLinks,
    useSocialNavigationLinks,
} from '../hooks/useNavigationLinks'
// import {useLocaleSelectOptions} from '../hooks/useLocaleSelectOptions'
import {useHelpcenterApi} from '../hooks/useHelpcenterApi'

import {saveSocialLinks, saveNavigationLinks} from '../utils/navigationLinks'

import {SocialNavigationLinks} from '../components/SocialNavigationLinks'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'

import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import {NavSection} from './NavSection'

export const HelpCenterCustomizationView = () => {
    const helpcenterId = useHelpCenterIdParam()
    const dispatch = useAppDispatch()

    const data = useSelector(readHelpcenterById(helpcenterId.toString()))
    const {isReady, client} = useHelpcenterApi()

    const [links, setLinks] = React.useState<NavigationLinkDto[]>([])
    const [selectedLocale, setSelectedLocale] = React.useState<LocaleCode>(
        HELP_CENTER_LANGUAGE_DEFAULT
    )

    React.useEffect(() => {
        if (selectedLocale !== data?.default_locale && data?.default_locale) {
            setSelectedLocale(data?.default_locale)
        }
    }, [data?.default_locale, selectedLocale])

    React.useEffect(() => {
        async function init() {
            if (isReady && client && selectedLocale) {
                const navigationlinks = await client
                    .listNavigationLinks({
                        help_center_id: helpcenterId,
                        locale: selectedLocale,
                    })
                    .then((response) => response.data.data)

                setLinks(navigationlinks)
            }
        }

        void init()
    }, [isReady, helpcenterId, selectedLocale, client])

    const linksWithoutSocial = React.useMemo(() => {
        return links.filter((link) => {
            if (link.translation) {
                if (link.meta && link.meta?.network) {
                    return !Object.keys(SOCIAL_NAVIGATION_LINKS).includes(
                        link.meta?.network
                    )
                }
                return true
            }
            return true
        })
    }, [links])

    const socialLinks = React.useMemo(() => {
        return Object.entries(SOCIAL_NAVIGATION_LINKS).map(
            ([socialKey, socialLink]) => {
                const currentRemoteLink = links.find((link) => {
                    if (link.meta && link.meta?.network) {
                        return socialKey === link.meta.network.toLowerCase()
                    }

                    return false
                })

                if (currentRemoteLink) {
                    return {
                        id: currentRemoteLink.id,
                        position: socialLink.position,
                        group: currentRemoteLink.group,
                        meta: currentRemoteLink.meta,
                        translation: {
                            label: currentRemoteLink.translation.label,
                            value: currentRemoteLink.translation.value,
                            created_datetime:
                                currentRemoteLink.translation.created_datetime,
                            updated_datetime:
                                currentRemoteLink.translation.updated_datetime,
                            navigation_link_id:
                                currentRemoteLink.translation
                                    .navigation_link_id,
                        },
                    }
                }

                return socialLink
            }
        )
    }, [links])

    const headerNavigation = useNavigationLinks('header', linksWithoutSocial)
    const footerNavigation = useNavigationLinks('footer', linksWithoutSocial)
    const socialNavigation = useSocialNavigationLinks('footer', socialLinks, {
        allowEmpty: true,
    })

    // TODO: Uncomment this when we support locales
    // const localesOptions = useLocaleSelectOptions(
    //     getLocalesResponseFixture,
    //     data?.supported_locales
    // )

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
                        (link) =>
                            link.translation.label && link.translation.value
                    ),
                    {
                        group: 'header',
                        helpcenterId: helpcenterId,
                        locale: selectedLocale,
                    }
                )

                await saveNavigationLinks(
                    client,
                    linksWithoutSocial,
                    footerNavigation.links.filter(
                        (link) =>
                            link.translation.label && link.translation.value
                    ),
                    {
                        group: 'footer',
                        helpcenterId: helpcenterId,
                        locale: selectedLocale,
                    }
                )

                await saveSocialLinks(client, socialNavigation.links, {
                    helpcenterId: helpcenterId,
                    locale: selectedLocale,
                })

                const navigationlinks = await client.listNavigationLinks({
                    help_center_id: helpcenterId,
                    locale: selectedLocale,
                })

                setLinks(navigationlinks.data.data)

                void dispatch(
                    notify({
                        message: 'Successfully saved the links',
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

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpcenterName={data.name}
                        activeLabel="Customization"
                    />
                }
            />
            <HelpCenterNavigation helpcenterId={helpcenterId} />
            <Container
                fluid
                className="page-container"
                style={{paddingBottom: 24}}
            >
                <NavSection
                    availableLocales={[]} // {localesOptions}
                    description="Change navigation elements at the top of the help center."
                    items={headerNavigation.links}
                    name="header"
                    selectedLocale={selectedLocale}
                    title="Header settings"
                    onBlurLink={(ev, key, id) => {
                        headerNavigation.update(ev.target.value, id, key)
                    }}
                    onClickAdd={() => headerNavigation.add(selectedLocale)}
                    onChangeLocale={setSelectedLocale}
                    onClickRemove={headerNavigation.remove}
                />
                <NavSection
                    availableLocales={[]} // {localesOptions}
                    description="Change navigation elements at the bottom of the help center."
                    items={footerNavigation.links}
                    name="footer"
                    selectedLocale={selectedLocale}
                    title="Footer settings"
                    onBlurLink={(ev, key, id) => {
                        footerNavigation.update(ev.target.value, id, key)
                    }}
                    onClickAdd={() => footerNavigation.add(selectedLocale)}
                    onChangeLocale={setSelectedLocale}
                    onClickRemove={footerNavigation.remove}
                />
                <SocialNavigationLinks
                    links={socialNavigation.links}
                    onBlurLink={(ev, key, id) => {
                        socialNavigation.update(ev.target.value, id, key)
                    }}
                />
                <FormGroup className="mt-5">
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
            </Container>
        </div>
    )
}

export default HelpCenterCustomizationView
