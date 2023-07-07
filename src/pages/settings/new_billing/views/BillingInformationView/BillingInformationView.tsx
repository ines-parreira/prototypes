import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'
import {fromJS} from 'immutable'
import {AnyAction} from 'redux'
import {getContact} from 'state/billing/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {BillingContact} from 'state/billing/types'
import Button from 'pages/common/components/button/Button'
import {fetchContact, updateContact} from 'state/billing/actions'
import {UPDATE_BILLING_CONTACT_ERROR} from 'state/billing/constants'
import Loader from 'pages/common/components/Loader/Loader'
import {BILLING_PAYMENT_PATH} from '../../constants'

import BackLink from '../../components/BackLink/BackLink'
import AddressForm from '../../components/AddressForm/AddressForm'
import css from './BillingInformationView.less'

const BillingInformationView = () => {
    const dispatch = useDispatch()
    const history = useHistory()
    const initialBillingContact = useAppSelector(
        getContact
    )?.toJS() as BillingContact
    const [billingContact, setBillingContact] = useState<BillingContact>(
        initialBillingContact
    )
    const [isFetchingData, setIsFetchingData] = useState(true)

    // Fetch billing contact
    useEffect(() => {
        const getBillingShippingContact = async () => {
            if (!initialBillingContact) {
                await fetchContact()(dispatch)
            }
            setIsFetchingData(false)
        }
        void getBillingShippingContact()
    }, [dispatch, initialBillingContact])

    // Set initial values for billing contact
    useEffect(() => {
        if (initialBillingContact && !billingContact) {
            setBillingContact(initialBillingContact)
        }
    }, [initialBillingContact, billingContact])

    const handleOnSubmit = async () => {
        const response = (await updateContact(fromJS(billingContact))(
            dispatch
        )) as AnyAction

        if (response.type === UPDATE_BILLING_CONTACT_ERROR) {
            return
        }

        history.push(BILLING_PAYMENT_PATH)
    }

    if (isFetchingData || !initialBillingContact) {
        return <Loader />
    }

    return (
        <div className={css.container}>
            <BackLink />
            <AddressForm
                billingContact={billingContact}
                setBillingContact={setBillingContact}
            />
            <div className={css.formButtonContainer}>
                <Button intent="primary" onClick={handleOnSubmit}>
                    Set Address
                </Button>
            </div>
        </div>
    )
}

export default BillingInformationView
