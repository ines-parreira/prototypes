import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import classnames from 'classnames'

import {Button} from 'reactstrap'

import UpgradeButton from '../common/components/UpgradeButton'
import {
    getCurrentPlan,
    getHasAutomationAddOn,
} from '../../state/billing/selectors'
import AutomationSubscriptionModal from '../settings/billing/automation/AutomationSubscriptionModal'

import {getSelfServiceConfigurations} from '../../state/entities/selfServiceConfigurations/selectors'

import {RootState} from '../../state/types'
import {CurrentAccountState} from '../../state/currentAccount/types'
import {getCurrentAccountState} from '../../state/currentAccount/selectors'
import {SegmentEvent} from '../../store/middlewares/types/segmentTracker'

import css from './common/components/charts/KeyMetricStat/KeyMetricStat.less'
import statsCss from './StatsPage.less'

export const AutomationAddOnStatsButton = () => {
    const selfServiceConfigurations = useSelector(getSelfServiceConfigurations)
    const hasAutomationAddOn = useSelector(getHasAutomationAddOn)
    const account = useSelector<RootState, CurrentAccountState>(
        getCurrentAccountState
    )
    const currentPlan = useSelector(getCurrentPlan)

    const [isAutomationModalOpened, setIsAutomationModalOpened] = useState(
        false
    )

    const segmentEventToSend = {
        name: SegmentEvent.PaywallUpgradeButtonSelected,
        props: {
            domain: account.get('domain'),
            current_plan: currentPlan.get('id'),
            paywall_feature: 'automation_addon',
        },
    }

    if (hasAutomationAddOn) {
        const activeSelfServiceConfigurations = selfServiceConfigurations.filter(
            (selfServiceConfiguration) => {
                return !selfServiceConfiguration.deactivated_datetime
            }
        )

        if (!activeSelfServiceConfigurations.length) {
            return (
                <div className={css.metric}>
                    <div className={css.label}>
                        Automated via self service
                        <div className={classnames('mt-3', css.statsDisplay)}>
                            <Button className={statsCss.setupSelfServiceButton}>
                                <a
                                    href="/app/settings/self-service"
                                    className={statsCss.label}
                                >
                                    Setup Self-Service
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return null
    }

    return (
        <>
            <AutomationSubscriptionModal
                confirmLabel="Confirm"
                isOpen={isAutomationModalOpened}
                onClose={() => setIsAutomationModalOpened(false)}
            />
            <div className={css.metric}>
                <div className={css.label}>Get access to more automations</div>
                <div className={classnames('mt-3', css.childContent)}>
                    <UpgradeButton
                        label="Get Automation Features"
                        onClick={() => {
                            setIsAutomationModalOpened(true)
                        }}
                        segmentEventToSend={segmentEventToSend}
                    />
                </div>
            </div>
        </>
    )
}
