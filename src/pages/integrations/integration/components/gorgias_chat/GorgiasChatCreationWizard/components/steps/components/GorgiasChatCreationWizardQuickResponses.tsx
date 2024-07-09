import React, {useMemo, useState} from 'react'

import {List, fromJS} from 'immutable'
import _isEqual from 'lodash/isEqual'
import {v4 as uuidv4} from 'uuid'

import {toImmutable} from 'common/utils'

import QuickResponsesViewContext, {
    QuickResponsesViewContextType,
} from 'pages/automate/quickResponses/QuickResponsesViewContext'
import QuickResponsesAccordion from 'pages/automate/quickResponses/components/QuickResponsesAccordion'

import {QuickResponsePolicy} from 'models/selfServiceConfiguration/types'

import {StoreIntegration} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import css from './GorgiasChatCreationWizardQuickResponses.less'

const quickResponseLimit = 3

type Props = {
    storeIntegration?: StoreIntegration
    isUpdatePending: boolean
    quickResponses: QuickResponsePolicy[]
    setQuickResponses: (quickResponses: QuickResponsePolicy[]) => void
    expandedQuickResponseId: string | null
    setExpandedQuickResponseId: (expandedQuickResponseId: string | null) => void
    onChange: (hasError: boolean) => void
    isDisabled?: boolean
}

const GorgiasChatCreationWizardQuickResponses: React.FC<Props> = ({
    storeIntegration,
    isUpdatePending,
    quickResponses,
    setQuickResponses,
    expandedQuickResponseId,
    setExpandedQuickResponseId,
    onChange,
    isDisabled,
}) => {
    const [errors, setErrors] = useState<Record<string, true>>({})

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

                    const newErrors = _isEqual(prevErrors, nextErrors)
                        ? prevErrors
                        : nextErrors

                    onChange(Object.keys(newErrors).length > 0)

                    return newErrors
                })
            },
            isLimitReached: false,
            isDisabled,
            storeIntegration,
        }),
        [isUpdatePending, hasError, storeIntegration, onChange, isDisabled]
    )

    const items = useMemo(
        () =>
            quickResponses.map((quickResponse) => ({
                ...quickResponse,
                responseMessageContent: {
                    ...quickResponse.responseMessageContent,
                    attachments: toImmutable<List<any>>(
                        quickResponse.responseMessageContent.attachments ?? []
                    ),
                },
            })),
        [quickResponses]
    )

    const onAddNewQuickResponse = () => {
        if (quickResponses.length >= quickResponseLimit) {
            return
        }

        const newQuickResponse = {
            id: uuidv4(),
            title: '',
            deactivatedDatetime: new Date().toISOString(),
            responseMessageContent: {
                html: '',
                text: '',
                attachments: fromJS([]),
            },
        }

        const newQuickResponses = [...quickResponses, newQuickResponse]

        setQuickResponses(newQuickResponses)
        setExpandedQuickResponseId(newQuickResponse.id)
    }

    return (
        <div className={css.quickResponses}>
            <QuickResponsesViewContext.Provider
                value={quickResponsesViewContext}
            >
                <QuickResponsesAccordion
                    items={items}
                    expandedItem={expandedQuickResponseId}
                    onExpandedItemChange={setExpandedQuickResponseId}
                    onPreviewChange={setQuickResponses}
                    onChange={setQuickResponses}
                    onDelete={setQuickResponses}
                />
            </QuickResponsesViewContext.Provider>
            <div>
                <Button
                    intent="secondary"
                    onClick={onAddNewQuickResponse}
                    isDisabled={
                        quickResponses.length >= quickResponseLimit || hasError
                    }
                >
                    <ButtonIconLabel icon="add" />
                    Add Quick Response
                </Button>
            </div>
        </div>
    )
}

export default GorgiasChatCreationWizardQuickResponses
