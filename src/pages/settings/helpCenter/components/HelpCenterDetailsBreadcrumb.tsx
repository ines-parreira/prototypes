import React from 'react'

import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { HELP_CENTER_BASE_PATH } from '../constants'

import css from './HelpCenterDetailsBreadcrumb.less'

type Props = {
    helpCenterName: string
}

export const HelpCenterDetailsBreadcrumb: React.FC<Props> = ({
    helpCenterName,
}: Props) => (
    <Breadcrumb className={css.container}>
        <BreadcrumbItem>
            <Link to={HELP_CENTER_BASE_PATH}>Help Center</Link>
        </BreadcrumbItem>
        <BreadcrumbItem className={css.ellipsis}>
            {helpCenterName}
        </BreadcrumbItem>
    </Breadcrumb>
)
