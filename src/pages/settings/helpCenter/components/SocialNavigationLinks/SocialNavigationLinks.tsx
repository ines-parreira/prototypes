import React from 'react'

import facebookLogo from '../../../../../../img/icons/social/facebook.svg'
import twitterLogo from '../../../../../../img/icons/social/twitter.svg'
import instagramLogo from '../../../../../../img/icons/social/instagram.svg'

import {
    LocaleCode,
    LocalSocialNavigationLink,
} from '../../../../../models/helpCenter/types'

import css from './SocialNavigationLinks.less'
import {SocialNavigationItem} from './SocialNavigationItem'

const LOGO_MAP: {[key: string]: string} = {
    facebook: facebookLogo,
    twitter: twitterLogo,
    instagram: instagramLogo,
}

type Props = {
    locale: LocaleCode
    links: LocalSocialNavigationLink[]
    onBlurLink: (
        ev: React.FocusEvent<HTMLInputElement>,
        key: 'value',
        id: number
    ) => void
}

export const SocialNavigationLinks = ({
    locale,
    links,
    onBlurLink,
}: Props): JSX.Element => {
    return (
        <div className={css['social-list']}>
            <h3>Social network links</h3>
            {links.map((link) => {
                if (LOGO_MAP[link.label.toLowerCase()]) {
                    return (
                        <SocialNavigationItem
                            key={`${link.id}-${locale}`}
                            id={link.id}
                            label={link.label}
                            value={link.value}
                            logo={LOGO_MAP[link.label.toLowerCase()]}
                            onBlur={onBlurLink}
                        />
                    )
                }
                return null
            })}
        </div>
    )
}
