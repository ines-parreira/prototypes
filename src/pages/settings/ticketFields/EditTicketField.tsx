import React from 'react'
import {Link, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'

import useTitle from 'hooks/useTitle'
import {useCustomFieldDefinition} from 'hooks/customField/useCustomFieldDefinition'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {isCustomFieldAIManagedType} from 'models/customField/types'
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
                    {Boolean(field.managed_type) && (
                        <Alert icon type={AlertType.Info} className="mb-4">
                            {isCustomFieldAIManagedType(field.managed_type) ? (
                                <>
                                    This field is managed by Gorgias AI Agent
                                    and cannot be edited
                                </>
                            ) : (
                                <>
                                    Use this field to gain actionable insights
                                    into customer inquiry trends.
                                    {field.managed_type === 'contact_reason'
                                        ? 'This field is powered by AI and can automatically be filled by Gorgias, '
                                        : 'For more details, '}
                                    <a
                                        href="https://docs.gorgias.com/en-US/273001-a7d86899ce5f4aef81ebbaa301d78b58"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        see this article
                                    </a>
                                </>
                            )}
                            .
                        </Alert>
                    )}
                    <EditFieldForm field={field} />
                </div>
            </Container>
        </div>
    )
}
