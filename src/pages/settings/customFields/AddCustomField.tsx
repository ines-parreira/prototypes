import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { OBJECT_TYPE_SETTINGS } from 'custom-fields/constants'
import { CustomFieldObjectTypes } from 'custom-fields/types'
import useTitle from 'hooks/useTitle'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'
import { CUSTOM_FIELD_ROUTES } from 'routes/constants'

import AddFieldForm from './components/AddFieldForm'

export default function AddCustomField({
    objectType,
}: {
    objectType: CustomFieldObjectTypes
}) {
    const customFieldTypeLabel = OBJECT_TYPE_SETTINGS[objectType].LABEL
    const customFieldTypeTitleLabel =
        OBJECT_TYPE_SETTINGS[objectType].TITLE_LABEL
    useTitle(`Create ${customFieldTypeLabel} field`)

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/${CUSTOM_FIELD_ROUTES[objectType]}/active`}
                            >
                                {customFieldTypeTitleLabel} fields
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>New field</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <div className={css.pageContainer}>
                <div className={css.contentWrapper}>
                    <AddFieldForm objectType={objectType} />
                </div>
            </div>
        </div>
    )
}
