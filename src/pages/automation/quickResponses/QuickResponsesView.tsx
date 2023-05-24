import React, {useMemo, useRef, useState} from 'react'
import {Container} from 'reactstrap'
import {useParams} from 'react-router-dom'
import classnames from 'classnames'
import _isEqual from 'lodash/isEqual'
import _keyBy from 'lodash/keyBy'
import {v4 as uuidv4} from 'uuid'
import {fromJS} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'

import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import Button from 'pages/common/components/button/Button'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {QuickResponsePolicy} from 'models/selfServiceConfiguration/types'
import useSelfServiceChatChannels from 'pages/automation/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automation/common/hooks/useApplicationsAutomationSettings'
import {FeatureFlagKey} from 'config/featureFlags'

import {MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS} from '../common/components/constants'
import QuickResponsesAccordionCaption from './components/QuickResponsesAccordionCaption'
import QuickResponsesAccordion from './components/QuickResponsesAccordion'
import useQuickResponses from './hooks/useQuickResponses'
import QuickResponsesPreview from './QuickResponsesPreview'
import QuickResponsesViewContext, {
    QuickResponsesViewContextType,
} from './QuickResponsesViewContext'
import {NEW_QUICK_RESPONSE_SYMBOL} from './constants'

import css from './QuickResponsesView.less'

