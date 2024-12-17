import React from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import useTitle from 'hooks/useTitle'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'
import {CUSTOM_FIELD_CONDITIONS_ROUTE} from 'routes/constants'

export default function AddConditionalField() {
    useTitle(`Create condition`)

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
                        <BreadcrumbItem active>Create condition</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <div className={css.pageContainer}>
                <div className={css.contentWrapper}></div>
            </div>
        </div>
    )
}
