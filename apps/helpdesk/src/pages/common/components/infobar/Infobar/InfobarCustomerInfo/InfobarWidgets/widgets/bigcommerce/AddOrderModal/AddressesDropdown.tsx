import React, { useRef, useState } from 'react'

import classnames from 'classnames'

import { LegacyLabel as Label, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { BigCommerceCustomerAddress } from 'models/integration/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import { CustomAddressModal } from './CustomAddressModal'
import { buildAddressComponent, getOneLineAddress } from './utils'

import css from './AddressesDropdown.less'
import cssOrderModal from './OrderModal.less'

const BILLING_ADDRESS_DROPDOWN_ID = 'billing-address-dropdown'
const SHIPPING_ADDRESS_DROPDOWN_ID = 'shipping-address-dropdown'

type Props = {
    className?: string
    selectedAddress: Maybe<BigCommerceCustomerAddress>
    availableAddresses: BigCommerceCustomerAddress[]
    onSelectAddress: (
        selectedAddress: BigCommerceCustomerAddress,
        addressType: 'billing' | 'shipping',
        customerEmail: Maybe<string>,
    ) => Promise<void>
    addressType: 'billing' | 'shipping'
    currencyCode: string
    customerEmail: Maybe<string>
    errorMessage?: string
    hasError?: boolean
    isDisabled?: boolean
    integrationId: number
    customerId?: number
}

function AddressesDropdownItems({
    availableAddresses,
    onSelectAddress,
    addressType,
    customerEmail,
}: {
    availableAddresses: BigCommerceCustomerAddress[]
    onSelectAddress: (
        selectedAddress: BigCommerceCustomerAddress,
        addressType: 'billing' | 'shipping',
        customerEmail: Maybe<string>,
    ) => Promise<void>
    addressType: 'billing' | 'shipping'
    customerEmail: Maybe<string>
}) {
    return (
        <>
            {availableAddresses.map((address, index) => (
                <DropdownItem
                    key={index}
                    autoFocus
                    shouldCloseOnSelect
                    className={css.addressItem}
                    option={{
                        label: address.address1,
                        value: address.address1,
                    }}
                    onClick={() => {
                        void onSelectAddress(
                            address,
                            addressType,
                            customerEmail,
                        )
                    }}
                >
                    <div className={css.addressLine}>
                        <b>{`${address.first_name} ${address.last_name}`}</b>
                        <br />
                        <>
                            {address.address2
                                ? `${address.address1}, ${address.address2}`
                                : address.address1}
                            <br />
                        </>
                        <>
                            {buildAddressComponent({
                                addressObj: address,
                                includeCountry: false,
                            })}
                            <br />
                            {address.country}
                            <br />
                            {address.phone && (
                                <>
                                    {address.phone}
                                    <br />
                                </>
                            )}
                        </>
                    </div>
                </DropdownItem>
            ))}
        </>
    )
}

export function AddressesDropdown({
    selectedAddress,
    availableAddresses,
    onSelectAddress,
    addressType,
    currencyCode,
    customerEmail,
    errorMessage = 'Please fill out this field.',
    hasError = false,
    isDisabled = false,
    integrationId,
    customerId,
}: Props) {
    const selectRef = useRef(null)
    const floatingSelectRef = useRef(null)
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const [isCustomAddressModalOpen, setIsCustomAddressModalOpen] =
        useState(false)
    return (
        <>
            <Label className={cssOrderModal.label} isRequired>
                {addressType === 'billing'
                    ? 'Billing address'
                    : 'Shipping address'}
            </Label>
            <div className={cssOrderModal.flex}>
                <div
                    id={
                        addressType === 'billing'
                            ? BILLING_ADDRESS_DROPDOWN_ID
                            : SHIPPING_ADDRESS_DROPDOWN_ID
                    }
                    className={css.dropdown}
                >
                    <SelectInputBox
                        className={classnames({
                            [cssOrderModal.disabled]: isDisabled,
                        })}
                        ref={selectRef}
                        hasError={hasError}
                        floating={floatingSelectRef}
                        onToggle={setIsSelectOpen}
                        placeholder={'Select from address book...'}
                        label={getOneLineAddress({
                            addressObj: selectedAddress,
                        })}
                    >
                        <SelectInputBoxContext.Consumer>
                            {(context) => (
                                <Dropdown
                                    target={selectRef}
                                    ref={floatingSelectRef}
                                    isOpen={isSelectOpen}
                                    onToggle={() => context!.onBlur()}
                                    contained
                                >
                                    <DropdownBody
                                        className={css.addressDropDown}
                                    >
                                        {!availableAddresses?.length ? (
                                            <DropdownItem
                                                option={{
                                                    label: 'No results',
                                                    value: 'No results',
                                                }}
                                                onClick={() => null}
                                            />
                                        ) : (
                                            <AddressesDropdownItems
                                                availableAddresses={
                                                    availableAddresses
                                                }
                                                onSelectAddress={
                                                    onSelectAddress
                                                }
                                                addressType={addressType}
                                                customerEmail={customerEmail}
                                            />
                                        )}
                                    </DropdownBody>
                                </Dropdown>
                            )}
                        </SelectInputBoxContext.Consumer>
                    </SelectInputBox>
                </div>
                {isDisabled && (
                    <Tooltip
                        target={
                            addressType === 'billing'
                                ? BILLING_ADDRESS_DROPDOWN_ID
                                : SHIPPING_ADDRESS_DROPDOWN_ID
                        }
                    >
                        Set currency to select the address.
                    </Tooltip>
                )}
                <CustomAddressModal
                    currencyCode={currencyCode}
                    isOpen={isCustomAddressModalOpen}
                    integrationId={integrationId}
                    customerId={customerId}
                    onOpen={() => setIsCustomAddressModalOpen(true)}
                    onClose={() => setIsCustomAddressModalOpen(false)}
                    onAddCustomAddress={onSelectAddress}
                    addressType={addressType}
                    customerEmail={customerEmail}
                />
            </div>
            {hasError && (
                <p
                    className={classnames(cssOrderModal.caption, {
                        [cssOrderModal.hasError]: hasError,
                    })}
                >
                    {errorMessage}
                </p>
            )}
        </>
    )
}
