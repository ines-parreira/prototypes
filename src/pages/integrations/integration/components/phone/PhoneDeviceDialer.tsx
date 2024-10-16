import React from 'react'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'

import css from './PhoneDevice.less'
import PhoneDeviceDialerBody from './PhoneDeviceDialerBody'
import PhoneDeviceDialerIntegrationSelect from './PhoneDeviceDialerIntegrationSelect'
import usePhoneDeviceDialer from './usePhoneDeviceDialer'

type Props = {
    onCallInitiated: () => void
}

export default function PhoneDeviceDialer({onCallInitiated}: Props) {
    const {
        inputValue,
        handleChange,
        isSearchTypeCustomer,
        isSearchingCustomers,
        customers,
        selectedCustomer,
        highlightedResultIndex,
        selectedIntegration,
        setSelectedIntegration,
        isCallButtonDisabled,
        handleCallClick,
        phoneNumberInputError,
        phoneNumberInputRef,
        textInputRef,
        phoneIntegrations,
        handleSelectCustomer,
        handleInputKeyDown,
    } = usePhoneDeviceDialer({onCallInitiated})

    return (
        <div className={css.dialerWrapper}>
            {isSearchTypeCustomer || selectedCustomer ? (
                <TextInput
                    ref={textInputRef}
                    prefix={
                        <IconInput className={css.prefixIcon} icon="person" />
                    }
                    suffix={
                        <IconButton
                            onClick={() => handleChange('')}
                            fillStyle="ghost"
                            intent="secondary"
                        >
                            close
                        </IconButton>
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
                />
            ) : (
                <PhoneNumberInput
                    onChange={handleChange}
                    onLetterEntered={handleChange}
                    value={inputValue}
                    error={phoneNumberInputError}
                    autoFocus
                    className={css.dialpadInput}
                    isClearable
                    isLoading={isSearchingCustomers}
                    ref={phoneNumberInputRef}
                    onKeyDown={handleInputKeyDown}
                />
            )}

            <PhoneDeviceDialerBody
                value={inputValue}
                onChange={(value) => {
                    phoneNumberInputRef.current?.onChange(value)
                }}
                results={customers}
                isLoading={isSearchTypeCustomer && isSearchingCustomers}
                isSearchTypeCustomer={isSearchTypeCustomer}
                selectedCustomer={selectedCustomer}
                onCustomerSelect={handleSelectCustomer}
                highlightedResultIndex={highlightedResultIndex}
            />

            <div className={css.buttons}>
                <PhoneDeviceDialerIntegrationSelect
                    value={selectedIntegration}
                    options={phoneIntegrations}
                    onChange={setSelectedIntegration}
                />
                <Button
                    onClick={handleCallClick}
                    isDisabled={isCallButtonDisabled}
                >
                    Call
                </Button>
            </div>
        </div>
    )
}
