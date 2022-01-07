import React, {useEffect} from 'react'
import {Container} from 'reactstrap'
import {useAsyncFn} from 'react-use'

import {fetchPhoneNumbers} from 'models/phoneNumber/resources'
import {phoneNumbersFetched} from 'state/entities/phoneNumbers/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import PageHeader from 'pages/common/components/PageHeader'
import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import history from 'pages/history'
import useAppDispatch from 'hooks/useAppDispatch'

import css from 'pages/settings/settings.less'

export function PhoneNumbersListContainer() {
    const dispatch = useAppDispatch()
    const [, handleFetchPhoneNumbers] = useAsyncFn(async () => {
        try {
            const res = await fetchPhoneNumbers()
            if (!res) {
                return
            }
            dispatch(phoneNumbersFetched(res.data))
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
        void handleFetchPhoneNumbers()
    }, [handleFetchPhoneNumbers])

    return (
        <div className="full-width">
            <PageHeader title="Phone Numbers">
                <Button
                    intent={ButtonIntent.Creation}
                    onClick={() =>
                        history.push('/app/settings/phone-numbers/new')
                    }
                >
                    Create Phone Number
                </Button>
            </PageHeader>
            <Container fluid className={css.pageContainer}></Container>
        </div>
    )
}

export default PhoneNumbersListContainer
