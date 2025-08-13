import { useEffect } from 'react'

import { useAsyncFn, useCallbackRef } from '@repo/hooks'
import { isEmpty } from 'lodash'
import { Container, Row } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { fetchNewPhoneNumbers } from 'models/phoneNumber/resources'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import history from 'pages/history'
import css from 'pages/settings/settings.less'
import { newPhoneNumbersFetched } from 'state/entities/phoneNumbers/actions'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import PhoneNumbersList from './PhoneNumbersList'

export function PhoneNumbersListContainer() {
    const dispatch = useAppDispatch()
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)
    const [{ loading: isLoading }, handleFetchPhoneNumbers] = useAsyncFn(
        async () => {
            try {
                const numbers = await fetchNewPhoneNumbers()
                if (numbers) {
                    dispatch(newPhoneNumbersFetched(numbers.data))
                }
            } catch {
                void dispatch(
                    notify({
                        message: 'Failed to fetch phone numbers',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
    )
    const [placeholderNode, setPlaceholderNode] = useCallbackRef()
    useInjectStyleToCandu(placeholderNode)

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
                            <div
                                data-candu-id="phone-numbers-empty-placeholder"
                                ref={setPlaceholderNode}
                            />
                        </Row>
                    ))}
            </Container>
            <PhoneNumbersList />
        </div>
    )
}

export default PhoneNumbersListContainer
