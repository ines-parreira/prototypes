import React from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {isEmpty} from 'lodash'

import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import history from 'pages/history'
import PhoneIntegrationsList from 'pages/integrations/integration/components/phone/PhoneIntegrationsList'
import useAppSelector from 'hooks/useAppSelector'

import css from 'pages/settings/settings.less'

export function SmsIntegrationsListContainer(): JSX.Element {
    const integrations = useAppSelector(
        getIntegrationsByTypes([IntegrationType.Sms])
    )?.toJS()

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <>
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    Integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>SMS</BreadcrumbItem>
                        </Breadcrumb>
                        <Button
                            onClick={() =>
                                history.push(
                                    '/app/settings/integrations/sms/new'
                                )
                            }
                        >
                            Add SMS Integration
                        </Button>
                    </>
                }
            />
            <Container
                data-candu-id="integration-list-top"
                fluid
                className={css.pageContainer}
            >
                Chat with your customers via SMS from Gorgias.
                {isEmpty(integrations) && (
                    <div className="mt-3">
                        You don't have any SMS integrations at the moment.
                    </div>
                )}
            </Container>
            <PhoneIntegrationsList type={IntegrationType.Sms} />
            <Container fluid data-candu-id="integration-list-bottom" />
        </div>
    )
}

export default SmsIntegrationsListContainer
