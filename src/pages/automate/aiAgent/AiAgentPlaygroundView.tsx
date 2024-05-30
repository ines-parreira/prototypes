import React, {useEffect, useMemo, useRef, useState} from 'react'
import {Link, Redirect, useLocation, useParams} from 'react-router-dom'
import {isAxiosError} from 'axios'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    useGetAccountConfiguration,
    useGetStoreConfigurationPure,
    useSubmitPlaygroundTicket,
} from 'models/aiAgent/queries'
import {
    AccountConfigurationWithHttpIntegration,
    StoreConfiguration,
} from 'models/aiAgent/types'
import {
    AiAgentResponse,
    MessageType,
    PlaygroundMessage,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'
import css from './AiAgentPlaygroundView.less'
import {PlaygroundInputStep} from './components/PlaygroundInputStep/PlaygroundInputStep'
import {
    AI_AGENT_SENDER,
    PlaygroundGenericErrorMessage,
} from './components/PlaygroundMessage/PlaygroundMessage'
import {PlaygroundOutputStep} from './components/PlaygroundOutputStep/PlaygroundOutputStep'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {CustomerHttpIntegrationDataMock} from './constants'

enum PlaygroundStep {
    INPUT = 'input',
    OUTPUT = 'output',
}

type UrlParams = {
    shopName: string
}

const shouldAiAgentResponseDisplay = (
    aiAgentResponse: AiAgentResponse,
    storeData: StoreConfiguration
) => {
    const isHandover =
        aiAgentResponse.generate.output.outcome === TicketOutcome.HANDOVER
    const isSilentHandover = storeData.silentHandover
    const hasHtmlReply = aiAgentResponse.postProcessing.htmlReply

    return (isHandover && !isSilentHandover) || (!isHandover && hasHtmlReply)
}

export const AiAgentPlaygroundView = () => {
    const {shopName} = useParams<UrlParams>()
    const {search} = useLocation()
    const params = useMemo(() => new URLSearchParams(search), [search])

    const initialInputValues = {
        subject: params.get('subject') ?? '',
        message: params.get('message') ?? '',
        customerEmail:
            params.get('customer_email') ??
            CustomerHttpIntegrationDataMock.address,
    }

    const dispatch = useAppDispatch()
    const {routes} = useAiAgentNavigation({shopName})

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const [step, setStep] = useState(PlaygroundStep.INPUT)
    const [messages, setMessages] = useState<PlaygroundMessage[]>([])
    const [subject, setSubject] = useState<string | null>(null)
    const [
        storeConfigurationNotInitialized,
        setStoreConfigurationNotInitialized,
    ] = useState(false)

    const messagesRef = useRef<PlaygroundMessage[]>([])

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
            onError: () => {
                const messages = messagesRef.current
                const updatedMessages = [messages[0]]

                updatedMessages.push({
                    sender: AI_AGENT_SENDER,
                    type: MessageType.ERROR,
                    message: (
                        <PlaygroundGenericErrorMessage
                            onClick={() => setStep(PlaygroundStep.INPUT)}
                        />
                    ),
                })

                setMessages(updatedMessages)
            },
            onSuccess: (aiAgentResponse) => {
                const currentMessages = messagesRef.current // Use ref to access current messages
                const updatedMessages = [...currentMessages.slice(0, -1)]

                if (
                    storeData &&
                    shouldAiAgentResponseDisplay(
                        aiAgentResponse.data,
                        storeData.data.storeConfiguration
                    )
                ) {
                    updatedMessages.push({
                        sender: AI_AGENT_SENDER,
                        type: MessageType.MESSAGE,
                        message:
                            aiAgentResponse.data.postProcessing.htmlReply ??
                            aiAgentResponse.data.generate.output
                                .generated_message,
                    })
                }

                updatedMessages.push({
                    sender: AI_AGENT_SENDER,
                    type: MessageType.INTERNAL_NOTE,
                    message: aiAgentResponse.data.postProcessing.internalNote,
                })

                // Add a ticket event message if outcome is also validated
                if (aiAgentResponse.data.generate.output.outcome) {
                    updatedMessages.push({
                        sender: AI_AGENT_SENDER,
                        type: MessageType.TICKET_EVENT,
                        outcome: aiAgentResponse.data.generate.output.outcome,
                    })
                }

                setMessages(updatedMessages)
            },
        })

    useEffect(() => {
        messagesRef.current = messages
    }, [messages])

    useEffect(() => {
        if (storeFetchError) {
            if (
                isAxiosError(storeFetchError) &&
                storeFetchError.response?.status === 404
            ) {
                setStoreConfigurationNotInitialized(true)
            } else {
                void dispatch(
                    notify({
                        message:
                            'There was an error initializing the AI Agent Test mode',
                        status: NotificationStatus.Error,
                    })
                )

                return history.push(routes.configuration)
            }
        }
    }, [storeFetchError, dispatch, shopName, routes.configuration])

    if (storeDataLoading || accountDataLoading) {
        return <Loader />
    }

    if (accountFetchError) {
        if (
            isAxiosError(accountFetchError) &&
            accountFetchError.response?.status === 404
        ) {
            return <Redirect to={routes.configuration} />
        }

        reportError(accountFetchError, {
            extra: {
                context:
                    'Error fetching account configuration for AI Agent Playground',
                tags: [AI_AGENT_SENTRY_TEAM],
            },
        })
        return <Redirect to={routes.automation} />
    }

    if (
        !accountData ||
        !accountData.data.accountConfiguration.httpIntegration ||
        !storeData
    ) {
        void dispatch(
            notify({
                message:
                    'There was an error initializing the AI Agent Test mode',
                status: NotificationStatus.Error,
            })
        )
        return <Redirect to={routes.automation} />
    }

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
                    {storeConfigurationNotInitialized ? (
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
                    ) : (
                        <PlaygroundInputStep
                            isDisabled={storeConfigurationNotInitialized}
                            setSubject={setSubject}
                            setMessages={setMessages}
                            setStep={setStep}
                            submitPlaygroundTicket={submitPlaygroundTicket}
                            accountData={
                                accountData.data
                                    .accountConfiguration as AccountConfigurationWithHttpIntegration
                            }
                            storeData={storeData.data.storeConfiguration}
                            initialValues={initialInputValues}
                        />
                    )}
                </div>
            ) : (
                <div>
                    <PlaygroundOutputStep
                        messages={messages}
                        subject={subject}
                        setStep={setStep}
                        isProcessing={isSubmitting}
                    />
                </div>
            )}
        </div>
    )
}
