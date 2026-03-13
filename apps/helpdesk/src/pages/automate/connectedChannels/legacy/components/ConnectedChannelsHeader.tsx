import { useMemo } from 'react'

import { NavLink, useParams } from 'react-router-dom'

import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import {
    AVAILABLE_CHANNELS,
    CHANNELS,
} from '../../../common/components/constants'

import css from '../ConnectedChannelsView.less'

export const ConnectedChannelsHeader = () => {
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()
    const isAutomateSettings = useIsAutomateSettings()

    const baseURL = useMemo(() => {
        if (isAutomateSettings) {
            return `/app/settings/flows/${shopType}/${shopName}/channels`
        }
        return `/app/automation/${shopType}/${shopName}/connected-channels`
    }, [isAutomateSettings, shopType, shopName])

    if (isAutomateSettings) {
        return null
    }

    const headerNavbarItems = [
        {
            title: AVAILABLE_CHANNELS.CHAT,
            route: baseURL,
        },
        {
            title: AVAILABLE_CHANNELS.HELP_CENTER,
            route: `${baseURL}/help-center`,
        },
        {
            title: AVAILABLE_CHANNELS.CONTACT_FORM,
            route: `${baseURL}/contact-form`,
        },
        {
            title: AVAILABLE_CHANNELS.EMAIL,
            route: `${baseURL}/email`,
        },
    ]

    return (
        <div className={css.pageHeader}>
            <PageHeader title={CHANNELS} />

            <SecondaryNavbar>
                {headerNavbarItems.map(({ route, title }) => (
                    <NavLink key={route} to={route} exact={true}>
                        {title}
                    </NavLink>
                ))}
            </SecondaryNavbar>
        </div>
    )
}
