import React, {ComponentProps, useEffect, useState} from 'react'
import classnames from 'classnames'
import {useAsyncFn} from 'react-use'

import {getSelfServiceConfigurations} from 'state/entities/selfServiceConfigurations/selectors'
import {
    getCurrentHelpdeskProduct,
    getHasAutomationAddOn,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {SegmentEvent} from 'store/middlewares/segmentTracker'
import AutomationSubscriptionModal from 'pages/settings/billing/automation/AutomationSubscriptionModal'
import Button from 'pages/common/components/button/Button'
import history from 'pages/history'
import {fetchSelfServiceConfigurations} from 'models/selfServiceConfiguration/resources'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {selfServiceConfigurationsFetched} from 'state/entities/selfServiceConfigurations/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import Loader from 'pages/common/components/Loader/Loader'
import AutomationSubscriptionButton from 'pages/settings/billing/automation/AutomationSubscriptionButton'

import {KeyMetricCell} from './common/components/charts/KeyMetricStat/KeyMetricCell'
import KeyMetricCellWrapper from './common/components/charts/KeyMetricStat/KeyMetricCellWrapper'
import css from './AutomationStatsSelfServiceMetric.less'

export const AutomationStatsSelfServiceMetric = ({
    id,
    ...props
}: ComponentProps<typeof KeyMetricCell>) => {
    const dispatch = useAppDispatch()
    const selfServiceConfigurations = useAppSelector(
        getSelfServiceConfigurations
    )
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const hasAutomationLegacy = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )
    const hasAccessToSelfService = hasAutomationLegacy || hasAutomationAddOn

    const account = useAppSelector(getCurrentAccountState)
    const currentHelpdeskPrice = useAppSelector(getCurrentHelpdeskProduct)

    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)

    const hasSelfServiceSetup = selfServiceConfigurations.some(
        (conf) => !conf.deactivated_datetime
    )

    const [{loading}, getConfigurations] = useAsyncFn(async () => {
        if (!hasSelfServiceSetup) {
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
        }
    }, [])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => void getConfigurations(), [])

    const segmentEventToSend = {
        name: SegmentEvent.PaywallUpgradeButtonSelected,
        props: {
            domain: account.get('domain'),
            current_plan: currentHelpdeskPrice?.price_id,
            paywall_feature: 'automation_addon',
        },
    }

    const goToSelfServiceSettings = () =>
        history.push('/app/settings/self-service')

    const configurationLoader = () => {
        return (
            <KeyMetricCellWrapper label="Automated via self-service">
                <Loader minHeight="90px" size="20px" />
            </KeyMetricCellWrapper>
        )
    }

    const automationAddonPaywall = () => {
        return (
            <>
                <AutomationSubscriptionModal
                    confirmLabel="Confirm"
                    isOpen={isAutomationModalOpened}
                    onClose={() => setIsAutomationModalOpened(false)}
                />
                <KeyMetricCellWrapper
                    label="Get access to more automations"
                    tooltipId={`title-${id}`}
                >
                    <div className={classnames('mt-3', css.button)}>
                        <AutomationSubscriptionButton
                            label="Get Automation Features"
                            onClick={() => {
                                setIsAutomationModalOpened(true)
                            }}
                            segmentEventToSend={segmentEventToSend}
                        />
                    </div>
                </KeyMetricCellWrapper>
            </>
        )
    }
    const setupSelfServiceButton = () => {
        return (
            <KeyMetricCellWrapper
                label="Automated via self-service"
                tooltipId={`title-${id}`}
            >
                <div className={classnames('mt-3', css.button)}>
                    <Button onClick={goToSelfServiceSettings}>
                        Setup Self-Service
                    </Button>
                </div>
            </KeyMetricCellWrapper>
        )
    }

    return (
        <>
            {hasAccessToSelfService &&
                (loading ? (
                    configurationLoader()
                ) : !hasSelfServiceSetup ? (
                    setupSelfServiceButton()
                ) : (
                    <KeyMetricCell id={id} {...props} />
                ))}
            {!hasAutomationAddOn && automationAddonPaywall()}
        </>
    )
}
