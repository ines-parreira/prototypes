import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'

import SettingsContent from '../SettingsContent'
import SettingsPageContainer from '../SettingsPageContainer'
import { BUSINESS_HOURS_BASE_URL } from './constants'
import EditCustomBusinessHoursForm from './EditCustomBusinessHoursForm'

export default function EditCustomBusinessHoursPage() {
    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to={BUSINESS_HOURS_BASE_URL}>
                                Business hours
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Edit custom business hours
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <SettingsPageContainer>
                <SettingsContent>
                    <EditCustomBusinessHoursForm />
                </SettingsContent>
            </SettingsPageContainer>
        </div>
    )
}
