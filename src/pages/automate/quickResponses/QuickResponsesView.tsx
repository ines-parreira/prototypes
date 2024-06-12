import React, {useMemo, useRef, useState} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import _isEqual from 'lodash/isEqual'
import _keyBy from 'lodash/keyBy'
import {v4 as uuidv4} from 'uuid'
import {fromJS} from 'immutable'

import {useFlags} from 'launchdarkly-react-client-sdk'
import classNames from 'classnames'
import Button from 'pages/common/components/button/Button'
import {QuickResponsePolicy} from 'models/selfServiceConfiguration/types'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import AutomateView from 'pages/automate/common/components/AutomateView'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import useEffectOnce from 'hooks/useEffectOnce'

import useSearch from 'hooks/useSearch'
import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS,
    QUICK_RESPONSES,
} from '../common/components/constants'
import {useHistoryTracking} from '../common/hooks/useHistoryTracking'
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
    useHistoryTracking(SegmentEvent.AutomateQuickResponseVisited)
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const searchParams = useSearch<Record<string, string>>()
    const queryParamExpandedQuickResponseId =
        searchParams.quickResponseId ?? null
    const history = useHistory()
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
    >(queryParamExpandedQuickResponseId)
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

    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]

    useEffectOnce(() => {
        if (!changeAutomateSettingButtomPosition) return
        logEvent(SegmentEvent.AutomateSettingPageViewed, {
            page: 'Quick Responses',
        })
    })

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

        const allEntrypointsByWorkflowId = _keyBy(allEntrypoints, 'workflow_id')
        const enabledWorkflowIds = new Set<string>()

        Object.entries(applicationsAutomationSettings).forEach(
            ([applicationId, settings]) => {
                if (!chatApplicationIds.includes(applicationId)) {
                    return
                }

                const entrypoints = settings.workflows.entrypoints ?? []

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
    const handleQuickResponseExpandChange = (
        quickResponseId: string | null
    ) => {
        setExpandedQuickResponseId(quickResponseId)

        history.push({
            search: quickResponseId
                ? `?quickResponseId=${quickResponseId}`
                : '',
        })
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

    const isImprovedNavigationEnabled =
        useFlags()[FeatureFlagKey.ImprovedAutomateNavigation]

    return (
        <AutomateView
            {...(isImprovedNavigationEnabled ? {} : {title: QUICK_RESPONSES})}
            isLoading={isLoading}
            fullWidth={!isImprovedNavigationEnabled}
            className={classNames({
                [css.quickResponsesContainer]: isImprovedNavigationEnabled,
            })}
        >
            <AutomateViewContent
                description={`Display up to ${MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS} buttons in your Chat with common questions that customers can click for an instant response. If a customer needs more help, a ticket is created for an agent to handle.`}
                helpUrl="https://docs.gorgias.com/en-US/custom-self-service-flows-81897"
                helpTitle={`How To Set Up ${QUICK_RESPONSES}`}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmittable={
                    areQuickResponsesDirty && !isUpdatePending && !hasError
                }
                isCancelable={areQuickResponsesDirty && !isUpdatePending}
            >
                {dirtyQuickResponses.length > 0 && (
                    <QuickResponsesAccordionCaption />
                )}
                <QuickResponsesViewContext.Provider
                    value={quickResponsesViewContext}
                >
                    <QuickResponsesAccordion
                        items={dirtyQuickResponses}
                        expandedItem={expandedQuickResponseId}
                        onExpandedItemChange={handleQuickResponseExpandChange}
                        onHoveredItemChange={setHoveredQuickResponseId}
                        onPreviewChange={setDirtyQuickResponses}
                        onChange={handleQuickResponsesUpdate}
                        onDelete={handleQuickResponsesDelete}
                    />
                </QuickResponsesViewContext.Provider>
                <Button
                    intent="secondary"
                    className={css.addQuickResponseButton}
                    onClick={handleNewQuickResponse}
                    isDisabled={hasError}
                >
                    <i className="material-icons md-2 mr-2">add</i>
                    Add Quick Response
                </Button>
            </AutomateViewContent>
            <QuickResponsesPreview
                channels={chatChannels}
                selfServiceConfiguration={{
                    ...selfServiceConfiguration!,
                    quick_response_policies: dirtyQuickResponses,
                }}
                expandedQuickResponse={expandedQuickResponse}
                hoveredQuickResponseId={hoveredQuickResponseId}
            />
        </AutomateView>
    )
}

export default QuickResponsesView