const QuickResponsesView = () => {
    const allowDifferentFlowsPerChannel =
        useFlags()[FeatureFlagKey.DifferentFlowsPerChannel]
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const {
        isUpdatePending,
        quickResponses,
        storeIntegration,
        selfServiceConfiguration,
        handleQuickResponsesUpdate,
        handleQuickResponsesDelete,
    } = useQuickResponses(shopType, shopName)
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const [errors, setErrors] = useState<Record<string, true>>({})
    const [dirtyQuickResponses, setDirtyQuickResponses] =
        useState(quickResponses)
    const [expandedQuickResponseId, setExpandedQuickResponseId] = useState<
        QuickResponsePolicy['id'] | null
    >(null)
    const [hoveredQuickResponseId, setHoveredQuickResponseId] = useState<
        QuickResponsePolicy['id'] | null
    >(null)
    const previousQuickResponses = useRef(quickResponses)

    if (previousQuickResponses.current !== quickResponses) {
        previousQuickResponses.current = quickResponses

        setDirtyQuickResponses(quickResponses)
    }

    const chatApplicationIds = useMemo(
        () =>
            chatChannels
                .map(({value}) => value.meta.app_id)
                .filter((value): value is string => Boolean(value)),
        [chatChannels]
    )

    const {applicationsAutomationSettings} =
        useApplicationsAutomationSettings(chatApplicationIds)

    const enabledQuickResponsesCount = quickResponses.filter(
        (quickResponse) => !quickResponse.deactivated_datetime
    ).length
    const enabledWorkflowsCount = useMemo(() => {
        const allEntrypoints = selfServiceConfiguration?.workflows_entrypoints

        if (!allEntrypoints) {
            return 0
        }

        if (!allowDifferentFlowsPerChannel) {
            return allEntrypoints.filter((entrypoint) => entrypoint.enabled)
                .length
        }

        const allEntrypointsByWorkflowId = _keyBy(allEntrypoints, 'workflow_id')
        const enabledWorkflowIds = new Set<string>()

        Object.entries(applicationsAutomationSettings).forEach(
            ([applicationId, settings]) => {
                if (!chatApplicationIds.includes(applicationId)) {
                    return
                }

                const entrypoints =
                    settings.workflows.entrypoints ?? allEntrypoints

                entrypoints.forEach((entrypoint) => {
                    if (
                        entrypoint.enabled &&
                        entrypoint.workflow_id in allEntrypointsByWorkflowId
                    ) {
                        enabledWorkflowIds.add(entrypoint.workflow_id)
                    }
                })
            }
        )

        return enabledWorkflowIds.size
    }, [
        allowDifferentFlowsPerChannel,
        selfServiceConfiguration?.workflows_entrypoints,
        chatApplicationIds,
        applicationsAutomationSettings,
    ])
    const hasError = Object.keys(errors).length > 0
    const quickResponsesViewContext: QuickResponsesViewContextType = useMemo(
        () => ({
            isUpdatePending,
            hasError,
            setError: (path, hasError) => {
                setErrors((prevErrors) => {
                    const nextErrors = {...prevErrors}

                    if (hasError) {
                        nextErrors[path] = true
                    } else {
                        delete nextErrors[path]
                    }

                    return _isEqual(prevErrors, nextErrors)
                        ? prevErrors
                        : nextErrors
                })
            },
            isLimitReached:
                enabledQuickResponsesCount + enabledWorkflowsCount >=
                MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS,
            storeIntegration,
        }),
        [
            isUpdatePending,
            hasError,
            enabledQuickResponsesCount,
            enabledWorkflowsCount,
            storeIntegration,
        ]
    )

    const handleNewQuickResponse = () => {
        const newQuickResponse = {
            id: uuidv4(),
            title: '',
            deactivated_datetime: new Date().toISOString(),
            response_message_content: {
                html: '',
                text: '',
                attachments: fromJS([]),
            },
            [NEW_QUICK_RESPONSE_SYMBOL]: true,
        }

        setDirtyQuickResponses([...dirtyQuickResponses, newQuickResponse])
        setExpandedQuickResponseId(newQuickResponse.id)
    }
    const handleSubmit = () => {
        handleQuickResponsesUpdate(dirtyQuickResponses)
    }
    const handleCancel = () => {
        setDirtyQuickResponses(quickResponses)
        setErrors({})
    }

    const areQuickResponsesDirty = !_isEqual(
        dirtyQuickResponses,
        quickResponses
    )
    const expandedQuickResponse = dirtyQuickResponses.find(
        (dirtyQuickResponse) =>
            dirtyQuickResponse.id === expandedQuickResponseId
    )

    const isLoading =
        !selfServiceConfiguration ||
        chatApplicationIds.some((id) => !(id in applicationsAutomationSettings))

    return (
        <div className="full-width">
            <PageHeader title="Quick responses" />
            <Container
                fluid
                className={classnames({
                    [css.container]: !isLoading,
                })}
            >
                {isLoading ? (
                    <Loader />
                ) : (
                    <QuickResponsesViewContext.Provider
                        value={quickResponsesViewContext}
                    >
                        <div className={css.content}>
                            <div className={css.descriptionContainer}>
                                <div className={css.description}>
                                    Display up to{' '}
                                    {MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS}{' '}
                                    buttons in your chat widget with common
                                    questions that customers can click for an
                                    instant response. If a customer needs more
                                    help, a ticket is created for an agent to
                                    handle.
                                </div>
                                <a
                                    href="https://docs.gorgias.com/en-US/custom-self-service-flows-81897"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <i className="material-icons mr-2">
                                        menu_book
                                    </i>
                                    How To Set Up Quick Responses
                                </a>
                            </div>

                            {dirtyQuickResponses.length > 0 && (
                                <QuickResponsesAccordionCaption />
                            )}
                            <QuickResponsesAccordion
                                items={dirtyQuickResponses}
                                expandedItem={expandedQuickResponseId}
                                onExpandedItemChange={
                                    setExpandedQuickResponseId
                                }
                                onHoveredItemChange={setHoveredQuickResponseId}
                                onPreviewChange={setDirtyQuickResponses}
                                onChange={handleQuickResponsesUpdate}
                                onDelete={handleQuickResponsesDelete}
                            />

                            <Button
                                intent="secondary"
                                className={css.addQuickResponseButton}
                                onClick={handleNewQuickResponse}
                                isDisabled={hasError}
                            >
                                <i className="material-icons md-2 mr-2">add</i>
                                Add quick response
                            </Button>

                            <div
                                className={css.submitAndCancelButtonsContainer}
                            >
                                <Button
                                    isDisabled={
                                        !areQuickResponsesDirty ||
                                        isUpdatePending ||
                                        hasError
                                    }
                                    onClick={handleSubmit}
                                >
                                    Save changes
                                </Button>
                                <Button
                                    isDisabled={
                                        !areQuickResponsesDirty ||
                                        isUpdatePending
                                    }
                                    onClick={handleCancel}
                                    intent="secondary"
                                >
                                    Cancel
                                </Button>
                            </div>
                            <UnsavedChangesPrompt
                                onSave={handleSubmit}
                                when={
                                    areQuickResponsesDirty &&
                                    !isUpdatePending &&
                                    !hasError
                                }
                            />
                        </div>
                        <QuickResponsesPreview
                            channels={chatChannels}
                            selfServiceConfiguration={{
                                ...selfServiceConfiguration!,
                                quick_response_policies: dirtyQuickResponses,
                            }}
                            expandedQuickResponse={expandedQuickResponse}
                            hoveredQuickResponseId={hoveredQuickResponseId}
                        />
                    </QuickResponsesViewContext.Provider>
                )}
            </Container>
        </div>
    )
}

export default QuickResponsesView
