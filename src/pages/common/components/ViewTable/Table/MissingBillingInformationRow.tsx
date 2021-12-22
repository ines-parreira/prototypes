import React, {FormEvent, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {Modal, ModalHeader, Form, ModalBody, ModalFooter} from 'reactstrap'
import {useAsync, useAsyncFn, useWindowSize} from 'react-use'
import {fromJS} from 'immutable'
import {AnyAction} from 'redux'

import useDimensions from 'hooks/useDimensions'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
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
    const isAdmin = useMemo(
        () => hasRole(currentUser, UserRole.Admin),
        [currentUser]
    )
    const {width: viewportWidth} = useWindowSize(window.innerWidth)
    const [rowRef, rowDimensions] = useDimensions()
    const rowMaxWidth = useMemo(
        () => viewportWidth - (rowDimensions?.x || 0),
        [viewportWidth, rowDimensions]
    )

    const {loading: isFetching} = useAsync(async () => {
        if (!contact && isAdmin) {
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
            {isAdmin &&
                hasCreditCard &&
                paymentMethod !== PaymentMethodType.Shopify &&
                isMissingContactInformation &&
                !isFetching && (
                    <tr>
                        <td colSpan={20} ref={rowRef}>
                            <div
                                className={css.bannerWrapper}
                                style={{
                                    maxWidth: rowMaxWidth,
                                }}
                            >
                                <LinkAlert
                                    actionLabel="Update Now"
                                    className={css.alert}
                                    icon
                                    onAction={() => setIsModalOpened(true)}
                                    type={AlertType.Error}
                                >
                                    You need to complete your billing profile,
                                    please update it now.
                                </LinkAlert>
                            </div>
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
