import { useEffect, useRef, useState } from 'react'

import { LegacyIconButton as IconButton, Label } from '@gorgias/axiom'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownSection from 'pages/common/components/dropdown/DropdownSection'
import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import usePhoneDeviceDialerInput from 'pages/integrations/integration/components/phone/usePhoneDeviceDialerInput'

import PhoneSearchResultsContent from './PhoneSearchResultsContent'

import css from './PhoneSelectField.less'

type Props = {
    value?: string
    onChange: (value: string) => void
    label: string
}

export default function PhoneSelectField({ value, onChange, label }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const {
        inputValue,
        selectedCustomer,
        highlightedResultIndex,
        isSearchTypeCustomer,
        isSearchingCustomers,
        phoneNumberInputRef,
        textInputRef,
        customers,
        handleChange,
        handleSelectCustomer,
        handleInputKeyDown,
        phoneNumberError,
    } = usePhoneDeviceDialerInput({
        onValueChange: onChange,
        onCustomerEnter: () => {},
        initialValue: value || '',
    })

    const isLoading = isSearchTypeCustomer && isSearchingCustomers

    // Update dropdown state when conditions change
    useEffect(() => {
        const shouldBeOpen =
            !selectedCustomer &&
            !!inputValue &&
            (isSearchTypeCustomer || customers?.length > 0)
        setIsDropdownOpen(shouldBeOpen)
    }, [selectedCustomer, inputValue, isSearchTypeCustomer, customers?.length])

    return (
        <>
            <div ref={inputRef} className={css.inputWrapper}>
                <Label>{label}</Label>
                {isSearchTypeCustomer || selectedCustomer ? (
                    <TextInput
                        ref={textInputRef}
                        prefix={<IconInput icon="search" />}
                        suffix={
                            <IconButton
                                onClick={() => handleChange('')}
                                fillStyle="ghost"
                                intent="secondary"
                                icon="close"
                            />
                        }
                        value={
                            selectedCustomer
                                ? selectedCustomer.customer.name ||
                                  selectedCustomer.address
                                : inputValue
                        }
                        onChange={handleChange}
                        autoFocus
                        className={css.dialpadInput}
                        onKeyDown={handleInputKeyDown}
                        hasError={!selectedCustomer}
                    />
                ) : (
                    <PhoneNumberInput
                        onChange={handleChange}
                        onLetterEntered={handleChange}
                        value={inputValue}
                        error={phoneNumberError}
                        autoFocus
                        className={css.dialpadInput}
                        isClearable
                        isLoading={isSearchingCustomers}
                        ref={phoneNumberInputRef}
                        onKeyDown={handleInputKeyDown}
                    />
                )}
            </div>

            <Dropdown
                isOpen={isDropdownOpen}
                target={inputRef}
                root={inputRef?.current?.parentElement ?? undefined}
                onToggle={(isOpen) => setIsDropdownOpen(isOpen)}
            >
                <DropdownBody>
                    <DropdownSection title={'Customers'}>
                        <PhoneSearchResultsContent
                            results={customers}
                            isLoading={isLoading}
                            isSearchTypeCustomer={isSearchTypeCustomer}
                            onCustomerSelect={handleSelectCustomer}
                            highlightedResultIndex={highlightedResultIndex}
                            className={css.dropdownBody}
                        />
                    </DropdownSection>
                </DropdownBody>
            </Dropdown>
        </>
    )
}
