import {Tooltip} from '@gorgias/merchant-ui-kit'
import React, {useEffect, useMemo, useState} from 'react'
import {Link, NavLink, Route, Switch, useHistory} from 'react-router-dom'

import {AlertBanner, AlertBannerTypes} from 'AlertBanners'
import useAppDispatch from 'hooks/useAppDispatch'
import {PRODUCT_BANNER_KEY} from 'hooks/useProductBannerStorage'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import Detail from 'pages/common/components/ProductDetail'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {changeHelpCenterId} from 'state/ui/helpCenter'

import {
    HELP_CENTER_MAX_CREATION,
    HELP_CENTER_BASE_PATH,
    HELP_CENTERS_PER_PAGE,
} from '../../constants'
import {useAbilityChecker} from '../../hooks/useHelpCenterApi'
import {useHelpCenterList} from '../../hooks/useHelpCenterList'
import {useStandaloneHelpCenterAfterDismiss} from '../../hooks/useStandaloneHelpCenterAfterDismiss'

import {ABOUT_PAGE} from './constants'
import css from './HelpCenterStartView.less'
import ManageHelpCenters from './ManageHelpCenters'

const HelpCenterStartView: React.FC = () => {
    const dispatch = useAppDispatch()
    const {
        isLoading,
        hasMore,
        fetchMore,
        helpCenters: helpCenterList,
    } = useHelpCenterList({
        per_page: HELP_CENTERS_PER_PAGE,
        type: 'faq',
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

    const history = useHistory()
    const handleAddHelpCenter = () =>
        history.push(`${HELP_CENTER_BASE_PATH}/new`)

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

    const detailsProps = {...ABOUT_PAGE}
    detailsProps.infocard.CTA = (
        <Link to={`${HELP_CENTER_BASE_PATH}/new`}>
            <Button className="full-width">Create Help Center</Button>
        </Link>
    )

    return (
        <div className="full-width">
            <PageHeader title="Help Center">
                {isLoading || helpCenterList.length <= 0 ? null : (
                    <Route exact path={pathManage}>
                        <Button
                            id="add-new-help-center-button"
                            isDisabled={
                                isPassingRulesCheck(({can}) =>
                                    can('create', 'HelpCenterEntity')
                                )
                                    ? isHelpCenterLimitReached
                                    : true
                            }
                            onClick={handleAddHelpCenter}
                        >
                            <div className={css.createNewButton}>
                                Create Help Center
                            </div>
                        </Button>
                        <Tooltip
                            disabled={!isHelpCenterLimitReached}
                            placement="top-start"
                            target="add-new-help-center-button"
                            innerProps={{
                                style: {
                                    textAlign: 'start',
                                    width: 180,
                                },
                            }}
                        >
                            Please contact us to create more Help Centers.
                        </Tooltip>
                    </Route>
                )}
            </PageHeader>
            <SecondaryNavbar>
                <NavLink exact to={navAbout}>
                    About
                </NavLink>
                <NavLink exact to={navManage}>
                    Manage
                </NavLink>
            </SecondaryNavbar>
            {showBanner && (
                <AlertBanner
                    type={AlertBannerTypes.Warning}
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
                    <Detail {...detailsProps} />
                </Route>
            </Switch>
        </div>
    )
}

export default HelpCenterStartView
