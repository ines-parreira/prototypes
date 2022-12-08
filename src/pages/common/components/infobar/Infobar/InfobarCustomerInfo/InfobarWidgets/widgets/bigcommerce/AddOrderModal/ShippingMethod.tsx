import React, {useEffect, useMemo, useRef, useState} from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import Button from 'pages/common/components/button/Button'
import RadioFieldSet, {RadioFieldOption} from 'pages/common/forms/RadioFieldSet'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'

import {BigCommerceCustomerAddress, Cart, Consignment} from '../types'

import {
    updateCheckoutConsignmentShippingMethod,
    upsertCheckoutConsignment,
} from '../utils'

import css from '../OrderTotals.less'

export const useConsignment = ({
    shippingAddress,
    cart,
    integrationId,
}: {
    integrationId: number
    cart: Maybe<Cart>
    shippingAddress: Maybe<BigCommerceCustomerAddress>
}) => {
    const [consignment, setConsignment] = useState<Consignment>()

    useEffect(() => {
        const updateConsignment = async () => {
            if (
                !cart ||
                !shippingAddress ||
                cart.line_items.physical_items.length === 0
            ) {
                return
            }

            try {
                const {consignments} = await upsertCheckoutConsignment({
                    integrationId,
                    cart,
                    shippingAddress,
                    consignmentId: consignment?.id,
                })

                setConsignment(consignments[0])
            } catch (error) {
                console.error(error)
            }
        }

        void updateConsignment()
    }, [cart, shippingAddress, consignment?.id, integrationId])

    return consignment
}
export const useShippingMethods = ({
    consignment,
    currencyCode,
}: {
    consignment: Maybe<Consignment>
    currencyCode: string | null
}) => {
    const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<
        string | null
    >(null)

    useEffect(() => {
        if (!consignment) {
            return
        }

        setSelectedShippingMethodId(
            consignment.selected_shipping_option?.id ?? null
        )
    }, [consignment])

    const shippingMethodOptions: Array<RadioFieldOption> = useMemo(
        () =>
            (consignment?.available_shipping_options ?? []).map((method) => ({
                value: method.id,
                label: (
                    <div className={css.radioLabel}>
                        <span>{method.description}</span>
                        <span className={css.radioLabelCaption}>
                            <MoneyAmount
                                amount={String(method.cost)}
                                currencyCode={currencyCode}
                            />
                        </span>
                    </div>
                ),
            })),
        [consignment?.available_shipping_options, currencyCode]
    )

    return {
        selectedShippingMethod:
            (consignment?.available_shipping_options ?? []).find(
                ({id}) => selectedShippingMethodId === id
            ) ?? null,
        setSelectedShippingMethodId,
        shippingMethodOptions,
    }
}

export function useOnChangeShippingMethodId({
    cart,
    integrationId,
    consignment,
    selectedShippingMethodId,
    onSuccess,
}: {
    consignment: Maybe<Consignment>
    selectedShippingMethodId: Maybe<string>
    onSuccess: () => void
    integrationId: number
    cart: Maybe<Cart>
}) {
    return async () => {
        if (!cart || !consignment || !selectedShippingMethodId) {
            return
        }

        try {
            await updateCheckoutConsignmentShippingMethod({
                cart,
                shippingMethodId: selectedShippingMethodId,
                consignmentId: consignment?.id,
                integrationId,
            })

            onSuccess()
        } catch (error) {
            console.error(error)
        }
    }
}

type Props = {
    integrationId: number
    cart: Maybe<Cart>
    shippingAddress: Maybe<BigCommerceCustomerAddress>
    currencyCode: string | null
}

export function ShippingMethod({
    integrationId,
    cart,
    shippingAddress,
    currencyCode,
}: Props) {
    const buttonRef = useRef<HTMLButtonElement>(null)

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const onClose = () => setIsDropdownOpen(false)
    const onToggle = () =>
        setIsDropdownOpen((isDropdownOpen) => !isDropdownOpen)

    const consignment = useConsignment({
        integrationId,
        cart,
        shippingAddress,
    })

    const {
        selectedShippingMethod,
        setSelectedShippingMethodId,
        shippingMethodOptions,
    } = useShippingMethods({
        consignment,
        currencyCode,
    })

    const onClickApply = useOnChangeShippingMethodId({
        cart,
        integrationId,
        selectedShippingMethodId: selectedShippingMethod?.id ?? null,
        consignment,
        onSuccess: onClose,
    })

    return (
        <>
            <dt className="col-9 mb-2">
                <button
                    onClick={onToggle}
                    className={css.actionButton}
                    ref={buttonRef}
                >
                    Add shipping
                </button>
            </dt>
            <dd className="col-3 mb-2">
                <MoneyAmount
                    amount={String(consignment?.shipping_cost_inc_tax ?? 0)}
                    currencyCode={currencyCode}
                />
            </dd>
            <Dropdown
                isOpen={isDropdownOpen}
                onToggle={onToggle}
                target={buttonRef}
            >
                <DropdownBody
                    className={css.dropdownBody}
                    onClick={(event) => {
                        // stop event from propagating to modal and closing it
                        event.stopPropagation()
                    }}
                >
                    {shippingMethodOptions.length > 0 ? (
                        <RadioFieldSet
                            selectedValue={selectedShippingMethod?.id ?? null}
                            onChange={setSelectedShippingMethodId}
                            options={shippingMethodOptions}
                        />
                    ) : (
                        <span className={css.selectShippingAddress}>
                            Select shipping address first
                        </span>
                    )}
                </DropdownBody>

                <div className={css.dropdownFooter}>
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onClickApply}>Apply</Button>
                </div>
            </Dropdown>
        </>
    )
}
