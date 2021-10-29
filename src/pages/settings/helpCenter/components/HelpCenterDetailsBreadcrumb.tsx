import React from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {HELP_CENTER_BASE_PATH} from '../constants'

type Props = {
    helpCenterName: string
    activeLabel: string
}

export const HelpCenterDetailsBreadcrumb: React.FC<Props> = ({
    activeLabel,
    helpCenterName,
}: Props) => (
    <Breadcrumb>
        <BreadcrumbItem>
            <Link to={HELP_CENTER_BASE_PATH}>Help Center</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>{helpCenterName}</BreadcrumbItem>
        <BreadcrumbItem active>{activeLabel}</BreadcrumbItem>
    </Breadcrumb>
)
