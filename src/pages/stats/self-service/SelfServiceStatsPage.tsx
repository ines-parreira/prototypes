import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {Badge} from 'reactstrap'
import classNames from 'classnames'
import {useAsyncFn} from 'react-use'

import {fetchSelfServiceConfigurations} from '../../../models/selfServiceConfiguration/resources'
import useAppDispatch from '../../../hooks/useAppDispatch'
import {selfServiceConfigurationsFetched} from '../../../state/entities/selfServiceConfigurations/actions'
import {notify} from '../../../state/notifications/actions'
import {NotificationStatus} from '../../../state/notifications/types'
import Loader from '../../common/components/Loader/Loader'
import {
    currentAccountHasFeature,
    getCurrentAccountState,
} from '../../../state/currentAccount/selectors'
import {
    AccountFeature,
    CurrentAccountState,
} from '../../../state/currentAccount/types'
import UpgradeButton from '../../common/components/UpgradeButton'
import CirclePaywall from '../../common/components/CirclePaywall/CirclePaywall'
import DEPRECATED_StatsFilters from '../DEPRECATED_StatsFilters'
import DEPRECATED_Stats from '../DEPRECATED_Stats'
import AutomationSubscriptionModal from '../../settings/billing/automation/AutomationSubscriptionModal'
import {RootState} from '../../../state/types'
import {getCurrentPlan} from '../../../state/billing/selectors'
import {SegmentEvent} from '../../../store/middlewares/types/segmentTracker'
import PageHeader from '../../common/components/PageHeader'
import StatsTitleWithPopOver from '../common/components/StatsTitleWithPopOver'
import {automationViews} from '../../../config/stats'

import css from './SelfServiceStatsPage.less'

export const SelfServiceStatsPage = (): JSX.Element => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const dispatch = useAppDispatch()
    const hasSelfServiceStatisticsFeature = useSelector(
        currentAccountHasFeature(AccountFeature.AutomationSelfServiceStatistics)
    )
    const account = useSelector<RootState, CurrentAccountState>(
        getCurrentAccountState
    )
    const currentPlan = useSelector(getCurrentPlan)

    const segmentEventToSend = {
        name: SegmentEvent.PaywallUpgradeButtonSelected,
        props: {
            domain: account.get('domain'),
            current_plan: currentPlan.get('id'),
            paywall_feature: 'automation_addon',
        },
    }
    const [{loading}, retrieveSelfServiceConfigurations] =
        useAsyncFn(async () => {
            try {
                const res = await fetchSelfServiceConfigurations()
                void dispatch(selfServiceConfigurationsFetched(res.data))
            } catch (error) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'Could not fetch Self-service configurations, please try again later.',
                    })
                )
            }
        }, [])

    useEffect(() => {
        void (async () => {
            await retrieveSelfServiceConfigurations()
        })()
    }, [retrieveSelfServiceConfigurations])

    if (loading) {
        return <Loader />
    } else if (!hasSelfServiceStatisticsFeature) {
        return (
            <CirclePaywall
                feature={AccountFeature.AutomationSelfServiceStatistics}
                pageHeader={
                    <PageHeader
                        title={
                            <StatsTitleWithPopOver
                                config={automationViews.get('self-service')}
                            />
                        }
                    />
                }
                badge={<Badge className={css.badge}>AUTOMATION ADD-ON</Badge>}
                ctaButton={
                    <UpgradeButton
                        onClick={() => {
                            setIsAutomationModalOpened(true)
                        }}
                        label="Get Automation Features"
                        segmentEventToSend={segmentEventToSend}
                    />
                }
                modale={
                    <AutomationSubscriptionModal
                        confirmLabel="Confirm"
                        isOpen={isAutomationModalOpened}
                        onClose={() => setIsAutomationModalOpened(false)}
                    />
                }
            />
        )
    }

    return (
        <div className={classNames('full-width', css.wrapper)}>
            <div className={css.filtersWrapper}>
                <DEPRECATED_StatsFilters />
            </div>
            <div className={css.statsWrapper}>
                <DEPRECATED_Stats />
            </div>
        </div>
    )
}
export default SelfServiceStatsPage
