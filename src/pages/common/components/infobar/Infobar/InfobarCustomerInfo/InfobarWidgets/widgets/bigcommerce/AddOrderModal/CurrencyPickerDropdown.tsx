import React, {useRef, useState} from 'react'
import classnames from 'classnames'
import Label from 'pages/common/forms/Label/Label'

import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import css from './ShippingAddressesDropdown.less'
import cssOrderModal from './OrderModal.less'

type Props = {
    className?: string
    availableCurrencies?: string[]
    currency?: string
    setCurrency: (value: string) => void
}
export function CurrencyPickerDropdown({
    availableCurrencies,
    currency,
    setCurrency,
}: Props) {
    const selectRef = useRef(null)
    const floatingSelectRef = useRef(null)
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    if (!availableCurrencies) {
        return null
    }
    return (
        <>
            <p className="heading-section-semibold">Billing</p>
            <Label className={cssOrderModal.label} isRequired>
                Currency
            </Label>
            <SelectInputBox
                className={classnames({
                    [cssOrderModal.disabled]: currency,
                })}
                ref={selectRef}
                floating={floatingSelectRef}
                onToggle={setIsSelectOpen}
                placeholder={'Select currency'}
                label={currency}
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
                                <>
                                    {availableCurrencies.map((currency) => (
                                        <DropdownItem
                                            key={currency}
                                            autoFocus
                                            shouldCloseOnSelect
                                            className={css.addressItem}
                                            option={{
                                                label: currency,
                                                value: currency,
                                            }}
                                            onClick={() => {
                                                setCurrency(currency)
                                            }}
                                        ></DropdownItem>
                                    ))}
                                </>
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        </>
    )
}
