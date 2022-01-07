import React from 'react'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {Link} from 'react-router-dom'
import PageHeader from 'pages/common/components/PageHeader'
import PhoneNumberCreateForm from 'pages/phoneNumbers/PhoneNumberCreateForm'

import css from 'pages/settings/settings.less'

export function PhoneNumberCreateContainer() {
    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/phone-numbers">
                                Phone Numbers
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Create Phone Number
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container fluid className={css.pageContainer}>
                <PhoneNumberCreateForm />
            </Container>
        </div>
    )
}

export default PhoneNumberCreateContainer
