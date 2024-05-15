import React, {useState} from 'react'
import classnames from 'classnames'
import {CustomerSearchResponseDataItem} from '@gorgias/api-queries'
import {searchCustomers} from 'models/customer/resources'
import Button from 'pages/common/components/button/Button'
import TextInput from 'pages/common/forms/input/TextInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {PlaygroundEditor} from '../PlaygroundEditor/PlaygroundEditor'
import {mockCustomerData} from '../../utils/new-customer-playground.util'
import css from './PlaygroundInputStep.less'

export type FormValues = {
    subject: string
    message: string
    customerEmail: string
}

export type AdditionalValues = {
    customerName: string
    existingCustomerFound: boolean | undefined
}

const initialFormValues: FormValues = {
    subject: '',
    message: '',
    customerEmail: mockCustomerData.address,
}

enum SenderTypeValues {
    NEW_CUSTOMER = 'new-customer',
    EXISTING_CUSTOMER = 'existing-customer',
}

const senderSelectOptions = [
    {
        value: SenderTypeValues.NEW_CUSTOMER,
        label: 'New customer',
    },
    {
        value: SenderTypeValues.EXISTING_CUSTOMER,
        label: 'Existing customer',
    },
]

type Props = {
    handleSubmit: (
        formValues: FormValues,
        additionalValues: AdditionalValues
    ) => void
    isDisabled: boolean
    handleNewCustomerSelected: (value: boolean) => void
}

export const PlaygroundInputStep = ({
    handleSubmit,
    isDisabled,
    handleNewCustomerSelected,
}: Props) => {
    const [formValues, setFormValues] = useState<FormValues>(initialFormValues)
    const [senderSelectedOption, setSenderSelectedOption] = useState<string>(
        SenderTypeValues.NEW_CUSTOMER
    )
    const [isFormValid, setIsFormValid] = useState<boolean>(false)

    const handleFormChange = (key: keyof FormValues) => (value: string) => {
        setFormValues({
            ...formValues,
            [key]: value,
        })

        switch (key) {
            case 'message':
                if (
                    value.trim().length > 0 &&
                    formValues.customerEmail.trim().length > 0
                ) {
                    setIsFormValid(true)
                } else {
                    setIsFormValid(false)
                }
                break
            case 'customerEmail':
                if (
                    value.trim().length > 0 &&
                    formValues.message.trim().length > 0
                ) {
                    setIsFormValid(true)
                } else {
                    setIsFormValid(false)
                }
                break
        }
    }

    const handleInputStepSubmit = async () => {
        let customerName: string
        let existingCustomerFound: boolean | undefined

        // If we are using the new customer option, we use the mock data
        if (senderSelectedOption === SenderTypeValues.NEW_CUSTOMER) {
            customerName = mockCustomerData.name
        } else {
            // Get the customer information to populate its name in the chat
            const selectedCustomer = await searchCustomers({
                search: formValues.customerEmail,
                limit: 1,
            })

            if (
                selectedCustomer.data.data &&
                selectedCustomer.data.data.length
            ) {
                existingCustomerFound = true
                customerName =
                    // If we don't have a name, we use the email
                    (
                        selectedCustomer.data
                            .data[0] as CustomerSearchResponseDataItem
                    ).name ?? formValues.customerEmail
            } else {
                customerName = formValues.customerEmail
                existingCustomerFound = false
            }
        }

        handleSubmit(formValues, {
            customerName: customerName,
            existingCustomerFound,
        })
    }

    const onClear = () => {
        setFormValues({
            ...initialFormValues,
            customerEmail: '',
        })
    }

    return (
        <div
            className={classnames(
                css.container,
                isDisabled && css.formDisabled
            )}
        >
            <div className={css.innerContainer}>
                <div className={css.itemContainer}>
                    <SelectField
                        fullWidth
                        showSelectedOption
                        value={senderSelectedOption}
                        onChange={(value) => {
                            setSenderSelectedOption(value as string)
                            if (value === SenderTypeValues.NEW_CUSTOMER) {
                                handleNewCustomerSelected(true)
                                handleFormChange('customerEmail')(
                                    mockCustomerData.address
                                )
                            } else {
                                handleNewCustomerSelected(false)
                                handleFormChange('customerEmail')('')
                            }
                        }}
                        options={senderSelectOptions}
                        dropdownMenuClassName={css.longDropdown}
                    />
                    {senderSelectedOption ===
                        SenderTypeValues.EXISTING_CUSTOMER && (
                        <TextInput
                            className={css.customerEmailInput}
                            value={formValues.customerEmail}
                            onChange={handleFormChange('customerEmail')}
                            placeholder="Customer email"
                        />
                    )}
                </div>
                <div className={css.itemContainer}>
                    <TextInput
                        className={css.subjectInput}
                        value={formValues.subject}
                        onChange={handleFormChange('subject')}
                        maxLength={135}
                        prefix={
                            <span className="body-semibold">Subject: </span>
                        }
                    />
                </div>
                <div className={css.itemContainer}>
                    <PlaygroundEditor
                        value={formValues.message}
                        onChange={handleFormChange('message')}
                    />
                </div>

                <div className={css.submitContainer}>
                    <Button
                        isDisabled={!isFormValid}
                        onClick={handleInputStepSubmit}
                    >
                        Submit
                    </Button>
                    <Button intent="secondary" onClick={onClear}>
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    )
}
