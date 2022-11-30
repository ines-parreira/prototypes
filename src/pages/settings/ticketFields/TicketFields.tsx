import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {FeatureFlagKey} from 'config/featureFlags'
import PageHeader from 'pages/common/components/PageHeader'
import EmptyView from './components/EmptyView'

export default function TicketFields() {
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
                        <BreadcrumbItem active>Ticket fields</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <EmptyView
                title="Get started with Ticket Fields"
                button="Create Field"
                onClick={() => {
                    /* no-op */
                }}
            >
                <p>
                    Set up custom fields to make sure your team handle tickets
                    efficiently and consistently. You can create a custom field
                    to track the contact reason, product or even the resolution
                    provided in the ticket.
                </p>
            </EmptyView>
        </div>
    )
}
