import React, {useState, MouseEvent} from 'react'
import {Alert, Form, FormGroup, Input} from 'reactstrap'
import {Redirect, useParams} from 'react-router-dom'
import axios from 'axios'
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
import {AI_AGENT} from '../common/components/constants'
import AutomateView from '../common/components/AutomateView'
import css from './AiAgentPlaygroundContainer.less'

const AiAgentPlaygroundContainer = () => {
    const {shopName} = useParams<{
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
    const [firstSubmissionExecuted, setFirstSubmissionExecuted] =
        useState(false)
    const [aiAgentResponse, setAiAgentResponse] = useState<
        AiAgentResponse | undefined
    >()

    const {
        error: storeFetchError,
        data: storeData,
        isLoading: storeDataLoading,
    } = useGetStoreConfigurationPure({
        accountDomain,
        storeName: shopName,
    })

    const {
        error: accountFetchError,
        data: accountData,
        isLoading: accountDataLoading,
    } = useGetAccountConfiguration(accountDomain)

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

    if (accountData && !accountData.data.accountConfiguration.httpIntegration) {
        void dispatch(
            notify({
                message:
                    'There was an error initializing the AI Agent Playground',
                status: NotificationStatus.Error,
            })
        )
        return <Redirect to="/app/automation" />
    }

    if (storeFetchError || accountFetchError) {
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
        !playgroundTicketMessage.length || isSubmitting || !customerEmail.length

    return (
        <AutomateView title={AI_AGENT} headerNavbarItems={headerNavbarItems}>
            <div className={css.playgroundContainer}>
                <Form onSubmit={(e) => e.preventDefault()}>
                    <FormGroup>
                        <Label>Customer email</Label>
                        <Input
                            value={customerEmail}
                            placeholder={'Customer email'}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Ticket message input</Label>
                        <Input
                            name="text"
                            type="textarea"
                            value={playgroundTicketMessage}
                            disabled={isSubmitting}
                            onChange={(e) =>
                                setPlaygroundTicketMessage(e.target.value)
                            }
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
