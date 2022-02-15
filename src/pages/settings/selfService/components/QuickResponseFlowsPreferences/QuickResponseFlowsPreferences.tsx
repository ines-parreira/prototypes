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
import QuickResponsesList from './components/QuickResponsesList'

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
                            Create up to 4 quick response flows that when
                            clicked by the shopper, it'll send an automated
                            message with the answer. Create rules that will send
                            a response to your customer. Read more
                        </p>

                        <QuickResponsesList />
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
