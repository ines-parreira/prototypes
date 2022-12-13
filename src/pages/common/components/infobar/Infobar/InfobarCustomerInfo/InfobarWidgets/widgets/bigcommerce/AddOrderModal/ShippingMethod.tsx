import React, {useEffect, useMemo, useRef, useState} from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import Button from 'pages/common/components/button/Button'
import RadioFieldSet, {RadioFieldOption} from 'pages/common/forms/RadioFieldSet'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'

import {
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
                return void onUpdateConsignmentShippingMethod(
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
                void onUpdateConsignmentShippingMethod(
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
            void onUpdateConsignmentShippingMethod(selectedShippingMethod.id)
        }
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
    }
}

type Props = {
    consignment: Maybe<BigCommerceConsignment>
    currencyCode: string | null
    shippingCost: number
    onUpdateConsignmentShippingMethod: (
        selectedShippingMethodId: Maybe<string>
    ) => Promise<void>
}

export function ShippingMethod({
    consignment,
    shippingCost,
    currencyCode,
    onUpdateConsignmentShippingMethod,
}: Props) {
    const buttonRef = useRef<HTMLButtonElement>(null)

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const onClose = () => setIsDropdownOpen(false)
    const onToggle = () =>
        setIsDropdownOpen((isDropdownOpen) => !isDropdownOpen)

    const {
        selectedShippingMethod,
        shippingMethodOptions,
        onSelectShippingMethod,
    } = useShippingMethods({
        consignment,
        onUpdateConsignmentShippingMethod,
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
                    amount={String(shippingCost)}
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
