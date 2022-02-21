import React, {useEffect} from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {useAsyncFn} from 'react-use'
import {isEmpty} from 'lodash'

import {fetchPhoneNumbers} from 'models/phoneNumber/resources'
import {phoneNumbersFetched} from 'state/entities/phoneNumbers/actions'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import PageHeader from 'pages/common/components/PageHeader'
import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import PhoneIntegrationsList from 'pages/integrations/detail/components/phone/PhoneIntegrationsList'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import css from 'pages/settings/settings.less'

export function SmsIntegrationsListContainer(): JSX.Element {
    const dispatch = useAppDispatch()
    const integrations = useAppSelector(
        getIntegrationsByTypes([IntegrationType.Sms])
    )?.toJS()
    const [{loading: isLoading}, handleFetchPhoneNumbers] = useAsyncFn(
        async () => {
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
        }
    )

    useEffect(() => {
        void handleFetchPhoneNumbers()
    }, [handleFetchPhoneNumbers])

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <>
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    Integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>SMS</BreadcrumbItem>
                        </Breadcrumb>
                        <Button
                            intent={ButtonIntent.Creation}
                            onClick={() =>
                                history.push(
                                    '/app/settings/integrations/sms/new'
                                )
                            }
                        >
                            Add SMS Integration
                        </Button>
                    </>
                }
            />
            <Container fluid className={css.pageContainer}>
                Chat with your customers via SMS from Gorgias.
                {isEmpty(integrations) &&
                    (isLoading ? (
                        <Loader />
                    ) : (
                        <div className="mt-3">
                            You don't have any SMS integrations at the moment.
                        </div>
                    ))}
            </Container>
            <PhoneIntegrationsList type={IntegrationType.Sms} />
        </div>
    )
}

export default SmsIntegrationsListContainer
