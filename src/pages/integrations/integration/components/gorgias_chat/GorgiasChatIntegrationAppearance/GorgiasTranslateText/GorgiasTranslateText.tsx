import {Map} from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'

import {getHasAutomationAddOn} from 'state/billing/selectors'
import {RootState} from 'state/types'
import {GORGIAS_CHAT_INTEGRATION_TYPE} from 'constants/integration'

import ArrowBackwardIcon from 'assets/img/icons/arrow-backward.svg'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import PageHeader from 'pages/common/components/PageHeader'
import {IntegrationType} from '../../../../../../../models/integration/types'
import * as integrationSelectors from '../../../../../../../state/integrations/selectors'
import GorgiasChatIntegrationNavigation from '../../GorgiasChatIntegrationNavigation'
import css from './GorgiasTranslateText.less'

type OwnProps = {
    integration: Map<any, any>
    // actions: {}
}

const mapStateToProps = (state: RootState) => {
    return {
        domain: state.currentAccount.get('domain'),
        hasAutomationAddOn: getHasAutomationAddOn(state),
        getIntegrationsByTypes:
            integrationSelectors.makeGetIntegrationsByTypes(state),
        gorgiasChatExtraState:
            integrationSelectors.getIntegrationTypeExtraState(
                GORGIAS_CHAT_INTEGRATION_TYPE as IntegrationType
            )(state),
    }
}
const mapDispatchToProps = {}

function GorgiasTranslateText({
    integration,
}: OwnProps & ReturnType<typeof mapStateToProps>) {
    const backLink = (
        <div className={css.backWrapper}>
            <Link
                to={`/app/settings/channels/gorgias_chat/${
                    integration.get('id') as number
                }/appearance`}
                className="d-flex"
            >
                <img src={ArrowBackwardIcon} alt="Back to Appearance" />
                Back to Appearance
            </Link>
        </div>
    )

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/channels/${IntegrationType.GorgiasChat}`}
                            >
                                Chat
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.get('name')}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <GorgiasChatIntegrationNavigation integration={integration} />

            <Container fluid className={css.pageContainer}>
                <Row>
                    <Col className={css.pageColumn} md="8">
                        {backLink}

                        <Alert className="mb-4" type={AlertType.Warning} icon>
                            <div>Will be available soon.</div>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GorgiasTranslateText)
