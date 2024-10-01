import {useElements} from '@stripe/react-stripe-js'
import React, {
    FormEventHandler,
    HTMLProps,
    useEffect,
    useRef,
    useState,
} from 'react'
import {fromJS} from 'immutable'
import {useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {AnyAction} from 'redux'
import {StripeAddressElementChangeEvent} from '@stripe/stripe-js'
import Button from 'pages/common/components/button/Button'
import {
    emailError as validateEmail,
    validatePostalCode,
} from 'pages/settings/new_billing/utils/validations'
import {CRM_GROWTH_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {BILLING_PAYMENT_PATH} from 'pages/settings/new_billing/constants'
import {updateContact} from 'state/billing/actions'
import {UPDATE_BILLING_CONTACT_ERROR} from 'state/billing/constants'
import {BillingContact} from 'state/billing/types'
import {reportError} from 'utils/errors'
import Caption from 'pages/common/forms/Caption/Caption'
import css from './Form.less'

export const Form: React.FC<
    Omit<HTMLProps<HTMLFormElement>, 'onSubmit' | 'onChange' | 'ref'>
> = ({children, ...props}) => {
    const dispatch = useDispatch()
    const elements = useElements()
    const history = useHistory()

    const [error, setError] = useState<string>()

    const [isAdressComplete, setIsAddressComplete] = useState(false)
    const [isEmailComplete, setIsEmailComplete] = useState(false)

    const isComplete = isAdressComplete && isEmailComplete

    const addressElementValueRef =
        useRef<StripeAddressElementChangeEvent['value']>()

    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (formRef.current) {
            const emailError = validateEmailInput(formRef.current)
            setIsEmailComplete(!emailError)
        }
    }, [])

    const onChange: FormEventHandler<HTMLFormElement> = (event) => {
        const emailError = validateEmailInput(event.currentTarget)
        setIsEmailComplete(!emailError)
    }

    useEffect(() => {
        elements?.getElement('address')?.on('change', (event) => {
            addressElementValueRef.current = event.value

            const postalCodeError = validatePostalCode(
                event.value.address.postal_code,
                event.value.address.country ?? ''
            )

            /* we're handling this validation as a "global" validation/error
            // because we cannot show the error in the Stripe address field,
            // so this will be shown below the submit button instead */
            setError(postalCodeError)

            setIsAddressComplete(!postalCodeError && event.complete)
        })
    }, [elements])

    const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
        if (isComplete) {
            const billingContact = {
                email: getEmail(event.currentTarget),
                shipping: addressElementValueRef.current,
            } as BillingContact

            try {
                const response = (await updateContact(fromJS(billingContact))(
                    dispatch
                )) as AnyAction

                if (response.type !== UPDATE_BILLING_CONTACT_ERROR) {
                    history.push(BILLING_PAYMENT_PATH)
                }
            } catch (error) {
                handleError(error, 'Failed to update billing contact')
            }
        }
    }

    return (
        <form
            ref={formRef}
            onSubmit={onSubmit}
            onChange={onChange}
            className={css.form}
            {...props}
        >
            {children}
            <div>
                <Button
                    intent="primary"
                    isDisabled={!isComplete}
                    type="submit"
                    className={css.submitButton}
                >
                    Set Address
                </Button>
                {error ? <Caption error={error} /> : null}
            </div>
        </form>
    )
}

const handleError = (error: unknown, context: string) => {
    reportError(error, {
        tags: {team: CRM_GROWTH_SENTRY_TEAM},
        extra: {
            context: `BillingAddressSetupView.SubmitButton.onSubmit :: ${context}`,
        },
    })
}

const getEmail = (form: HTMLFormElement) =>
    new FormData(form).get('email') as string

const validateEmailInput = (form: HTMLFormElement) =>
    validateEmail(getEmail(form))
