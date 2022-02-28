import React from 'react'
import {useSelector} from 'react-redux'

import {Breadcrumb, BreadcrumbItem, Container, Row, Col} from 'reactstrap'
import {Link} from 'react-router-dom'
import {getHasAutomationAddOn} from '../../../../../state/billing/selectors'

import PageHeader from '../../../../common/components/PageHeader'
import settingsCss from '../../../settings.less'
import SelfServicePreferencesNavbar from '../SelfServicePreferencesNavbar'

import {GorgiasChatIntegrationSelfServicePaywall} from '../../../../integrations/detail/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'

import {useConfigurationData} from '../hooks'

import SelfServicePreview from './components/SelfServicePreview'
import QuickResponseList from './components/QuickResponseList'

const QuickResponseFlowsPreferences = () => {
    const {integration} = useConfigurationData()

    const hasAutomationAddOn = useSelector(getHasAutomationAddOn)

    if (!hasAutomationAddOn) {
        return <GorgiasChatIntegrationSelfServicePaywall />
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/self-service">
                                Self-service
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {integration.getIn(['meta', 'shop_name'])}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <SelfServicePreferencesNavbar />

            <Container fluid className={settingsCss.pageContainer}>
                <Row>
                    <Col>
                        <h4>Quick Response Flows</h4>
                        <p>
                            Add up to 4 flows that create and send a pre-filled
                            chat message when shoppers click on it. Reply by{' '}
                            <Link to="/app/settings/rules/new">
                                creating rules
                            </Link>{' '}
                            that will send an automated response to your
                            customer.{' '}
                            <a
                                href="https://docs.gorgias.com/self-service/custom-self-service-flows"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Read more
                            </a>
                        </p>

                        <QuickResponseList />
                    </Col>

                    <Col>
                        <SelfServicePreview />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default QuickResponseFlowsPreferences
