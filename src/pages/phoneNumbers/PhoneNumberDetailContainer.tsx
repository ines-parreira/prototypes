import React, {useEffect} from 'react'

import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {Link, useParams} from 'react-router-dom'
import ReactCountryFlag from 'react-country-flag'

import {fetchNewPhoneNumber} from 'models/phoneNumber/resources'
import {newPhoneNumberFetched} from 'state/entities/phoneNumbers/actions'
import {getNewPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import PageHeader from 'pages/common/components/PageHeader'
import PhoneNumberDetails from 'pages/phoneNumbers/PhoneNumberDetails'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'

import css from 'pages/settings/settings.less'

import {countryCode, isNewPhoneNumber} from './utils'

export function PhoneNumberDetailContainer() {
    const {phoneNumberId} = useParams<{phoneNumberId: string}>()
    const dispatch = useAppDispatch()

    useEffect(() => {
        const fetchPhoneNumber = async () => {
            const phoneNumber = await fetchNewPhoneNumber(
                parseInt(phoneNumberId)
            )
            dispatch(newPhoneNumberFetched(phoneNumber))
        }

        if (!phoneNumberId) {
            return
        }

        void fetchPhoneNumber()
    }, [dispatch, phoneNumberId])

    const phoneNumber = useAppSelector((state) => {
        if (phoneNumberId) {
            return getNewPhoneNumber(parseInt(phoneNumberId))(state)
        }

        return
    })

    if (!phoneNumber || !isNewPhoneNumber(phoneNumber)) {
        return null
    }

    const phoneCountry = countryCode(phoneNumber)

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
                                {phoneCountry && (
                                    <ReactCountryFlag
                                        countryCode={phoneCountry}
                                    />
                                )}
                                &nbsp;
                                {phoneNumber.name}
                                &nbsp;
                                <small className="text-muted ml-2">
                                    {phoneNumber.phone_number_friendly}
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

export default PhoneNumberDetailContainer
