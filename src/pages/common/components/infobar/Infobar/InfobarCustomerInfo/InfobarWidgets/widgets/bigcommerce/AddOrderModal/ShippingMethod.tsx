import React, {useEffect, useMemo, useRef, useState} from 'react'

import classnames from 'classnames'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import Button from 'pages/common/components/button/Button'
import Tooltip from 'pages/common/components/Tooltip'
import RadioFieldSet, {RadioFieldOption} from 'pages/common/forms/RadioFieldSet'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import Loader from 'pages/common/components/Loader/Loader'

import {
    BigCommerceCart,
    BigCommerceConsignment,
    BigCommerceShippingOption,
} from 'models/integration/types'
import css from './OrderTotals.less'

export const useShippingMethods = ({
    consignment,
    currencyCode,
    onUpdateConsignmentShippingMethod,
}: {
    consignment: Maybe<BigCommerceConsignment>
    currencyCode: string | null
    onUpdateConsignmentShippingMethod: (
        shippingMethodId: string
    ) => Promise<void>
}) => {
    const [isUpdatingConsignment, setIsUpdatingConsignment] = useState(false)

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
        const consignmentSync = async () => {
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
                    setIsUpdatingConsignment(true)

                    await onUpdateConsignmentShippingMethod(
                        selectedShippingMethod.id
                    )

                    return setIsUpdatingConsignment(false)
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
                    setIsUpdatingConsignment(true)

                    await onUpdateConsignmentShippingMethod(
                        similarShippingOptions[0].id
                    )

                    setIsUpdatingConsignment(false)
                    return setSelectedShippingMethod(similarShippingOptions[0])
                }

                return setSelectedShippingMethod(null)
            }

            if (
                selectedShippingMethod &&
                consignment.selected_shipping_option.id !==
                    selectedShippingMethod?.id
            ) {
                void onUpdateConsignmentShippingMethod(
                    selectedShippingMethod.id
                )
            }
        }

        void consignmentSync()
    }, [consignment, selectedShippingMethod, onUpdateConsignmentShippingMethod])

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
        isUpdatingConsignment,
    }
}

type Props = {
    consignment: Maybe<BigCommerceConsignment>
    cart: Maybe<BigCommerceCart>
    currencyCode: string | null
    shippingCost: number
    hasShippingAddress: boolean
    onUpdateConsignmentShippingMethod: (
        selectedShippingMethodId: Maybe<string>
    ) => Promise<void>
    hasError?: boolean
}

const getDisabledStatus = ({
    cart,
    hasShippingAddress,
}: {
    cart: Maybe<BigCommerceCart>
    hasShippingAddress: boolean
}) => {
    const countOfPhysicalItemsInCart =
        cart?.line_items.physical_items.length ?? 0
    const countOfDigitalItemsInCart = cart?.line_items.digital_items.length ?? 0

    const countOfPhysicalAndDigitalItemsInCart =
        countOfPhysicalItemsInCart + countOfDigitalItemsInCart

    if (!cart || !countOfPhysicalAndDigitalItemsInCart) {
        return {
            disabled: true,
            reason: 'Your cart contains no products, please select some first.',
        }
    }

    if (countOfPhysicalItemsInCart === 0 && countOfDigitalItemsInCart >= 1) {
        return {
            disabled: true,
            reason: 'Your cart contains only digital products, no shipping is required.',
        }
    }

    if (!hasShippingAddress) {
        return {
            disabled: true,
            reason: (
                <>
                    Please select{' '}
                    <span className={css.tooltipBoldText}>
                        Shipping address
                    </span>{' '}
                    to see shipping rates.
                </>
            ),
        }
    }

    return {disabled: false}
}

export function ShippingMethod({
    cart,
    consignment,
    hasShippingAddress,
    shippingCost,
    currencyCode,
    onUpdateConsignmentShippingMethod,
    hasError = false,
}: Props) {
    const {disabled: isDisabled, reason: disabledReason} = getDisabledStatus({
        hasShippingAddress,
        cart,
    })

    const buttonRef = useRef<HTMLButtonElement>(null)

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const onClose = () => setIsDropdownOpen(false)
    const onToggle = () => {
        if (isDisabled) {
            return
        }

        setIsDropdownOpen((isDropdownOpen) => !isDropdownOpen)
    }

    const {
        selectedShippingMethod,
        shippingMethodOptions,
        onSelectShippingMethod,
        isUpdatingConsignment,
    } = useShippingMethods({
        consignment,
        onUpdateConsignmentShippingMethod,
        currencyCode,
    })

    return (
        <>
            <>
                <dt className={css.descriptionTitle}>
                    <button
                        onClick={onToggle}
                        className={classnames(css.actionButton, {
                            [css.hasError]: hasError && !isUpdatingConsignment,
                            [css.isDisabled]: isDisabled,
                        })}
                        ref={buttonRef}
                        id="shipping-method-button"
                    >
                        Add shipping
                    </button>
                    <Tooltip
                        placement="top"
                        target="shipping-method-button"
                        disabled={!isDisabled}
                    >
                        {disabledReason}
                    </Tooltip>
                </dt>
                <dd
                    className={classnames(css.descriptionExtraInfo, {
                        [css.isDisabled]: !selectedShippingMethod,
                    })}
                >
                    {selectedShippingMethod
                        ? selectedShippingMethod.description
                        : '⎯'}
                </dd>
                <dd
                    className={classnames(css.descriptionValue, {
                        [css.descriptionValueDisabled]: isDisabled,
                        [css.descriptionValueZero]:
                            !isDisabled && shippingCost === 0,
                    })}
                >
                    {isUpdatingConsignment && (
                        <div className="mr-3">
                            <Loader minHeight="20px" size="20px" />
                        </div>
                    )}
                    <MoneyAmount
                        amount={String(shippingCost)}
                        currencyCode={currencyCode}
                        renderIfZero
                    />
                </dd>
            </>
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
