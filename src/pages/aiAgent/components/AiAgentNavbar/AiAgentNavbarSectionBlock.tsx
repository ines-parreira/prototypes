import React from 'react'

import classNames from 'classnames'

import { Badge } from '@gorgias/merchant-ui-kit'

import cssNavbar from 'assets/css/navbar.less'
import { ShopType } from 'models/selfServiceConfiguration/types'
import { SALES } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import { getIconFromType } from 'state/integrations/helpers'

import css from './AiAgentNavbarSectionBlock.less'

type Props = {
    shopType: ShopType
    shopName: string
    onToggle: () => void
    name: string
    isExpanded: boolean
}
export const AiAgentNavbarSectionBlock = ({
    shopType,
    shopName,
    ...props
}: Props) => {
    const { navigationItems, routes } = useAiAgentNavigation({ shopName })

    const onboardingState = useAiAgentOnboardingState(shopName)

    if (onboardingState === OnboardingState.Loading) {
        return null
    }

    const itemName = (item: any) => {
        return item.title === SALES ? (
            <div className={css.item}>
                {item.title}
                <Badge type="blue">BETA</Badge>
            </div>
        ) : (
            item.title
        )
    }

    return (
        <NavbarSectionBlock
            icon={
                <img
                    alt={`${shopType} logo`}
                    role="presentation"
                    src={getIconFromType(shopType)}
                />
            }
            className={css.section}
            {...props}
        >
            {onboardingState === OnboardingState.Onboarded ? (
                navigationItems?.map((item) => (
                    <div
                        key={item.route}
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                        {...(item.dataCanduId && {
                            ['data-candu-id']: item.dataCanduId,
                        })}
                    >
                        <NavbarLink to={item.route}>
                            <span className={cssNavbar['item-name']}>
                                {itemName(item)}
                            </span>
                        </NavbarLink>
                    </div>
                ))
            ) : (
                <div
                    key={routes.main}
                    className={classNames(
                        cssNavbar['link-wrapper'],
                        cssNavbar.isNested,
                    )}
                >
                    <NavbarLink to={routes.main}>
                        <span className={cssNavbar['item-name']}>
                            Get Started
                        </span>
                    </NavbarLink>
                </div>
            )}
        </NavbarSectionBlock>
    )
}
