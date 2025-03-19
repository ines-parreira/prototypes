import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'

type Props = {
    isEdit: boolean
    name: string
}

export const Header = ({ isEdit, name }: Props) => (
    <PageHeader
        title={
            <Breadcrumb>
                <BreadcrumbItem>
                    <Link to="/app/settings/users">Users</Link>
                </BreadcrumbItem>
                <BreadcrumbItem active>
                    {isEdit ? `${name}` : 'New user'}
                </BreadcrumbItem>
            </Breadcrumb>
        }
    />
)
