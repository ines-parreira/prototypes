import React from 'react'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {Link} from 'react-router-dom'
import {BILLING_BASE_PATH} from '../constants'

export const generateBreadcrumbs = (
    breadcrumbItems: (JSX.Element | string)[]
) => {
    return (
        <Breadcrumb>
            <BreadcrumbItem>
                <Link className="section" to={BILLING_BASE_PATH}>
                    Billing
                </Link>
            </BreadcrumbItem>
            {breadcrumbItems.map((item, index) => (
                <BreadcrumbItem key={index}>{item}</BreadcrumbItem>
            ))}
        </Breadcrumb>
    )
}
