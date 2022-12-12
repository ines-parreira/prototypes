import React, {useEffect, useMemo, useRef, useState} from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import Button from 'pages/common/components/button/Button'
import RadioFieldSet, {RadioFieldOption} from 'pages/common/forms/RadioFieldSet'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'

import {
    BigCommerceCart,
    BigCommerceCustomerAddress,
    BigCommerceConsignment,
    BigCommerceShippingOption,
} from 'models/integration/types'

import {
    updateCheckoutConsignmentShippingMethod,
    upsertCheckoutConsignment,
} from './utils'

import css from './OrderTotals.less'

export const useConsignment = ({
    shippingAddress,
    cart,
    integrationId,
}: {
    integrationId: number
    cart: Maybe<BigCommerceCart>
    shippingAddress: Maybe<BigCommerceCustomerAddress>
}) => {
    const [consignment, setConsignment] = useState<BigCommerceConsignment>()

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
    }, [cart, shippingAddress, integrationId, consignment?.id])

    const updateConsignmentShippingMethod = async (
        selectedShippingMethodId: Maybe<string>
    ) => {
        if (!cart || !consignment || !selectedShippingMethodId) {
            return
        }

        try {
            const updateResult = await updateCheckoutConsignmentShippingMethod({
                cart,
                shippingMethodId: selectedShippingMethodId,
                consignmentId: consignment.id,
                integrationId,
            })

            setConsignment(updateResult.consignments[0])
        } catch (error) {
            console.error(error)
        }
    }

    return {consignment, updateConsignmentShippingMethod}
}
export const useShippingMethods = ({
    consignment,
    currencyCode,
    updateConsignmentShippingMethod,
}: {
    consignment: Maybe<BigCommerceConsignment>
    currencyCode: string | null
    updateConsignmentShippingMethod: (shippingMethodId: string) => Promise<void>
}) => {
    const [selectedShippingMethod, setSelectedShippingMethod] =
        useState<BigCommerceShippingOption | null>(null)

    /**
     * We need to track whether the `selected_shipping_option` in the consignment
     * corresponds to what user has selected in the UI. Changes to consignment, such
     * as address change can invalidate the selected shipping option, and we need to account for
     * that
     *
     * @url https://developer.bigcommerce.com/api-reference/fea1832a96623-update-checkout-consignment#request-body
     */
    useEffect(() => {
        if (!consignment) {
            return
        }

        if (!consignment.selected_shipping_option) {
            if (!selectedShippingMethod) {
                return
            }

            const hasAvailableSelectedShippingMethod =
                consignment.available_shipping_options.find(
                    ({id}) => id === selectedShippingMethod.id
                )

            if (hasAvailableSelectedShippingMethod) {
                return void updateConsignmentShippingMethod(
                    selectedShippingMethod.id
                )
            }

            const similarShippingOptions =
                consignment.available_shipping_options.filter(
                    ({type, description}) =>
                        type === selectedShippingMethod.type &&
                        description === selectedShippingMethod.description
                )

            // Update consignment and set local shipping method _only_ if we have single match
            // based on type and description
            if (similarShippingOptions.length === 1) {
                void updateConsignmentShippingMethod(
                    similarShippingOptions[0].id
                )
                return setSelectedShippingMethod(similarShippingOptions[0])
            }

            return setSelectedShippingMethod(null)
        }

        if (
            selectedShippingMethod &&
            consignment.selected_shipping_option.id !==
                selectedShippingMethod?.id
        ) {
            void updateConsignmentShippingMethod(selectedShippingMethod.id)
        }
    }, [consignment, selectedShippingMethod, updateConsignmentShippingMethod])

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

    const onSelectShippingMethod = (shippingMethodId: string) => {
        const shippingMethod = (
            consignment?.available_shipping_options ?? []
        ).find(({id}) => shippingMethodId === id)

        if (shippingMethod) {
            setSelectedShippingMethod(shippingMethod)
        }
    }

    return {
        selectedShippingMethod,
        onSelectShippingMethod,
        shippingMethodOptions,
    }
}

type Props = {
    integrationId: number
    cart: Maybe<BigCommerceCart>
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

    const {consignment, updateConsignmentShippingMethod} = useConsignment({
        integrationId,
        cart,
        shippingAddress,
    })

    const {
        selectedShippingMethod,
        shippingMethodOptions,
        onSelectShippingMethod,
    } = useShippingMethods({
        consignment,
        updateConsignmentShippingMethod,
        currencyCode,
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
                            onChange={onSelectShippingMethod}
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
                        Close
                    </Button>
                    {/*
                      Apply button is for the user to "feel" that he "confirmed" the
                      selection of shipping method, while in reality, shipping method
                      is changed on every change of radio select
                    */}
                    <Button onClick={onClose}>Apply</Button>
                </div>
            </Dropdown>
        </>
    )
}
