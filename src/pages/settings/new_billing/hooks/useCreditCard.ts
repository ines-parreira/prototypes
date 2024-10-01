import {useEffect, useMemo, useState} from 'react'
import {fromJS} from 'immutable'
import {useHistory} from 'react-router-dom'
import {AnyAction} from 'redux'

import {SegmentEvent, logEvent} from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import {
    BillingContact,
    CreditCard,
    ErrorResponse,
    TicketPurpose,
} from 'state/billing/types'
import {getCurrentUser} from 'state/currentUser/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import {creditCard, getContact} from 'state/billing/selectors'
import {
    fetchContact,
    fetchCreditCard,
    updateContact,
} from 'state/billing/actions'
import {
    getCurrentAccountState,
    getCurrentSubscription,
    hasCreditCard as getHasCreditCard,
    getShopifyBillingStatus,
    isTrialing,
    shouldPayWithShopify,
} from 'state/currentAccount/selectors'
import GorgiasApi from 'services/gorgiasApi'
import {createStripeCardToken} from 'utils/stripe'
import {notify} from 'state/notifications/actions'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'
import {loadScript} from 'utils'
import {UPDATE_BILLING_CONTACT_ERROR} from 'state/billing/constants'
import {BILLING_BASE_PATH} from '../constants'
import {useBillingPlans} from './useBillingPlan'

type useCreditCardProps = {
    contactBilling: (ticketPurpose: TicketPurpose) => void
    dispatchBillingError: () => void
}

export const useCreditCard = ({
    contactBilling,
    dispatchBillingError,
}: useCreditCardProps) => {
    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const hasCreditCard = useAppSelector(getHasCreditCard)
    const payWithShopify = useAppSelector(shouldPayWithShopify)
    const shopifyBillingStatus = useAppSelector(getShopifyBillingStatus)

    const dispatch = useAppDispatch()
    const history = useHistory()
    const card = useAppSelector(creditCard)
    const isTrialingSubscription = useAppSelector(isTrialing)
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const isSubscriptionCanceled = currentSubscription.isEmpty()
    const gorgiasApi = new GorgiasApi()

    const [fields, setFields] = useState<CreditCard>({
        name: '',
        number: '',
        expDate: '',
        cvc: '',
    })

    const [errors, setErrors] = useState({
        name: '',
        number: '',
        expDate: '',
        cvc: '',
    })

    const [isCreditCardFetched, setIsCreditCardFetched] = useState(false)
    const [isContactFetched, setIsContactFetched] = useState(false)
    const [isStripeLoaded, setIsStripeLoaded] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {startSubscription} = useBillingPlans({
        contactBilling,
        dispatchBillingError,
    })

    const isUpdating = useMemo(
        () => isCreditCardFetched && !!card.get('brand'),
        [card, isCreditCardFetched]
    )

    const isCardValid = useMemo(
        () =>
            Object.values(fields).every((field) => !!field) &&
            Object.values(errors).every((error) => !error),
        [fields, errors]
    )

    const initialBillingContact = useAppSelector(
        getContact
    )?.toJS() as BillingContact
    const [billingContact, setBillingContact] = useState<BillingContact>(
        initialBillingContact
    )

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
            if (!initialBillingContact) {
                await fetchContact()(dispatch)
            }
            setIsContactFetched(true)
        }
        void getBillingShippingContact()
    }, [dispatch, initialBillingContact])

    // Set initial values for billing contact
    useEffect(() => {
        if (initialBillingContact && !billingContact) {
            setBillingContact(initialBillingContact)
        }
    }, [initialBillingContact, billingContact])

    useEffect(() => {
        // load Stripe.js because we need it to create token for credit card
        if (typeof Stripe === 'undefined' || typeof Stripe === 'function') {
            loadScript('https://js.stripe.com/v2/', () => {
                if (window.STRIPE_PUBLIC_KEY) {
                    Stripe.setPublishableKey(window.STRIPE_PUBLIC_KEY)
                    setIsStripeLoaded(true)
                }
            })
        } else {
            setIsStripeLoaded(true)
        }
    }, [])

    const updateField = (field: string, value: string) => {
        const newFields = {
            ...fields,
            [field]: value,
        }
        setErrors(validate(newFields))
        setFields(newFields)
    }

    const validate = (values: CreditCard) => {
        const newErrors = {
            name: '',
            number: '',
            expDate: '',
            cvc: '',
        }

        if (typeof Stripe === 'undefined') {
            return newErrors
        }

        // validate card number
        if (values.number && !Stripe.card.validateCardNumber(values.number)) {
            newErrors.number = 'Please provide a valid card number'
        }

        // validate expiration date
        if (values.expDate) {
            const expiry = values.expDate.split('/')
            if (!Stripe.card.validateExpiry(expiry[0], expiry[1])) {
                newErrors.expDate = 'Please provide a valid expiration date'
            }
        }

        // validate CVC
        if (values.cvc && !Stripe.card.validateCVC(values.cvc)) {
            newErrors.cvc = 'Please provide a valid CVC'
        }

        return newErrors
    }

    const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault()
        const [exp_month, exp_year] = fields.expDate.split('/')
        const cardToEncode: stripe.StripeCardTokenData = {
            name: fields.name,
            number: fields.number,
            exp_month: parseInt(exp_month, 10),
            exp_year: parseInt(exp_year, 10),
            cvc: fields.cvc,
        }

        setIsSubmitting(true)

        logEvent(SegmentEvent.PaymentMethodAddClicked, {
            payment_method: 'stripe',
            user_id: currentUser.get('id'),
            account_domain: currentAccount.get('domain'),
        })

        try {
            // A valid billing address is needed for tax purpose
            // (only for the first time a credit card is added, therefore when in trial)
            if (isTrialingSubscription) {
                const response = (await updateContact(fromJS(billingContact))(
                    dispatch
                )) as AnyAction

                if (response.type === UPDATE_BILLING_CONTACT_ERROR) {
                    return
                }
            }

            // Then the credit card is added
            const creditCardToken = await createStripeCardToken(cardToEncode)

            await gorgiasApi.updateCreditCard(
                fromJS({token: creditCardToken.id})
            )

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Credit card updated successfully!',
                    style: NotificationStyle.Alert,
                    showIcon: true,
                    showDismissButton: true,
                })
            )

            if (isTrialingSubscription || isSubscriptionCanceled) {
                await startSubscription()
                history.push(`${BILLING_BASE_PATH}`)
            } else {
                history.goBack()
            }
        } catch (exception) {
            const error = exception as ErrorResponse
            let errorMsg =
                'Failed to update credit card. Please try again in a few seconds.'
            if (error.response && error.response.data?.error) {
                // Gorgias API error
                errorMsg = error.response.data.error.msg
            } else if (error.error && error.error.message) {
                // Stripe API error
                errorMsg = error.error.message
            }

            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: errorMsg,
                    style: NotificationStyle.Alert,
                    showIcon: true,
                    showDismissButton: true,
                })
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        fields,
        errors,
        isStripeLoaded,
        isCreditCardFetched,
        isContactFetched,
        isCardValid,
        isUpdating,
        isSubmitting,
        isTrialingSubscription,
        handleSubmit,
        updateField,
        billingContact,
        setBillingContact,
        hasCreditCard,
        shouldPayWithShopify: payWithShopify,
        shopifyBillingStatus,
    }
}
