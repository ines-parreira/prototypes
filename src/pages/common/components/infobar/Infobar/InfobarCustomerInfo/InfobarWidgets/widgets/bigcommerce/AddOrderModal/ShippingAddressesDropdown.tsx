import React, {useRef, useState} from 'react'
import classnames from 'classnames'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Label from 'pages/common/forms/Label/Label'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import {BigCommerceCustomerAddress} from 'models/integration/types'
import Tooltip from 'pages/common/components/Tooltip'
import {buildAddressComponent, getOneLineAddress} from './utils'

import css from './ShippingAddressesDropdown.less'
import cssOrderModal from './OrderModal.less'

const SHIPPING_ADDRESS_DROPDOWN_ID = 'shipping-address-dropdown'

type Props = {
    className?: string
    shippingAddress: Maybe<BigCommerceCustomerAddress>
    shippingAddresses: BigCommerceCustomerAddress[]
    onSelectAddress: (
        selectedAddress: BigCommerceCustomerAddress
    ) => Promise<void>
    hasError?: boolean
    isDisabled?: boolean
}

export function ShippingAddressesDropdown({
    shippingAddress,
    shippingAddresses,
    onSelectAddress,
    hasError = false,
    isDisabled = false,
}: Props) {
    const selectRef = useRef(null)
    const floatingSelectRef = useRef(null)
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    return (
        <div>
            <p className="heading-section-semibold mt-4">Fulfillment</p>
            <Label className={cssOrderModal.label} isRequired>
                Shipping address
            </Label>
            <div id={SHIPPING_ADDRESS_DROPDOWN_ID}>
                <SelectInputBox
                    className={classnames({
                        [cssOrderModal.disabled]: isDisabled,
                    })}
                    ref={selectRef}
                    hasError={hasError}
                    floating={floatingSelectRef}
                    onToggle={setIsSelectOpen}
                    placeholder={'Select from address book...'}
                    label={getOneLineAddress({addressObj: shippingAddress})}
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
                                <DropdownBody className={css.addressDropDown}>
                                    {!shippingAddresses?.length ? (
                                        <DropdownItem
                                            option={{
                                                label: 'No results',
                                                value: 'No results',
                                            }}
                                            onClick={() => null}
                                        />
                                    ) : (
                                        <>
                                            {shippingAddresses.map(
                                                (address, index) => (
                                                    <DropdownItem
                                                        key={index}
                                                        autoFocus
                                                        shouldCloseOnSelect
                                                        className={
                                                            css.addressItem
                                                        }
                                                        option={{
                                                            label: address.address1,
                                                            value: address.address1,
                                                        }}
                                                        onClick={() => {
                                                            void onSelectAddress(
                                                                address
                                                            )
                                                        }}
                                                    >
                                                        <div
                                                            className={
                                                                css.addressLine
                                                            }
                                                        >
                                                            <b>{`${address.first_name} ${address.last_name}`}</b>
                                                            <br />
                                                            <>
                                                                {address.address2
                                                                    ? `${address.address1}, ${address.address2}`
                                                                    : address.address1}
                                                                <br />
                                                            </>
                                                            <>
                                                                {buildAddressComponent(
                                                                    {
                                                                        addressObj:
                                                                            address,
                                                                        includeCountry:
                                                                            false,
                                                                    }
                                                                )}
                                                                <br />
                                                                {
                                                                    address.country
                                                                }
                                                                <br />
                                                                {address.phone && (
                                                                    <>
                                                                        {
                                                                            address.phone
                                                                        }
                                                                        <br />
                                                                    </>
                                                                )}
                                                            </>
                                                        </div>
                                                    </DropdownItem>
                                                )
                                            )}
                                        </>
                                    )}
                                </DropdownBody>
                            </Dropdown>
                        )}
                    </SelectInputBoxContext.Consumer>
                </SelectInputBox>
            </div>
            {isDisabled && (
                <Tooltip target={SHIPPING_ADDRESS_DROPDOWN_ID}>
                    Set currency to select the address.
                </Tooltip>
            )}
            <p
                className={classnames(cssOrderModal.caption, {
                    [cssOrderModal.hasError]: hasError,
                })}
            >
                {hasError
                    ? 'Please fill out this field.'
                    : 'Same address will be used for billing address.'}
            </p>
        </div>
    )
}
