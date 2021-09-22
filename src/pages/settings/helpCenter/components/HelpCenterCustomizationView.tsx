import React from 'react'
import {useSelector} from 'react-redux'
import {Button, Container, FormGroup} from 'reactstrap'

import {
    LocaleCode,
    LocalSocialNavigationLink,
    NavigationLinkDto,
} from '../../../../models/helpCenter/types'

import useAppDispatch from '../../../../hooks/useAppDispatch'

import {
    changeViewLanguage,
    getViewLanguage,
} from '../../../../state/helpCenter/ui'
import {NotificationStatus} from '../../../../state/notifications/types'
import {notify} from '../../../../state/notifications/actions'
import {getCurrentHelpCenter} from '../../../../state/entities/helpCenters/selectors'

import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'

import {
    HELP_CENTER_LANGUAGE_DEFAULT,
    SOCIAL_NAVIGATION_LINKS,
} from '../constants'

import {
    useNavigationLinks,
    useSocialNavigationLinks,
} from '../hooks/useNavigationLinks'
import {useLocaleSelectOptions} from '../hooks/useLocaleSelectOptions'
import {useHelpcenterApi} from '../hooks/useHelpcenterApi'

import {saveSocialLinks, saveNavigationLinks} from '../utils/navigationLinks'

import {SocialNavigationLinks} from '../components/SocialNavigationLinks'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {useLocales} from '../hooks/useLocales'

import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import {NavSection} from './NavSection'

export const HelpCenterCustomizationView = () => {
    const helpCenterId = useHelpCenterIdParam()
    const dispatch = useAppDispatch()
    const locales = useLocales()

    const helpCenter = useSelector(getCurrentHelpCenter)
    const {isReady, client} = useHelpcenterApi()

    const [links, setLinks] = React.useState<NavigationLinkDto[]>([])
    const selectedLocale =
        useSelector(getViewLanguage) || HELP_CENTER_LANGUAGE_DEFAULT

    const localesOptions = useLocaleSelectOptions(
        locales,
        helpCenter?.supported_locales || []
    )

    const handleOnChangeLocale = (locale: LocaleCode) => {
        dispatch(changeViewLanguage(locale))
    }

    React.useEffect(() => {
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

    const linksWithoutSocial = React.useMemo(
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

    const socialLinks = React.useMemo(
        () =>
            Object.entries(SOCIAL_NAVIGATION_LINKS).map<
                LocalSocialNavigationLink
            >(([socialKey, socialLink]) => {
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

    if (!helpCenter) {
        return (
            <Container fluid className="page-container">
                <Loader />
            </Container>
        )
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
                        helpcenterName={helpCenter.name}
                        activeLabel="Customization"
                    />
                }
            />
            <HelpCenterNavigation helpcenterId={helpCenterId} />
            <Container
                fluid
                className="page-container"
                style={{paddingBottom: 24}}
            >
                <NavSection
                    availableLocales={localesOptions}
                    description="Change navigation elements at the top of the help center."
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
                    description="Change navigation elements at the bottom of the help center."
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
