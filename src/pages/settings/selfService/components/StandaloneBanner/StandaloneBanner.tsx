import React, {useMemo} from 'react'
import {NavLink} from 'react-router-dom'

import standalonePreview from 'assets/img/presentationals/standalone-self-service-portal.png'

import {HelpCenter} from 'models/helpCenter/types'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'

import {Banner} from 'pages/common/components/Banner'

import css from './StandaloneBanner.less'

type Props = {
    helpCenters: HelpCenter[]
    onClose: () => void
}

export const StandaloneBanner = ({
    helpCenters,
    onClose,
}: Props): JSX.Element => {
    const title = useMemo(() => {
        if (helpCenters.length === 1 && helpCenters[0].shop_name) {
            return `We created a help center for ${helpCenters[0].shop_name} to help you get started.`
        }
        return 'We created a help center for each store to help you get started.'
    }, [helpCenters])

    const content = useMemo(() => {
        if (helpCenters.length === 1 && helpCenters[0].shop_name) {
            const url = getAbsoluteUrl({
                domain: getHelpCenterDomain(helpCenters[0]),
                locale: 'en-US',
            })
            return (
                <div className={css.bannerContent}>
                    <div>
                        Customize your help center to look and feel like your
                        brand by adding a logo, background image, your brand
                        color and fonts, and more! Use your{' '}
                        <a href={url}>help center’s live</a> URL to redirect
                        shoppers to self-service.
                    </div>
                    <NavLink
                        className={css.nextLink}
                        to={`/app/settings/help-center/${helpCenters[0].id}/appearance`}
                        exact
                    >
                        Customize Help Center
                    </NavLink>
                </div>
            )
        }
        return (
            <div className={css.bannerContent}>
                <div>
                    Customize it to look and feel like your brand by adding a
                    logo, background image, your brand color and fonts, and
                    more!
                </div>
                <NavLink
                    className={css.nextLink}
                    to="/app/settings/help-center"
                    exact
                >
                    Customize Help Center
                </NavLink>
            </div>
        )
    }, [helpCenters])

    return (
        <div className={css.wrapper}>
            <Banner
                dismissible
                title={title}
                preview={<img src={standalonePreview} alt="" />}
                onClose={onClose}
            >
                {content}
            </Banner>
        </div>
    )
}
