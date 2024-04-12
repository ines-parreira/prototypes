import React, {useState, MouseEvent} from 'react'
import {Alert, Form, FormGroup, Input} from 'reactstrap'
import {Link, Redirect, useParams} from 'react-router-dom'
import axios, {isAxiosError} from 'axios'
import {useFlags} from 'launchdarkly-react-client-sdk'
import Loader from 'pages/common/components/Loader/Loader'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import Button from 'pages/common/components/button/Button'
import Label from 'pages/common/forms/Label/Label'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    useGetAccountConfiguration,
    useGetStoreConfigurationPure,
    useSubmitPlaygroundTicket,
} from 'models/aiAgent/queries'
import {AiAgentResponse} from 'models/aiAgent/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {sanitizeHtmlDefault} from 'utils/html'
import TextArea from 'pages/common/forms/TextArea'
import {AI_AGENT} from '../common/components/constants'
import AutomateView from '../common/components/AutomateView'
import css from './AiAgentPlaygroundContainer.less'

const AiAgentPlaygroundContainer = () => {
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const showAiAgentPlayground: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentPlayground]

    const headerNavbarItems = [
        {
            route: `/app/automation/shopify/${shopName}/ai-agent`,
            title: 'Settings',
        },
    ]

    if (showAiAgentPlayground) {
        headerNavbarItems.push({
            route: `/app/automation/shopify/${shopName}/ai-agent/playground`,
            title: 'Playground',
        })
    }

    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountId = currentAccount.get('id')
    const accountDomain = currentAccount.get('domain')
    const [customerEmail, setCustomerEmail] = useState('')
    const [playgroundTicketMessage, setPlaygroundTicketMessage] = useState('')
    const [formError, setFormError] = useState<string>()
    const [
        storeConfigurationNotInitialized,
        setStoreConfigurationNotInitialized,
    ] = useState(false)
    const [firstSubmissionExecuted, setFirstSubmissionExecuted] =
        useState(false)
    const [aiAgentResponse, setAiAgentResponse] = useState<
        AiAgentResponse | undefined
    >()

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

    // Ai Agent submit
    const {
        mutate: submitPlaygroundTicket,
        isLoading: isSubmitting,
        error: submitError,
    } = useSubmitPlaygroundTicket({
        onError: (error) => {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setFormError(`No account was found for email ${customerEmail}`)
                throw error
            } else {
                setFormError(
                    'An unexpected error occurred. Please try again later.'
                )
            }
            setAiAgentResponse(undefined)
        },
        onSuccess: (aiAgentResponse) => {
            setAiAgentResponse(aiAgentResponse.data)
        },
    })

    const handleSubmit = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setFirstSubmissionExecuted(true)
        setAiAgentResponse(undefined)
        submitPlaygroundTicket([
            {
                customer_email: customerEmail,
                body_text: playgroundTicketMessage,
                http_integration_id:
                    //asserting this property existence as we are checking above that it exists once account data is loaded
                    accountData!.data.accountConfiguration.httpIntegration!.id,
                account_id: accountId,
                email_integration_id:
                    storeData!.data.storeConfiguration
                        .monitoredEmailIntegrations[0].id,
            },
        ])
        setAiAgentResponse(undefined)
    }

    const handleReset = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setCustomerEmail('')
        setPlaygroundTicketMessage('')
        setAiAgentResponse(undefined)
    }

    if (storeDataLoading || accountDataLoading) {
        return <Loader />
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

    const renderAiAgentResponse = () => {
        if (isSubmitting || aiAgentResponse) {
            return (
                <div className={css.aiAgentFeedback}>
                    {isSubmitting && (
                        <Loader
                            message="Response loading"
                            className={css.aiAgentResponseLoader}
                        />
                    )}
                    {aiAgentResponse && (
                        <div>
                            <div>
                                <h3>Generated response</h3>
                                <p>
                                    {
                                        aiAgentResponse.generate.output
                                            .generated_message
                                    }
                                </p>
                                <p>
                                    <strong>Outcome: </strong>
                                    {aiAgentResponse.generate.output.outcome}
                                </p>
                            </div>
                            <div>
                                <h3>Internal Note</h3>
                                <p
                                    className={css.internalNoteContainer}
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeHtmlDefault(
                                            aiAgentResponse.postProcessing
                                                .internalNote
                                        ),
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )
        }
    }

    const submitDisabled =
        !playgroundTicketMessage.length ||
        isSubmitting ||
        !customerEmail.length ||
        storeConfigurationNotInitialized

    return (
        <AutomateView title={AI_AGENT} headerNavbarItems={headerNavbarItems}>
            <div className={css.playgroundContainer}>
                {storeConfigurationNotInitialized && (
                    <Alert color="danger">
                        Please configure the AI Agent with an email integration
                        and help center in order to use the Playground{' '}
                        <Link
                            to={`/app/automation/${shopType}/${shopName}/ai-agent`}
                        >
                            Configure Here
                        </Link>
                    </Alert>
                )}
                <Form onSubmit={(e) => e.preventDefault()}>
                    <FormGroup>
                        <Label>Customer email</Label>
                        <Input
                            value={customerEmail}
                            placeholder={'Customer email'}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            disabled={storeConfigurationNotInitialized}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Ticket message input</Label>
                        <TextArea
                            isDisabled={
                                isSubmitting || storeConfigurationNotInitialized
                            }
                            onChange={(value) =>
                                setPlaygroundTicketMessage(value)
                            }
                            value={playgroundTicketMessage}
                            autoRowHeight={true}
                        />
                    </FormGroup>
                    <Button isDisabled={submitDisabled} onClick={handleSubmit}>
                        Submit
                    </Button>
                    <Button
                        isDisabled={submitDisabled}
                        onClick={handleReset}
                        intent="secondary"
                    >
                        Clear
                    </Button>
                </Form>
                {firstSubmissionExecuted && (
                    <div className={css.aiAgentResponseContainer}>
                        <h2>AI Agent Response</h2>
                        {renderAiAgentResponse()}
                        {submitError && (
                            <Alert color="danger">{formError}</Alert>
                        )}
                    </div>
                )}
            </div>
        </AutomateView>
    )
}

export default AiAgentPlaygroundContainer
