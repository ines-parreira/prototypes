import React, {useEffect} from 'react'

import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import {
    Link,
    withRouter,
    useParams,
    RouteComponentProps,
} from 'react-router-dom'
import {useAsyncFn} from 'react-use'
import {get} from 'lodash'
import ReactCountryFlag from 'react-country-flag'

import {fetchPhoneNumber} from 'models/phoneNumber/resources'
import {RootState} from 'state/types'
import {phoneNumberFetched} from 'state/entities/phoneNumbers/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import PageHeader from 'pages/common/components/PageHeader'
import useAppDispatch from 'hooks/useAppDispatch'
import PhoneNumberDetails from 'pages/phoneNumbers/PhoneNumberDetails'

import css from 'pages/settings/settings.less'

export function PhoneNumberDetailContainer({
    phoneNumber,
}: ConnectedProps<typeof connector>) {
    const dispatch = useAppDispatch()
    const {phoneNumberId} = useParams<{phoneNumberId?: string}>()
    const [, handleFetchPhoneNumber] = useAsyncFn(async (id) => {
        try {
            const phoneNumber = await fetchPhoneNumber(id)
            dispatch(phoneNumberFetched(phoneNumber))
        } catch (error) {
            void dispatch(
                notify({
                    message: 'Failed to fetch phone numbers',
                    status: NotificationStatus.Error,
                })
            )
        }
    })

    useEffect(() => {
        void handleFetchPhoneNumber(phoneNumberId)
    }, [handleFetchPhoneNumber, phoneNumberId])

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
        phoneNumber: get(
            state.entities.phoneNumbers,
            get(ownProps.match.params, 'phoneNumberId')
        ),
    }
})

export default withRouter(connector(PhoneNumberDetailContainer))
