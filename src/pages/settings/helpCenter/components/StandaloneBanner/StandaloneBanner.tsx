import React, {useMemo} from 'react'
import {NavLink} from 'react-router-dom'

import standalonePreview from 'assets/img/presentationals/standalone-self-service-portal.png'

import {HelpCenter} from 'models/helpCenter/types'

import {Banner} from 'pages/common/components/Banner'

import {getAbsoluteUrl, getHelpCenterDomain} from '../../utils/helpCenter.utils'

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
            return `We created a Help Center for ${helpCenters[0].shop_name} to help you get started.`
        }
        return 'We created a Help Center for each store to help you get started.'
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
                        Customize your Help Center to look and feel like your
                        brand by adding a logo, background image, your brand
                        color and fonts, and more! Use your{' '}
                        <a href={url}>Help Center’s live</a> URL to redirect
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
                    Customize your Help Centers below to look and feel like your
                    brand by
                </div>
                <div>
                    adding a logo, background image, brand color and fonts, and
                    more!
                </div>
            </div>
        )
    }, [helpCenters])

    return (
        <Banner
            dismissible
            title={title}
            preview={<img src={standalonePreview} alt="" />}
            onClose={onClose}
        >
            {content}
        </Banner>
    )
}
