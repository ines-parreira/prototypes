import React from 'react'
import {Breadcrumb, BreadcrumbItem, Container, Row, Col} from 'reactstrap'
import {Link} from 'react-router-dom'

import {getHasAutomationAddOn} from 'state/billing/selectors'
import useAppSelector from 'hooks/useAppSelector'
import PageHeader from 'pages/common/components/PageHeader'
import settingsCss from 'pages/settings/settings.less'
import SelfServicePreferencesNavbar from 'pages/settings/selfService/components/SelfServicePreferencesNavbar'
import {GorgiasChatIntegrationSelfServicePaywall} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import {useConfigurationData} from 'pages/settings/selfService/components/hooks'

import css from '../QuickResponseFlowItem/QuickResponseFlowItem.less'
import SelfServicePreview from './components/SelfServicePreview'
import QuickResponseList from './components/QuickResponseList'

const QuickResponseFlowsPreferences = () => {
    const {integration} = useConfigurationData()

    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

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
                    <Col data-testid="configurationColumn">
                        <h4>Quick Response Flows</h4>
                        <p>
                            Display up to 4 quick response flows sending a
                            prefilled chat message when shoppers click on it.
                            You can then{' '}
                            <Link to="/app/settings/rules/new">
                                create a rule
                            </Link>{' '}
                            that will send additional automated responses to
                            customers.{' '}
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

                    <Col data-testid="previewColumn">
                        <div className={css.preview}>
                            <SelfServicePreview />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default QuickResponseFlowsPreferences
