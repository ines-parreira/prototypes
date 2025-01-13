import {CustomFieldConditionField} from '@gorgias/api-types'
import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import useTitle from 'hooks/useTitle'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'
import {CUSTOM_FIELD_CONDITIONS_ROUTE} from 'routes/constants'

import ThenField from './ThenField'

export default function AddConditionalField() {
    const [requirements, setRequirements] = useState<
        CustomFieldConditionField[]
    >([])

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
                <ThenField
                    value={requirements}
                    onChange={setRequirements}
                    error={
                        requirements.length < 1
                            ? 'You must set at least one requirement.'
                            : undefined
                    }
                />
            </div>
        </div>
    )
}
