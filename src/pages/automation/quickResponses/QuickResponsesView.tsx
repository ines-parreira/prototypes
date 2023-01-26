import React, {useEffect, useState, useMemo} from 'react'
import {Container} from 'reactstrap'
import {useParams} from 'react-router-dom'
import classnames from 'classnames'
import _isEqual from 'lodash/isEqual'
import {v4 as uuidv4} from 'uuid'
import {fromJS} from 'immutable'

import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import Button from 'pages/common/components/button/Button'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {QuickResponsePolicy} from 'models/selfServiceConfiguration/types'

import QuickResponsesAccordionCaption from './components/QuickResponsesAccordionCaption'
import QuickResponsesAccordion from './components/QuickResponsesAccordion'
import useQuickResponses from './hooks/useQuickResponses'
import QuickResponsesViewContext, {
    QuickResponsesViewContextType,
} from './QuickResponsesViewContext'
import {
    MAX_ACTIVE_QUICK_RESPONSES,
    NEW_QUICK_RESPONSE_SYMBOL,
} from './constants'

import css from './QuickResponsesView.less'

const QuickResponsesView = () => {
    const {integrationType, integrationId} = useParams<{
        integrationType: string
        integrationId: string
    }>()
    const {
        isFetchPending,
        isUpdatePending,
        quickResponses,
        handleQuickResponsesUpdate,
        handleQuickResponsesDelete,
    } = useQuickResponses(integrationType, integrationId)

    const [errors, setErrors] = useState<Record<string, true>>({})
    const [dirtyQuickResponses, setDirtyQuickResponses] =
        useState(quickResponses)
    const [expandedQuickResponse, setExpandedQuickResponse] = useState<
        QuickResponsePolicy['id'] | false
    >(false)

    useEffect(() => {
        setDirtyQuickResponses(quickResponses)
    }, [quickResponses])

    const activeQuickResponsesCount = quickResponses.filter(
        (quickResponse) => !quickResponse.deactivated_datetime
    ).length
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
                activeQuickResponsesCount >= MAX_ACTIVE_QUICK_RESPONSES,
        }),
        [isUpdatePending, hasError, activeQuickResponsesCount]
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
        setExpandedQuickResponse(newQuickResponse.id)
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

    return (
        <div className="full-width">
            <PageHeader title="Quick responses" />
            <Container
                fluid
                className={classnames({[css.container]: !isFetchPending})}
            >
                {isFetchPending ? (
                    <Loader />
                ) : (
                    <QuickResponsesViewContext.Provider
                        value={quickResponsesViewContext}
                    >
                        <div>
                            <div className={css.descriptionContainer}>
                                <p className="mb-1">
                                    Display up to {MAX_ACTIVE_QUICK_RESPONSES}{' '}
                                    buttons in your chat widget with common
                                    questions that shoppers can click for an
                                    instant response. If a shopper needs more
                                    help, a ticket is created for an agent to
                                    handle.
                                </p>
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
                                expandedItem={expandedQuickResponse}
                                onExpandedItemChange={setExpandedQuickResponse}
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
                                    areQuickResponsesDirty && !isUpdatePending
                                }
                            />
                        </div>
                        <div />
                    </QuickResponsesViewContext.Provider>
                )}
            </Container>
        </div>
    )
}

export default QuickResponsesView
