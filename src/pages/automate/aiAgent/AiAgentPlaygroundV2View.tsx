import React, {useEffect, useRef, useState} from 'react'
import axios, {isAxiosError} from 'axios'
import {Link, Redirect, useParams} from 'react-router-dom'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {
    useGetAccountConfiguration,
    useGetStoreConfigurationPure,
    useSubmitPlaygroundTicket,
} from 'models/aiAgent/queries'
import {
    MessageType,
    PlaygroundMessage,
    ProcessingStatus,
} from 'models/aiAgentPlayground/types'
import Button from 'pages/common/components/button/Button'
import {notify} from 'state/notifications/actions'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import useAppDispatch from 'hooks/useAppDispatch'
import {NotificationStatus} from 'state/notifications/types'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {AI_AGENT_SENDER} from './components/PlaygroundMessage/PlaygroundMessage'
import {
    FormValues,
    AdditionalValues,
    PlaygroundInputStep,
} from './components/PlaygroundInputStep/PlaygroundInputStep'
import {PlaygroundOutputStep} from './components/PlaygroundOutputStep/PlaygroundOutputStep'
import css from './AiAgentPlaygroundV2View.less'

enum PlaygroundStep {
    INPUT = 'input',
    OUTPUT = 'output',
}

export const AiAgentPlaygroundV2View = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const dispatch = useAppDispatch()
    const {routes} = useAiAgentNavigation({shopName})
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const [step, setStep] = useState(PlaygroundStep.INPUT)
    const [messages, setMessages] = useState<PlaygroundMessage[]>([])
    const [subject, setSubject] = useState<string | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [newCustomerSelected, setNewCustomerSelected] = useState(true)
    const [
        storeConfigurationNotInitialized,
        setStoreConfigurationNotInitialized,
    ] = useState(false)

    const messagesRef = useRef<PlaygroundMessage[]>([])

    useEffect(() => {
        messagesRef.current = messages
    }, [messages])

    const {
        error: storeFetchError,
        data: storeData,
        isLoading: storeDataLoading,
    } = useGetStoreConfigurationPure(
        {
            accountDomain,
            storeName: shopName,
        },
        {retry: 1, refetchOnWindowFocus: false}
    )

    const {
        error: accountFetchError,
        data: accountData,
        isLoading: accountDataLoading,
    } = useGetAccountConfiguration(accountDomain, {
        retry: 1,
        refetchOnWindowFocus: false,
    })

    const {mutate: submitPlaygroundTicket, isLoading: isSubmitting} =
        useSubmitPlaygroundTicket({
            onError: (error) => {
                const messages = messagesRef.current
                const updatedMessages = [messages[0]]

                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 404
                ) {
                    updatedMessages.push({
                        sender: AI_AGENT_SENDER,
                        type: MessageType.ERROR,
                        message: 'No customer account was found for that email',
                    })
                } else {
                    updatedMessages.push({
                        sender: AI_AGENT_SENDER,
                        type: MessageType.ERROR,
                        message: (
                            <div className={css.errorMessageText}>
                                AI Agent encountered an error and didn’t send a
                                response.
                                <span
                                    className={css.errorMessageLink}
                                    onClick={() => {
                                        handleReset()
                                    }}
                                >
                                    Try again
                                </span>
                            </div>
                        ),
                    })
                }

                setMessages(updatedMessages)
            },
            onSuccess: (aiAgentResponse) => {
                const currentMessages = messagesRef.current // Use ref to access current messages
                const updatedMessages = [...currentMessages.slice(0, -1)]

                // If the AI Agent response is valid, push output to message thread
                if (
                    aiAgentResponse.data.generate.output.generated_message &&
                    aiAgentResponse.data.qa.output.validate_generated_message
                ) {
                    updatedMessages.push({
                        sender: AI_AGENT_SENDER,
                        type: MessageType.MESSAGE,
                        message:
                            aiAgentResponse.data.generate.output
                                .generated_message,
                    })
                }
                // If the AI Agent response is invalid, only show internal note
                updatedMessages.push({
                    sender: AI_AGENT_SENDER,
                    type: MessageType.INTERNAL_NOTE,
                    message: aiAgentResponse.data.postProcessing.internalNote,
                })

                // Add a ticket event message if outcome is also validated
                if (aiAgentResponse.data.qa.output.validate_outcome) {
                    updatedMessages.push({
                        sender: AI_AGENT_SENDER,
                        type: MessageType.TICKET_EVENT,
                        outcome: aiAgentResponse.data.generate.output.outcome,
                    })
                }

                setMessages(updatedMessages)
            },
        })

    const aiAgentProcessingStatusUpdate = (
        newStatus: ProcessingStatus,
        delay: number
    ) => {
        setTimeout(() => {
            setMessages((currentMessages) => {
                return currentMessages.map((msg, index) => {
                    if (index === currentMessages.length - 1) {
                        return {...msg, processingStatus: newStatus}
                    }
                    return msg
                })
            })
        }, delay)
    }

    const handleSubmit = (
        formValues: FormValues,
        {customerName}: AdditionalValues
    ) => {
        submitPlaygroundTicket([
            {
                new_customer_email: newCustomerSelected,
                domain: accountDomain,
                customer_email: formValues.customerEmail,
                body_text: formValues.message,
                http_integration_id:
                    //asserting this property existence as we are checking above that it exists once account data is loaded
                    accountData!.data.accountConfiguration.httpIntegration!.id,
                account_id: currentAccount.get('id'),
                email_integration_id:
                    storeData!.data.storeConfiguration
                        .monitoredEmailIntegrations[0].id,
                email_integration_address:
                    storeData!.data.storeConfiguration
                        .monitoredEmailIntegrations[0].email,
            },
        ])
        // While ai agent is processing, show the user's message and a processing status
        setSubject(formValues.subject)
        setMessages([
            {
                sender: customerName,
                type: MessageType.MESSAGE,
                message: formValues.message,
            },
            {
                sender: AI_AGENT_SENDER,
                type: MessageType.MESSAGE,
                processingStatus: ProcessingStatus.CHECKING_PERMISSIONS,
            },
        ])
        setStep(PlaygroundStep.OUTPUT)
        // Fake processing status updates
        aiAgentProcessingStatusUpdate(ProcessingStatus.SUMMARIZING, 5000)
        aiAgentProcessingStatusUpdate(ProcessingStatus.GATHERING_INFO, 10000)
        aiAgentProcessingStatusUpdate(ProcessingStatus.GENERATING, 15000)
    }

    const handleReset = () => {
        setMessages([])
        setFormError(null)
        setNewCustomerSelected(true)
        setStep(PlaygroundStep.INPUT)
        setSubject(null)
    }

    if (
        (storeFetchError || accountFetchError) &&
        !storeConfigurationNotInitialized
    ) {
        if (
            (isAxiosError(storeFetchError) &&
                storeFetchError.response?.status === 404) ||
            (isAxiosError(accountFetchError) &&
                accountFetchError.response?.status === 404)
        ) {
            setStoreConfigurationNotInitialized(true)
        } else {
            return <Redirect to="/app/automation" />
        }
    }

    if (storeDataLoading || accountDataLoading) {
        return <Loader />
    }

    if (
        accountData &&
        storeData &&
        !accountData.data.accountConfiguration.httpIntegration
    ) {
        void dispatch(
            notify({
                message:
                    'There was an error initializing the AI Agent Playground',
                status: NotificationStatus.Error,
            })
        )
        return <Redirect to="/app/automation" />
    }

    const actions = (
        <Button
            intent="primary"
            onClick={handleReset}
            isDisabled={isSubmitting}
        >
            Reset
        </Button>
    )

    return (
        <div className={css.container}>
            <div>
                <h1 className="heading-section-semibold">Test your AI Agent</h1>
                <p className="mb-0">
                    Here you can test how your AI Agent would reply to inquiries
                    from real customers. You can choose one of your customer’s
                    email addresses to check how the AI Agent would reply to
                    each person.
                </p>
            </div>

            {step === PlaygroundStep.INPUT ? (
                <div>
                    {storeConfigurationNotInitialized && (
                        <Alert
                            icon
                            type={AlertType.Warning}
                            className={css.formError}
                        >
                            Please configure your{' '}
                            <Link to={routes.configuration}>
                                AI Agent settings{' '}
                            </Link>
                            first.
                        </Alert>
                    )}
                    {formError && (
                        <Alert type={AlertType.Error} className={css.formError}>
                            {formError}
                        </Alert>
                    )}
                    <PlaygroundInputStep
                        handleSubmit={handleSubmit}
                        isDisabled={!!storeConfigurationNotInitialized}
                        handleNewCustomerSelected={(value: boolean) => {
                            setNewCustomerSelected(value)
                        }}
                    />
                </div>
            ) : (
                <div>
                    <PlaygroundOutputStep
                        messages={messages}
                        actions={actions}
                        subject={subject}
                    />
                </div>
            )}
        </div>
    )
}
