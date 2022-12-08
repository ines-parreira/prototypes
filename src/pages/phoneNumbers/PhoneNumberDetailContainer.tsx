import React from 'react'

import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import {Link, withRouter, RouteComponentProps} from 'react-router-dom'
import {get} from 'lodash'
import ReactCountryFlag from 'react-country-flag'

import {RootState} from 'state/types'
import {getPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import PageHeader from 'pages/common/components/PageHeader'
import PhoneNumberDetails from 'pages/phoneNumbers/PhoneNumberDetails'

import css from 'pages/settings/settings.less'
import {isNewPhoneNumber} from './utils'

export function PhoneNumberDetailContainer({
    phoneNumber,
}: ConnectedProps<typeof connector>) {
    if (isNewPhoneNumber(phoneNumber)) {
        return null
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/phone-numbers">
                                Phone numbers
                            </Link>
                        </BreadcrumbItem>
                        {phoneNumber && (
                            <BreadcrumbItem active>
                                <ReactCountryFlag
                                    countryCode={phoneNumber.meta?.country}
                                />
                                &nbsp;
                                {phoneNumber.name}
                                &nbsp;
                                <small className="text-muted ml-2">
                                    {phoneNumber.meta?.friendly_name}
                                </small>
                            </BreadcrumbItem>
                        )}
                    </Breadcrumb>
                }
            />
            <Container fluid className={css.pageContainer}>
                {phoneNumber && (
                    <PhoneNumberDetails phoneNumber={phoneNumber} />
                )}
            </Container>
        </div>
    )
}

const connector = connect((state: RootState, ownProps: RouteComponentProps) => {
    return {
        phoneNumber: getPhoneNumber(
            get(ownProps.match.params, 'phoneNumberId')
        )(state),
    }
})

export default withRouter(connector(PhoneNumberDetailContainer))
