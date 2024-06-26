import React, {useRef, useState} from 'react'
import classnames from 'classnames'
import {Label} from '@gorgias/ui-kit'

import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import css from './AddressesDropdown.less'
import cssOrderModal from './OrderModal.less'

type Props = {
    availableCurrencies?: string[]
    currency?: string
    setCurrency: (value: string) => void
    isDisabled?: boolean
}
export function CurrencyPickerDropdown({
    availableCurrencies,
    currency,
    setCurrency,
    isDisabled = false,
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
                isDisabled={isDisabled}
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
