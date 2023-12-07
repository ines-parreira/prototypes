import React, {useEffect} from 'react'

import {Container, Row} from 'reactstrap'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useAsyncFn} from 'react-use'
import {isEmpty} from 'lodash'

import {fetchNewPhoneNumbers} from 'models/phoneNumber/resources'
import {newPhoneNumbersFetched} from 'state/entities/phoneNumbers/actions'
import {getNewPhoneNumbers} from 'state/entities/phoneNumbers/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import css from 'pages/settings/settings.less'

import PhoneNumbersList from './PhoneNumbersList'

export function PhoneNumbersListContainer() {
    const dispatch = useAppDispatch()
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)
    const [{loading: isLoading}, handleFetchPhoneNumbers] = useAsyncFn(
        async () => {
            try {
                const numbers = await fetchNewPhoneNumbers()
                if (numbers) {
                    dispatch(newPhoneNumbersFetched(numbers.data))
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
