import React from 'react'
import classNames from 'classnames'

import cssNavbar from 'assets/css/navbar.less'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import css from './ConvertNavbarSectionBlock.less'
import ConvertNavbarPaywallNavbarLink from './ConvertNavbarPaywallNavbarLink'

type Props = {
    chatIntegrationId: number
    onToggle: () => void
    name: string
    isExpanded: boolean
    isOnboarded: boolean
    hasStore: boolean
}
const FROM_LOCATION = 'convert-left-menu'
const ConvertNavbarSectionBlock = ({
    chatIntegrationId,
    isOnboarded,
    hasStore,
    ...props
}: Props) => {
    const isConvertSubscriber = useIsConvertSubscriber()

    return (
        <NavbarSectionBlock
            icon={<i className={'material-icons'}>forum</i>}
            className={css.section}
            {...props}
        >
            {isOnboarded ? (
                <>
                    {hasStore &&
                        (isConvertSubscriber ? (
                            <div
                                className={classNames(
                                    cssNavbar['link-wrapper'],
                                    cssNavbar.isNested
                                )}
                            >
                                <NavbarLink
                                    to={{
                                        pathname: `/app/convert/${chatIntegrationId}/performance`,
                                        state: {from: FROM_LOCATION},
                                    }}
                                >
                                    <span className={cssNavbar['item-name']}>
                                        Performance
                                    </span>
                                </NavbarLink>
                            </div>
                        ) : (
                            <ConvertNavbarPaywallNavbarLink
                                to={`/app/convert/${chatIntegrationId}/performance/subscribe`}
                                isNested
                            >
                                <span className={cssNavbar['item-name']}>
                                    Performance
                                </span>
                            </ConvertNavbarPaywallNavbarLink>
                        ))}

                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            to={{
                                pathname: `/app/convert/${chatIntegrationId}/campaigns`,
                                state: {from: FROM_LOCATION},
                            }}
                        >
                            <span className={cssNavbar['item-name']}>
                                Campaigns
                            </span>
                        </NavbarLink>
                    </div>

                    {isConvertSubscriber ? (
                        <div
                            className={classNames(
                                cssNavbar['link-wrapper'],
                                cssNavbar.isNested
                            )}
                        >
                            <NavbarLink
                                to={{
                                    pathname: `/app/convert/${chatIntegrationId}/click-tracking`,
                                    state: {from: FROM_LOCATION},
                                }}
                            >
                                <span className={cssNavbar['item-name']}>
                                    Click tracking
                                </span>
                            </NavbarLink>
                        </div>
                    ) : (
                        <ConvertNavbarPaywallNavbarLink
                            to={`/app/convert/${chatIntegrationId}/click-tracking/subscribe`}
                            isNested
                        >
                            <span className={cssNavbar['item-name']}>
                                Click tracking
                            </span>
                        </ConvertNavbarPaywallNavbarLink>
                    )}

                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            to={{
                                pathname: `/app/convert/${chatIntegrationId}/installation`,
                                state: {from: FROM_LOCATION},
                            }}
                        >
                            <span className={cssNavbar['item-name']}>
                                Installation
                            </span>
                        </NavbarLink>
                    </div>
                </>
            ) : (
                <div
                    className={classNames(
                        cssNavbar['link-wrapper'],
                        cssNavbar.isNested
                    )}
                >
                    <NavbarLink
                        to={{
                            pathname: `/app/convert/${chatIntegrationId}/setup`,
                            state: {from: FROM_LOCATION},
                        }}
                    >
                        <span className={cssNavbar['item-name']}>Set up</span>
                    </NavbarLink>
                </div>
            )}
        </NavbarSectionBlock>
    )
}

export default ConvertNavbarSectionBlock
