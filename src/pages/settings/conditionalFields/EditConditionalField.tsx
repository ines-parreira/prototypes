import React from 'react'
import {Link, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import useTitle from 'hooks/useTitle'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'
import {CUSTOM_FIELD_CONDITIONS_ROUTE} from 'routes/constants'

export default function EditConditionalField() {
    const params = useParams<{id: string}>()
    const id = parseInt(params.id, 10)

    const condition = {
        label: 'Condition',
    }
    const isLoading = false

    useTitle(condition?.label)

    if (isLoading || !condition) {
        return <Loader />
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}/`}
                            >
                                Field Conditions
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {condition.label} {id}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <div className={css.pageContainer}>
                <div className={css.contentWrapper}></div>
            </div>
        </div>
    )
}
