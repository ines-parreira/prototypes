import React from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useTitle from 'hooks/useTitle'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'
import AddFieldForm from './components/AddFieldForm'

export default function AddTicketField() {
    useTitle('Create ticket field')

    // Only show this page if the ticket fields feature flag is on
    const ticketFieldsEnabled = useFlags()[FeatureFlagKey.TicketFields]
    if (!ticketFieldsEnabled) {
        return null
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/ticket-fields/active">
                                Ticket fields
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Add field</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container fluid className={css.pageContainer}>
                <div className={css.contentWrapper}>
                    <AddFieldForm objectType="Ticket" />
                </div>
            </Container>
        </div>
    )
}
