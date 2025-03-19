import { Link, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { useGetCustomFieldCondition } from '@gorgias/api-queries'

import useTitle from 'hooks/useTitle'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'
import { CUSTOM_FIELD_CONDITIONS_ROUTE } from 'routes/constants'

import ConditionForm from './components/ConditionForm'

export default function ConditionalField() {
    const params = useParams<{ id: string }>()
    const isNewCondition = params.id === 'add'
    const conditionId = isNewCondition ? null : Number.parseInt(params.id, 10)

    const { data: condition, isLoading } = useGetCustomFieldCondition(
        conditionId ?? 0,
        {
            query: {
                select: (data) => data?.data,
                enabled: !isNewCondition,
            },
        },
    )

    useTitle(isNewCondition ? 'Create condition' : condition?.name)

    if (!isNewCondition && isLoading) {
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
                            {isNewCondition
                                ? 'Create condition'
                                : condition?.name}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <div className={css.pageContainer}>
                <ConditionForm condition={condition} />
            </div>
        </div>
    )
}
