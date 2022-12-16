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
import {buildAddressComponent, getOneLineAddress} from './utils'

import css from './ShippingAddressesDropdown.less'
import cssOrderModal from './OrderModal.less'

type Props = {
    shippingAddress: Maybe<BigCommerceCustomerAddress>
    shippingAddresses: BigCommerceCustomerAddress[]
    onSelectAddress: (
        selectedAddress: BigCommerceCustomerAddress
    ) => Promise<void>
    hasError?: boolean
}

export function ShippingAddressesDropdown({
    shippingAddress,
    shippingAddresses,
    onSelectAddress,
    hasError = false,
}: Props) {
    const selectRef = useRef(null)
    const floatingSelectRef = useRef(null)
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    return (
        <div>
            <p className={`${cssOrderModal.subsection} mt-4`}>Fulfillment</p>
            <Label
                className={`${cssOrderModal.subsectionSmall} mb-2`}
                isRequired
            >
                Shipping address
            </Label>
            <SelectInputBox
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
                                                    className={css.addressItem}
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
                                                        {address.phone && (
                                                            <>
                                                                {address.phone}
                                                                <br />
                                                            </>
                                                        )}
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
                                                            {address.country}
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
            <p
                className={classnames(cssOrderModal.infoText, {
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
