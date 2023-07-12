import React from 'react'
import {Link, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'

import useTitle from 'hooks/useTitle'
import {useCustomFieldDefinition} from 'hooks/customField/useCustomFieldDefinition'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'

import Alert, {AlertType} from '../../common/components/Alert/Alert'
import EditFieldForm from './components/EditFieldForm'

export default function EditTicketField() {
    const params = useParams<{id: string}>()
    const id = parseInt(params.id, 10)

    const {data: field, isLoading} = useCustomFieldDefinition(id)

    useTitle(field?.label)

    if (isLoading || !field) {
        return <Loader />
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
                        <BreadcrumbItem active>{field.label}</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container fluid className={css.pageContainer}>
                <div className={css.contentWrapper}>
                    {!!field.managed_type && (
                        <Alert icon type={AlertType.Info} className="mb-4">
                            Utilize this field to gain actionable insights into
                            customer inquiry trends.{' '}
                            {field.managed_type === 'contact_reason' &&
                                'We are developing an AI model that will eventually pre-fill this field for you. '}
                            For more details,{' '}
                            <a
                                href="https://docs.gorgias.com/en-US/273001-a7d86899ce5f4aef81ebbaa301d78b58"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                see this article
                            </a>
                            .
                        </Alert>
                    )}
                    <EditFieldForm field={field} />
                </div>
            </Container>
        </div>
    )
}
