import React, {useEffect} from 'react'

import {Container, Row} from 'reactstrap'
import {useAsyncFn} from 'react-use'
import {isEmpty} from 'lodash'

import {fetchPhoneNumbers} from 'models/phoneNumber/resources'
import {phoneNumbersFetched} from 'state/entities/phoneNumbers/actions'
import {getPhoneNumbers} from 'state/entities/phoneNumbers/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getCurrentAccountFeatures} from 'state/currentAccount/selectors'
import {AccountFeatures} from 'state/currentAccount/types'
import PageHeader from 'pages/common/components/PageHeader'
import PhoneNumbersLimitAlert from 'pages/phoneNumbers/PhoneNumbersLimitAlert'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import css from 'pages/settings/settings.less'

import PhoneNumbersList from './PhoneNumbersList'

export function PhoneNumbersListContainer() {
    const dispatch = useAppDispatch()
    const phoneNumbers = useAppSelector(getPhoneNumbers)
    const accountFeatures: AccountFeatures = useAppSelector(
        getCurrentAccountFeatures
    ).toJS()

    const currentPhoneNumbers = Object.keys(phoneNumbers).length
    const maxPhoneNumbers = accountFeatures?.phone_number?.limit
    const isLimitReacted =
        (maxPhoneNumbers && currentPhoneNumbers >= maxPhoneNumbers) || false

    const [{loading: isLoading}, handleFetchPhoneNumbers] = useAsyncFn(
        async () => {
            try {
                const numbers = await fetchPhoneNumbers()
                if (numbers) {
                    dispatch(phoneNumbersFetched(numbers.data))
                }
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch phone numbers',
                        status: NotificationStatus.Error,
                    })
                )
            }
        }
    )

    useEffect(() => {
        void handleFetchPhoneNumbers()
    }, [handleFetchPhoneNumbers])

    return (
        <div className="full-width">
            <PageHeader title="Phone numbers">
                <Button
                    isDisabled={isLimitReacted}
                    onClick={() =>
                        history.push('/app/settings/phone-numbers/new')
                    }
                >
                    Add Phone Number
                </Button>
            </PageHeader>
            <Container fluid className={css.pageContainer}>
                <div>
                    Create a phone number in Gorgias to connect Voice and SMS
                    capabilities.
                </div>
                <PhoneNumbersLimitAlert
                    currentPhoneNumbers={currentPhoneNumbers}
                    maxPhoneNumbers={maxPhoneNumbers}
                />
                {isEmpty(phoneNumbers) &&
                    (isLoading ? (
                        <Loader />
                    ) : (
                        <Row>
                            <Container
                                fluid
                                data-candu-id="phone-numbers-empty-placeholder"
                            />
                        </Row>
                    ))}
            </Container>
            <PhoneNumbersList />
        </div>
    )
}

export default PhoneNumbersListContainer
