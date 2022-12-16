import React, {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useTitle from 'hooks/useTitle'
import {getCustomField} from 'models/customField/resources'
import {CustomField} from 'models/customField/types'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'
import EditFieldForm from './components/EditFieldForm'

export default function EditTicketField() {
    const params = useParams<{id: string}>()
    const id = parseInt(params.id, 10)

    const [field, setField] = useState<CustomField>()

    useEffect(() => {
        getCustomField(id)
            .then(setField)
            .catch((e) => {
                console.error('Error loading field', e)
            })
    }, [id])

    useTitle(field?.label)

    // Only show this page if the ticket fields feature flag is on
    const ticketFieldsEnabled = useFlags()[FeatureFlagKey.TicketFields]
    if (!ticketFieldsEnabled) {
        return null
    }

    if (!field) {
        return <Loader />
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/ticket-fields">
                                Ticket fields
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>{field.label}</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container fluid className={css.pageContainer}>
                <div className={css.contentWrapper}>
                    <EditFieldForm field={field} />
                </div>
            </Container>
        </div>
    )
}
