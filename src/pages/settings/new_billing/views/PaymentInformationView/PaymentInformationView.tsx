import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import {fetchContact, fetchCreditCard} from 'state/billing/actions'
import useAppSelector from 'hooks/useAppSelector'
import {
    creditCard,
    getContact,
    getCurrentHelpdeskInterval,
} from 'state/billing/selectors'
import {PlanInterval} from 'models/billing/types'
import {BillingContact} from 'state/billing/types'
import {countries} from 'config/countries'
import Loader from 'pages/common/components/Loader/Loader'
import Tooltip from 'pages/common/components/Tooltip'
import SummaryPaymentSection from '../../components/SummaryPaymentSection/SummaryPaymentSection'
import {
    BILLING_INFORMATION_PATH,
    BILLING_PAYMENT_FREQUENCY_PATH,
} from '../../constants'
import css from './PaymentInformationView.less'

type PaymentInformationViewProps = {
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const PaymentInformationView = ({
    setIsModalOpen,
}: PaymentInformationViewProps) => {
    const dispatch = useAppDispatch()

    const interval =
        useAppSelector(getCurrentHelpdeskInterval) ?? PlanInterval.Month

    const contact = useAppSelector(getContact)?.toJS() as BillingContact
    const card = useAppSelector(creditCard)

    const hasAddress = !!contact?.shipping
    const address = contact?.shipping?.address
    const country = address
        ? countries.find((country) => country.value === address.country)
              ?.label ?? address.country
        : ''

    const displayedAddress = hasAddress
        ? [
              address.line1,
              address.line2,
              address.city,
              address.state,
              address.postal_code,
          ]
              .filter((value) => !!value)
              .join(', ')
        : ''

    const [isCreditCardFetched, setIsCreditCardFetched] = useState(false)
    const [isBillingAddressFetched, setIsBillingAddressFetched] = useState(true)

    // fetch card
    useEffect(() => {
        const fetchCard = async () => {
            if (!card.get('brand')) {
                await dispatch(fetchCreditCard())
            }
            setIsCreditCardFetched(true)
        }

        void fetchCard()
    }, [card, dispatch])

    // Fetch billing contact
    useEffect(() => {
        const getBillingShippingContact = async () => {
            if (!contact?.email) {
                await fetchContact()(dispatch)
            }
            setIsBillingAddressFetched(false)
        }
        void getBillingShippingContact()
    }, [dispatch, contact?.email])

    return (
        <div className={css.container}>
            <div>
                <div className={css.title}>
                    <i className="material-icons">credit_card</i>
                    Payment method
                </div>
                <div className={css.card}>
                    <SummaryPaymentSection
                        isCreditCardFetched={isCreditCardFetched}
                        isPaymentInformationView
                    />
                </div>
            </div>
            <div>
                <div className={css.title}>
                    <i className="material-icons">history</i>
                    Billing frequency
                </div>
                <div className={css.card}>
                    <div className={css.description}>
                        All plans are billed <strong>{interval}ly</strong>
                    </div>
                    {interval === PlanInterval.Month ? (
                        <Link to={BILLING_PAYMENT_FREQUENCY_PATH}>
                            Change Frequency
                        </Link>
                    ) : (
                        <>
                            <div
                                className={css.disabledLink}
                                id="changeFrequency"
                            >
                                Change Frequency
                            </div>
                            <Tooltip
                                target="changeFrequency"
                                placement="bottom-start"
                                className={css.tooltip}
                                autohide={false}
                            >
                                To switch from yearly to monthly billing, please{' '}
                                <span
                                    className={css.link}
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    get in touch
                                </span>{' '}
                                with our Billing team.
                            </Tooltip>
                        </>
                    )}
                </div>
            </div>
            <div>
                <div className={css.title}>
                    <i className="material-icons">person_pin_circle</i>
                    Billing address
                </div>
                <div className={css.card}>
                    {isBillingAddressFetched ? (
                        <Loader minHeight="auto" />
                    ) : (
                        <>
                            <div className={css.description}>
                                <strong>Billing email:</strong> {contact?.email}
                                {!hasAddress ? (
                                    <div>
                                        <strong>No billing address</strong>
                                    </div>
                                ) : (
                                    <div>
                                        <strong>Company name:</strong>{' '}
                                        {contact?.shipping.name}
                                        <br />
                                        <strong>Phone number:</strong>{' '}
                                        {contact?.shipping.phone}
                                        <br />
                                        <strong>Address:</strong>{' '}
                                        {displayedAddress} - {country}
                                    </div>
                                )}
                            </div>
                            <Link to={BILLING_INFORMATION_PATH}>
                                {hasAddress ? 'Update' : 'Add'} address
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PaymentInformationView
