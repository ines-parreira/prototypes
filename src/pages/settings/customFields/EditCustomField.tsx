import React from 'react'
import {Link, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import useTitle from 'hooks/useTitle'
import {useCustomFieldDefinition} from 'hooks/customField/useCustomFieldDefinition'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'
import {OBJECT_TYPE_SETTINGS} from 'models/customField/constants'
import {
    CustomFieldObjectTypes,
    isCustomFieldAIManagedType,
} from 'models/customField/types'
import {CUSTOM_FIELD_ROUTES} from 'routes/constants'

import EditFieldForm from './components/EditFieldForm'

export default function EditCustomField({
    objectType,
}: {
    objectType: CustomFieldObjectTypes
}) {
    const customFieldTitleLabel = OBJECT_TYPE_SETTINGS[objectType].TITLE_LABEL
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
                            <Link
                                to={`/app/settings/${CUSTOM_FIELD_ROUTES[objectType]}/active`}
                            >
                                {customFieldTitleLabel} fields
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>{field.label}</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <div className={css.pageContainer}>
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
            </div>
        </div>
    )
}
