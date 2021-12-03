import {Badge, Col, Container, Row} from 'reactstrap'
import React, {useState} from 'react'
import {useSelector} from 'react-redux'

import {getIconFromUrl} from '../../../../../state/integrations/helpers'
import AutomationSubscriptionModal from '../../../../settings/billing/automation/AutomationSubscriptionModal'
import UpgradeButton from '../../../../common/components/UpgradeButton'
import {SegmentEvent} from '../../../../../store/middlewares/types/segmentTracker'
import {RootState} from '../../../../../state/types'
import {CurrentAccountState} from '../../../../../state/currentAccount/types'
import {getCurrentAccountState} from '../../../../../state/currentAccount/selectors'
import {getCurrentPlan} from '../../../../../state/billing/selectors'

import css from './GorgiasChatIntegrationSelfServicePaywall.less'

const sspAutomationAddonMock = getIconFromUrl(
    'paywalls/screens/gorgias_chat_ssp_automation.png'
)

export const GorgiasChatIntegrationSelfServicePaywall = () => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
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

    return (
        <Container
            fluid
            className="page-container"
            style={{
                paddingLeft: 0,
            }}
        >
            <Row>
                <Col>
                    <img
                        src={sspAutomationAddonMock}
                        width="100%"
                        height="90%"
                        style={{
                            maxWidth: '1000px',
                        }}
                        alt="Self-service Automation Add-on Mock"
                    />
                </Col>
                <Col>
                    <div className={css.content}>
                        <Badge className={css.badge}>AUTOMATION ADD-ON</Badge>
                        <h1 className={css.contentTitle}>
                            Leverage the power of Self-service
                        </h1>
                        <div className={css.description}>
                            <p>
                                Let your customers{' '}
                                <b>track their orders on their own</b>, request
                                to <b>cancel</b> or <b>return</b> them and{' '}
                                <b>tell you more</b> about them at their
                                convenience. <br />
                            </p>
                        </div>
                        <UpgradeButton
                            label="Get Automation Features"
                            onClick={() => {
                                setIsAutomationModalOpened(true)
                            }}
                            segmentEventToSend={segmentEventToSend}
                        />
                        <AutomationSubscriptionModal
                            confirmLabel="Confirm"
                            isOpen={isAutomationModalOpened}
                            onClose={() => setIsAutomationModalOpened(false)}
                        />
                    </div>
                </Col>
            </Row>
        </Container>
    )
}
