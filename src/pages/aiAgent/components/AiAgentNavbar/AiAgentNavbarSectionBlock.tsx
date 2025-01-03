import classNames from 'classnames'
import React from 'react'

import cssNavbar from 'assets/css/navbar.less'
import useAppSelector from 'hooks/useAppSelector'
import {ShopType} from 'models/selfServiceConfiguration/types'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {useStoreConfiguration} from 'pages/aiAgent/hooks/useStoreConfiguration'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getIconFromType} from 'state/integrations/helpers'

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
    const {headerNavbarItems, routes} = useAiAgentNavigation({shopName})

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const {storeConfiguration, isLoading} = useStoreConfiguration({
        shopName,
        accountDomain,
    })

    if (isLoading) {
        return null
    }

    // TODO(Kayyow): Fix condition to check if AI Agent is enabled
    const isAiAgentEnabled =
        storeConfiguration && !storeConfiguration.deactivatedDatetime

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
            {isAiAgentEnabled ? (
                headerNavbarItems.map((item) => (
                    <div
                        key={item.route}
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                        {...(item.dataCanduId && {
                            ['data-candu-id']: item.dataCanduId,
                        })}
                    >
                        <NavbarLink to={item.route}>
                            <span className={cssNavbar['item-name']}>
                                {item.title}
                            </span>
                        </NavbarLink>
                    </div>
                ))
            ) : (
                <div
                    key={routes.main}
                    className={classNames(
                        cssNavbar['link-wrapper'],
                        cssNavbar.isNested
                    )}
                >
                    <NavbarLink to={routes.main}>
                        <span className={cssNavbar['item-name']}>Set Up</span>
                    </NavbarLink>
                </div>
            )}
        </NavbarSectionBlock>
    )
}
