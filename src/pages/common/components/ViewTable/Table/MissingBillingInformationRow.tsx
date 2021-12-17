import React, {FormEvent, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {Modal, ModalHeader, Form, ModalBody, ModalFooter} from 'reactstrap'
import {useAsync, useAsyncFn} from 'react-use'
import {fromJS} from 'immutable'
import {AnyAction} from 'redux'

import Alert, {AlertType} from '../../Alert/Alert'
import Button, {ButtonIntent, ButtonSize} from '../../button/Button'
import {hasRole} from '../../../../../utils'
import {getCurrentUser} from '../../../../../state/currentUser/selectors'
import {UserRole} from '../../../../../config/types/user'
import {hasCreditCard as getHasCreditCard} from '../../../../../state/currentAccount/selectors'
import {
    paymentMethod as getPaymentMethod,
    isMissingContactInformation as getIsMissingContactInformation,
    getContact,
} from '../../../../../state/billing/selectors'
import {
    BillingContact,
    PaymentMethodType,
} from '../../../../../state/billing/types'
import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {fetchContact, updateContact} from '../../../../../state/billing/actions'
import BillingAddressInputs from '../../../../settings/billing/common/BillingAddressInputs'

import css from './MissingBillingInformationRow.less'

export default function MissingBillingInformationRow() {
    const dispatch = useAppDispatch()
    const [isModalOpened, setIsModalOpened] = useState(false)
    const [contactForm, setContactForm] = useState<BillingContact | null>(null)
    const contact = useSelector(getContact)
    const currentUser = useSelector(getCurrentUser)
    const hasCreditCard = useSelector(getHasCreditCard)
    const paymentMethod = useSelector(getPaymentMethod)
    const isMissingContactInformation = useSelector(
        getIsMissingContactInformation
    )

    const {loading: isFetching} = useAsync(async () => {
        if (!contact) {
            await dispatch(fetchContact())
        }
    }, [])

    useEffect(() => {
        if (contact) {
            setContactForm(contact.toJS())
        }
    }, [contact])

    const [{loading}, handleSubmit] = useAsyncFn(
        async (event: FormEvent) => {
            event.preventDefault()
            const res = (await dispatch(
                updateContact(fromJS(contactForm))
            )) as AnyAction

            if (!res.error) {
                setIsModalOpened(false)
            }
        },
        [contactForm]
    )

    return (
        <>
            {hasRole(currentUser, UserRole.Admin) &&
                hasCreditCard &&
                paymentMethod !== PaymentMethodType.Shopify &&
                isMissingContactInformation &&
                !isFetching && (
                    <tr>
                        <td className={css.bannerWrapper} colSpan={20}>
                            <Alert
                                icon
                                type={AlertType.Error}
                                customActions={
                                    <Button
                                        intent={ButtonIntent.Text}
                                        size={ButtonSize.Small}
                                        onClick={() => setIsModalOpened(true)}
                                    >
                                        Update Now
                                    </Button>
                                }
                            >
                                We’re missing critical information on your
                                payment profile, please update them now.
                            </Alert>
                        </td>
                    </tr>
                )}
            <Modal
                className={css.modal}
                centered
                isOpen={isModalOpened}
                toggle={() => setIsModalOpened(false)}
            >
                <Form onSubmit={handleSubmit}>
                    <ModalHeader
                        tag="div"
                        toggle={() => setIsModalOpened(false)}
                    >
                        <h3 className={css.modalHeader}>
                            Missing information - Billing address
                        </h3>
                        <p className={css.modalDescription}>
                            According to the regulation, we need to collect this
                            data from all our customers.
                        </p>
                    </ModalHeader>
                    <ModalBody>
                        {contactForm && (
                            <BillingAddressInputs
                                onChange={setContactForm}
                                value={contactForm}
                            />
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button isLoading={loading}>Update Address</Button>
                    </ModalFooter>
                </Form>
            </Modal>
        </>
    )
}
