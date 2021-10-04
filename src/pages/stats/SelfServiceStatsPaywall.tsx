import {Badge, Col, Container, Row} from 'reactstrap'
import React from 'react'

import {getIconFromUrl} from '../../state/integrations/helpers'

import UpgradeButton from '../common/components/UpgradeButton'

import css from './SelfServiceStatsPaywall.less'

const sspStatsAddonMock = getIconFromUrl('paywalls/screens/chat_stats.png')

export const SelfServiceStatsPaywall = () => {
    return (
        <Container fluid className="page-container">
            <Row>
                <Col>
                    <img
                        className={css.statsMock}
                        src={sspStatsAddonMock}
                        width="800px"
                        height="780px"
                        alt="Self-service Stats Automation Add-on Mock"
                    />
                </Col>
                <Col>
                    <div className={css.content}>
                        <Badge className={css.badge}>AUTOMATION ADD-ON</Badge>
                        <h1 className={css.contentTitle}>
                            Track Self-service's interactions
                        </h1>
                        <div className={css.description}>
                            <p>
                                See the number of your customers’ interactions
                                passing through <b>Self-service</b>, how many of
                                these interactions you are <b>automating</b>,
                                and the <b>time saved for you team!</b>
                            </p>
                        </div>
                        <UpgradeButton label="Get Automation Features" />
                    </div>
                </Col>
            </Row>
        </Container>
    )
}
