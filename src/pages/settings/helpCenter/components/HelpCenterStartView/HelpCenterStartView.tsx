import React, {useEffect, useMemo, useState} from 'react'
import {NavLink, Route, Switch} from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'

import {NotificationStatus} from 'state/notifications/types'
import {changeHelpCenterId} from 'state/ui/helpCenter'
import PageHeader from 'pages/common/components/PageHeader'
import {PRODUCT_BANNER_KEY} from 'hooks/useProductBannerStorage'

import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import Detail from 'pages/integrations/components/Detail'
import {useAbilityChecker} from '../../hooks/useHelpCenterApi'
import {
    HELP_CENTER_MAX_CREATION,
    HELP_CENTER_BASE_PATH,
    HELP_CENTERS_PER_PAGE,
} from '../../constants'
import {useHelpCenterList} from '../../hooks/useHelpCenterList'
import {useStandaloneHelpCenterAfterDismiss} from '../../hooks/useStandaloneHelpCenterAfterDismiss'

import {ABOUT_PAGE} from './constants'
import ManageHelpCenters from './ManageHelpCenters'

export const HelpCenterStartView: React.FC = () => {
    const dispatch = useAppDispatch()
    const {
        isLoading,
        hasMore,
        fetchMore,
        helpCenters: helpCenterList,
    } = useHelpCenterList({
        per_page: HELP_CENTERS_PER_PAGE,
    })

    const standaloneHelpCenters = useStandaloneHelpCenterAfterDismiss(
        helpCenterList,
        PRODUCT_BANNER_KEY.HELP_CENTER_STANDALONE_SSP
    )

    const {isPassingRulesCheck} = useAbilityChecker()

    const [bannerNotificationDismissed, setBannerNotificationDismissed] =
        useState(false)

    const showBanner = useMemo(
        () =>
            !bannerNotificationDismissed &&
            isPassingRulesCheck(({can}) =>
                can('create', 'HelpCenterEntity')
            ) === false,
        [isPassingRulesCheck, bannerNotificationDismissed]
    )

    useEffect(() => {
        dispatch(changeHelpCenterId(null))
    }, [dispatch])

    const isHelpCenterLimitReached =
        helpCenterList.length >= HELP_CENTER_MAX_CREATION

    const {pathManage, pathAbout, navAbout, navManage} = useMemo(() => {
        const isDefaultPageAbout = !isLoading && helpCenterList.length === 0

        const pathAbout = isDefaultPageAbout
            ? [HELP_CENTER_BASE_PATH, `${HELP_CENTER_BASE_PATH}/about`]
            : `${HELP_CENTER_BASE_PATH}/about`
        const pathManage = isDefaultPageAbout
            ? `${HELP_CENTER_BASE_PATH}/manage`
            : [HELP_CENTER_BASE_PATH, `${HELP_CENTER_BASE_PATH}/manage`]

        const navAbout = `${HELP_CENTER_BASE_PATH}${
            isDefaultPageAbout ? '' : '/about'
        }`
        const navManage = `${HELP_CENTER_BASE_PATH}${
            isDefaultPageAbout ? '/manage' : ''
        }`

        return {
            pathManage,
            pathAbout,
            navAbout,
            navManage,
        }
    }, [helpCenterList, isLoading])

    return (
        <div className="full-width">
            <PageHeader title="Help Center" />
            <SecondaryNavbar>
                <NavLink exact to={navAbout}>
                    About
                </NavLink>
                <NavLink exact to={navManage}>
                    Manage
                </NavLink>
            </SecondaryNavbar>
            {showBanner && (
                <BannerNotification
                    status={NotificationStatus.Warning}
                    showIcon
                    closable
                    onClose={() => {
                        setBannerNotificationDismissed(true)
                    }}
                    message="Limited access. Based on your role permissions you can
                        access Help Centers in read-only mode. Reach out to your
                        Admin if you need read & write access."
                />
            )}

            <Switch>
                <Route exact path={pathManage}>
                    <ManageHelpCenters
                        helpCenterList={helpCenterList}
                        standaloneHelpCenters={standaloneHelpCenters}
                        isLoading={isLoading}
                        isHelpCenterLimitReached={isHelpCenterLimitReached}
                        hasMore={hasMore}
                        fetchMore={fetchMore}
                        isButtonDisabled={
                            isPassingRulesCheck(({can}) =>
                                can('create', 'HelpCenterEntity')
                            )
                                ? isHelpCenterLimitReached
                                : true
                        }
                    />
                </Route>
                <Route exact path={pathAbout}>
                    <Detail
                        {...ABOUT_PAGE}
                        connectUrl={`${location.origin}${HELP_CENTER_BASE_PATH}/new`}
                    />
                </Route>
            </Switch>
        </div>
    )
}

export default HelpCenterStartView
