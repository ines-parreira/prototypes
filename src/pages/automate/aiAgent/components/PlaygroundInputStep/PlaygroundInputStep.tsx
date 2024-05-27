import React, {useState} from 'react'
import {UseMutateFunction} from '@tanstack/react-query'
import {AxiosResponse} from 'axios'
import classnames from 'classnames'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {
    AccountConfigurationWithHttpIntegration,
    StoreConfiguration,
} from 'models/aiAgent/types'
import {
    AiAgentResponse,
    CreatePlaygroundRequest,
    MessageType,
    PlaygroundMessage,
    PlaygroundStep,
} from 'models/aiAgentPlayground/types'
import {searchCustomers} from 'models/customer/resources'
import Button from 'pages/common/components/button/Button'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Value} from 'pages/common/forms/SelectField/types'
import TextInput from 'pages/common/forms/input/TextInput'
import {reportError} from 'utils/errors'
import {CustomerHttpIntegrationDataMock} from '../../constants'
import {PlaygroundEditor} from '../PlaygroundEditor/PlaygroundEditor'
import {
    AI_AGENT_SENDER,
    PlaygroundGenericErrorMessage,
} from '../PlaygroundMessage/PlaygroundMessage'
import {CustomerSearchDropdownSelectView} from '../CustomerSearchDropdownSelect/CustomerSearchDropdownSelectView'
import css from './PlaygroundInputStep.less'

enum SenderTypeValues {
    NEW_CUSTOMER = 'new-customer',
    EXISTING_CUSTOMER = 'existing-customer',
}

type FormValues = {
    subject: string
    message: string
    customerEmail: string
}

type FormValuesValidity = {
    message: boolean
    customerEmail: boolean
}

type Props = {
    isDisabled: boolean
    setSubject: (value: string) => void
    setMessages: (messages: PlaygroundMessage[]) => void
    setStep: (step: PlaygroundStep) => void
    submitPlaygroundTicket: UseMutateFunction<
        AxiosResponse<AiAgentResponse, any>,
        Record<string, unknown>,
        [body: CreatePlaygroundRequest],
        unknown
    >
    accountData: AccountConfigurationWithHttpIntegration
    storeData: StoreConfiguration
}

type Control = {
    clear: () => void
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

const initialFormValues: FormValues = {
    subject: '',
    message: '',
    customerEmail: CustomerHttpIntegrationDataMock.address,
}

export const PlaygroundInputStep = ({
    isDisabled,
    setSubject,
    setMessages,
    setStep,
    submitPlaygroundTicket,
    accountData,
    storeData,
}: Props) => {
    const [formValues, setFormValues] = useState<FormValues>(initialFormValues)
    const [senderSelectedOption, setSenderSelectedOption] = useState<string>(
        SenderTypeValues.NEW_CUSTOMER
    )
    const childControlRef = React.createRef<Control>()

    const validateFormValues = (formValues: FormValues) => {
        const formValuesValidity: FormValuesValidity = {
            message: formValues.message.length > 0,
            customerEmail:
                senderSelectedOption === SenderTypeValues.NEW_CUSTOMER ||
                formValues.customerEmail.length > 0,
        }

        return Object.values(formValuesValidity).every((value) => value)
    }

    const isFormValid = validateFormValues(formValues)

    const handleSenderSelectChange = (value: Value) => {
        if (typeof value !== 'string') {
            return
        }
        setSenderSelectedOption(value)
        if (value === SenderTypeValues.NEW_CUSTOMER) {
            handleFormChange('customerEmail')(
                CustomerHttpIntegrationDataMock.address
            )
        } else {
            handleFormChange('customerEmail')('')
        }
    }

    const handleFormChange = (key: keyof FormValues) => (value: string) => {
        setFormValues({
            ...formValues,
            [key]: value,
        })
    }

    const handleSubmit = async () => {
        const newMessagesThread: PlaygroundMessage[] = []
        const subject = formValues.subject.trim()
        const message = formValues.message.trim()
        let customerName: string = formValues.customerEmail
        let isCustomerFound = false
        let unexpectedError = false

        // If we are using the new customer option, we use the mock data
        if (senderSelectedOption === SenderTypeValues.NEW_CUSTOMER) {
            customerName = CustomerHttpIntegrationDataMock.name
            isCustomerFound = true
        } else {
            // Get the customer information to populate its name in the chat
            try {
                const selectedCustomer = await searchCustomers({
                    search: formValues.customerEmail,
                    limit: 1,
                })

                if (
                    selectedCustomer.data.data &&
                    selectedCustomer.data.data.length
                ) {
                    isCustomerFound = true
                    const foundCustomer = selectedCustomer.data.data[0]
                    customerName =
                        foundCustomer &&
                        'name' in foundCustomer &&
                        foundCustomer.name
                            ? foundCustomer.name
                            : formValues.customerEmail
                } else {
                    isCustomerFound = false
                }
            } catch (e) {
                // use report error to log the error
                unexpectedError = true
                reportError(e, {
                    extra: {
                        context:
                            'Error during account fetching in playground input step.',
                        tags: [AI_AGENT_SENTRY_TEAM],
                    },
                })
            }
        }

        if (unexpectedError) {
            // Only display an error message from the ai agent
            newMessagesThread.push({
                sender: AI_AGENT_SENDER,
                type: MessageType.ERROR,
                message: (
                    <PlaygroundGenericErrorMessage
                        onClick={() => setStep(PlaygroundStep.INPUT)}
                    />
                ),
            })
        } else {
            // Push the customer message
            newMessagesThread.push({
                sender: customerName,
                type: MessageType.MESSAGE,
                message,
            })

            if (isCustomerFound === false) {
                newMessagesThread.push({
                    sender: AI_AGENT_SENDER,
                    type: MessageType.ERROR,
                    message: 'No customer account was found for that email.',
                })
            } else {
                submitPlaygroundTicket([
                    {
                        use_mock_context:
                            senderSelectedOption ===
                            SenderTypeValues.NEW_CUSTOMER,
                        domain: accountData.gorgiasDomain,
                        customer_email: formValues.customerEmail,
                        body_text: message,
                        http_integration_id:
                            // HttpIntegration is asserted here as parent component checks for it's existence
                            accountData.httpIntegration.id,
                        account_id: accountData.accountId,
                        email_integration_id:
                            storeData.monitoredEmailIntegrations[0].id,
                        email_integration_address:
                            storeData.monitoredEmailIntegrations[0].email,
                    },
                ])

                // Show a ai agent processing message during the request
                newMessagesThread.push({
                    sender: AI_AGENT_SENDER,
                    type: MessageType.MESSAGE,
                })
            }

            setSubject(subject)
            setMessages(newMessagesThread)
            setStep(PlaygroundStep.OUTPUT)
        }
    }

    const onClear = () => {
        setFormValues({
            ...initialFormValues,
            customerEmail: '',
        })
        childControlRef.current?.clear()
    }

    return (
        <>
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
                            onChange={handleSenderSelectChange}
                            options={senderSelectOptions}
                            dropdownMenuClassName={css.longDropdown}
                        />
                        {senderSelectedOption ===
                            SenderTypeValues.EXISTING_CUSTOMER && (
                            <CustomerSearchDropdownSelectView
                                className={css.customerSearch}
                                onSelect={handleFormChange('customerEmail')}
                                ref={childControlRef}
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
                            onClick={handleSubmit}
                        >
                            Submit
                        </Button>
                        <Button intent="secondary" onClick={onClear}>
                            Clear
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
