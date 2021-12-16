import React, {useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {Button, FormGroup} from 'reactstrap'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {
    LocalSocialNavigationLink,
    NavigationLink,
} from '../../../../models/helpCenter/types'
import {getViewLanguage} from '../../../../state/helpCenter/ui'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {SocialNavigationLinks} from '../components/SocialNavigationLinks'
import {HELP_CENTER_DEFAULT_LOCALE, SOCIAL_NAVIGATION_LINKS} from '../constants'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {
    useNavigationLinks,
    useSocialNavigationLinks,
} from '../hooks/useNavigationLinks'
import {useCurrentHelpCenter} from '../providers/CurrentHelpCenter'
import {saveNavigationLinks, saveSocialLinks} from '../utils/navigationLinks'

import HelpCenterPageWrapper from './HelpCenterPageWrapper'
import {NavSection} from './NavSection'

export const HelpCenterCustomizationView = () => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const {isReady, client} = useHelpCenterApi()
    const helpCenter = useCurrentHelpCenter()
    const selectedLocale =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [links, setLinks] = useState<NavigationLink[]>([])

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

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            activeLabel="Customization"
            showLanguageSelector
        >
            <NavSection
                description="Change navigation elements at the top of the Help Center."
                items={headerNavigation.links}
                name="header"
                title="Header settings"
                onChangeLink={(ev, key, id) => {
                    headerNavigation.update(ev.target.value, id, key)
                }}
                onClickAdd={() => headerNavigation.add(selectedLocale)}
                onClickRemove={headerNavigation.remove}
            />
            <NavSection
                description="Change navigation elements at the bottom of the Help Center."
                items={footerNavigation.links}
                name="footer"
                title="Footer settings"
                onChangeLink={(ev, key, id) => {
                    footerNavigation.update(ev.target.value, id, key)
                }}
                onClickAdd={() => footerNavigation.add(selectedLocale)}
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
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterCustomizationView
