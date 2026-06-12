import { useEffect, useMemo, useState } from 'react'

import _isEqual from 'lodash/isEqual'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
    Box,
    Button,
    Heading,
    Modal,
    Text,
    TextAreaField,
    TextField,
} from '@gorgias/axiom'

import type {
    ReportIssueCaseReason,
    SelfServiceReportIssueCase,
} from 'models/selfServiceConfiguration/types'
import type { ChatPreviewPageOptions } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/ChatPreviewPanel'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { SaveChangesPrompt } from 'pages/integrations/integration/components/gorgias_chat/revamp/CreationWizard/components/SaveChangesPrompt'

import { OrderManagementFlowHeader } from '../../components/OrderManagementFlowHeader/OrderManagementFlowHeader'
import {
    REPORT_ISSUE_PREVIEW_ORDER,
    REPORT_ISSUE_PREVIEW_ORDER_NAME,
    REPORT_ISSUE_PREVIEW_ORDERS,
} from '../../utils/previewOrdersData'
import { ScenarioConditionBuilder } from '../scenarioForm/conditionBuilder/ScenarioConditionBuilder'
import {
    SCENARIO_DESCRIPTION_MAX_LENGTH,
    SCENARIO_NAME_MAX_LENGTH,
} from '../scenarioForm/constants'
import { ScenarioReasonEditor } from '../scenarioForm/reasonEditor/ScenarioReasonEditor'
import type { ScenarioFormContextType } from '../scenarioForm/ScenarioFormContext'
import { ScenarioFormContext } from '../scenarioForm/ScenarioFormContext'
import { useEditReportOrderIssueScenario } from './hooks/useEditReportOrderIssueScenario'

type FormValues = {
    title: string
    description: string
    conditions: SelfServiceReportIssueCase['conditions']
    newReasons: ReportIssueCaseReason[]
}

export const EditReportOrderIssueScenarioView = () => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const backPath = `/app/settings/order-management/${shopType}/${shopName}/report-issue`

    const {
        scenario,
        isFallback,
        isLoading,
        isUpdatePending,
        handleScenarioUpdate,
        handleScenarioDelete,
    } = useEditReportOrderIssueScenario()

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [expandedReasonKey, setExpandedReasonKey] = useState<string | null>(
        null,
    )

    const {
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { isDirty, errors },
    } = useForm<FormValues>({
        defaultValues: {
            title: scenario?.title ?? '',
            description: scenario?.description ?? '',
            conditions: scenario?.conditions ?? { and: [] },
            newReasons: scenario?.newReasons ?? [],
        },
    })

    useEffect(() => {
        if (scenario) {
            reset({
                title: scenario.title,
                description: scenario.description,
                conditions: scenario.conditions,
                newReasons: scenario.newReasons,
            })
        }
    }, [scenario, reset])

    const title = watch('title')
    const description = watch('description')
    const conditions = watch('conditions')
    const newReasons = watch('newReasons')

    const isTitleEmpty = !title.trim()

    const { updatePreviewOrders, displayPage, onChatPreviewLoaded } =
        useChatPreviewPanelContext()

    const computedPreviewOrders = useMemo(
        () => ({
            ...REPORT_ISSUE_PREVIEW_ORDERS,
            orders: {
                [REPORT_ISSUE_PREVIEW_ORDER_NAME]: {
                    ...REPORT_ISSUE_PREVIEW_ORDER,
                    fulfillments: [
                        {
                            ...REPORT_ISSUE_PREVIEW_ORDER.fulfillments[0],
                            flows: {
                                ...REPORT_ISSUE_PREVIEW_ORDER.fulfillments[0]
                                    .flows,
                                report_issue_reasons: newReasons,
                            },
                        },
                    ],
                },
            },
        }),
        [newReasons],
    )

    const expandedReason = useMemo(
        () =>
            newReasons.find((reason) => reason.reasonKey === expandedReasonKey),
        [newReasons, expandedReasonKey],
    )

    const chatPreviewPageOptions: ChatPreviewPageOptions = useMemo(
        () =>
            expandedReason
                ? {
                      orderName: REPORT_ISSUE_PREVIEW_ORDER_NAME,
                      reasonKey: expandedReason.reasonKey,
                      responseText:
                          expandedReason.action?.responseMessageContent.text ??
                          '',
                      showHelpfulPrompt:
                          expandedReason.action?.showHelpfulPrompt ?? false,
                  }
                : { orderName: REPORT_ISSUE_PREVIEW_ORDER_NAME },
        [expandedReason],
    )

    useEffect(() => {
        updatePreviewOrders(computedPreviewOrders)
    }, [updatePreviewOrders, computedPreviewOrders])

    useEffect(() => {
        displayPage(
            expandedReasonKey ? 'reported-issue' : 'report',
            chatPreviewPageOptions,
        )
    }, [displayPage, expandedReasonKey, chatPreviewPageOptions])

    useEffect(() => {
        return onChatPreviewLoaded(() => {
            updatePreviewOrders(computedPreviewOrders)
            displayPage('report', chatPreviewPageOptions)
        }, true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        return () => {
            displayPage('homepage')
        }
    }, [displayPage])

    const [formErrors, setFormErrors] = useState<Record<string, true>>({})
    const hasFormError = Object.keys(formErrors).length > 0 || isTitleEmpty

    const scenarioFormContext: ScenarioFormContextType = useMemo(
        () => ({
            setError: (path, hasError) => {
                setFormErrors((prev) => {
                    const next = { ...prev }
                    if (hasError) {
                        next[path] = true
                    } else {
                        delete next[path]
                    }
                    return _isEqual(prev, next) ? prev : next
                })
            },
        }),
        [],
    )

    const onSubmit = handleSubmit(async (values) => {
        try {
            await handleScenarioUpdate(values)
            reset(values)
        } catch {
            // error notification handled by hook
        }
    })

    const onDeleteConfirm = async () => {
        try {
            await handleScenarioDelete()
        } catch {
            // error notification handled by hook
        }
    }

    if (isLoading || !scenario) {
        return null
    }

    return (
        <>
            <SaveChangesPrompt
                when={isDirty}
                onSave={onSubmit}
                shouldRedirectAfterSave
                isSaveDisabled={hasFormError || isUpdatePending}
            />
            <OrderManagementFlowHeader
                title="Edit scenario"
                backPath={backPath}
                onSave={onSubmit}
                isSaveDisabled={!isDirty || hasFormError || isUpdatePending}
                isSaveLoading={isUpdatePending}
            />
            <ScenarioFormContext.Provider value={scenarioFormContext}>
                <Box flexDirection="column" gap="lg" p="lg">
                    <Box flexDirection="column" gap="sm">
                        <TextField
                            label="Scenario name"
                            placeholder="Ex: Delivered"
                            value={title}
                            onChange={(val) =>
                                setValue('title', val, { shouldDirty: true })
                            }
                            maxLength={SCENARIO_NAME_MAX_LENGTH}
                            isRequired
                            isInvalid={Boolean(errors.title)}
                            caption={
                                errors.title?.message ??
                                `${title.length}/${SCENARIO_NAME_MAX_LENGTH}`
                            }
                        />
                        <TextAreaField
                            label="Scenario description"
                            placeholder="Ex: When order status is delivered"
                            value={description}
                            onChange={(val) =>
                                setValue('description', val, {
                                    shouldDirty: true,
                                })
                            }
                            maxLength={SCENARIO_DESCRIPTION_MAX_LENGTH}
                            isInvalid={Boolean(errors.description)}
                            caption={errors.description?.message}
                            rows={2}
                        />
                    </Box>

                    <Box flexDirection="column" gap="xs">
                        <Box flexDirection="column" gap="xxs">
                            <Text size="md" variant="medium">
                                Order conditions{' '}
                                {!isFallback && (
                                    <Text
                                        size="md"
                                        color="content-error-default"
                                        as="span"
                                    >
                                        *
                                    </Text>
                                )}
                            </Text>
                            <Text size="sm" color="content-neutral-secondary">
                                {isFallback
                                    ? "This scenario applies to all orders that don't match any other scenario's conditions."
                                    : 'The options below will display when an order meets the following conditions.'}
                            </Text>
                        </Box>
                        {!isFallback && (
                            <ScenarioConditionBuilder
                                value={conditions}
                                onChange={(next) =>
                                    setValue('conditions', next, {
                                        shouldDirty: true,
                                    })
                                }
                            />
                        )}
                    </Box>

                    <Box flexDirection="column" gap="xs">
                        <Box flexDirection="column" gap="xxs">
                            <Text size="md" variant="medium">
                                Issue options{' '}
                                <Text
                                    size="md"
                                    color="content-error-default"
                                    as="span"
                                >
                                    *
                                </Text>
                            </Text>
                            <Text size="sm" color="content-neutral-secondary">
                                Select the issue options customers can choose
                                from and configure automated responses.
                            </Text>
                        </Box>
                        <ScenarioReasonEditor
                            value={newReasons}
                            onChange={(next) =>
                                setValue('newReasons', next, {
                                    shouldDirty: true,
                                })
                            }
                            onExpandedReasonChange={setExpandedReasonKey}
                        />
                    </Box>

                    {!isFallback && (
                        <Box flexDirection="row" justifyContent="flex-end">
                            <Button
                                variant="tertiary"
                                intent="destructive"
                                size="md"
                                onClick={() => setIsDeleteModalOpen(true)}
                                isDisabled={isUpdatePending}
                            >
                                Delete scenario
                            </Button>
                        </Box>
                    )}
                </Box>
            </ScenarioFormContext.Provider>

            {!isFallback && (
                <Modal
                    isOpen={isDeleteModalOpen}
                    onOpenChange={(nextOpen: boolean) => {
                        if (!nextOpen && !isUpdatePending) {
                            setIsDeleteModalOpen(false)
                        }
                    }}
                >
                    <Box flexDirection="column" gap="md">
                        <Box
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Heading size="md">Delete scenario</Heading>
                            <Button
                                icon="close"
                                variant="tertiary"
                                size="md"
                                aria-label="Close modal"
                                onClick={() => setIsDeleteModalOpen(false)}
                                isDisabled={isUpdatePending}
                            />
                        </Box>
                        <Text>
                            Are you sure you want to delete this scenario? This
                            action cannot be undone.
                        </Text>
                        <Box
                            flexDirection="row"
                            justifyContent="flex-end"
                            gap="xs"
                        >
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={() => setIsDeleteModalOpen(false)}
                                isDisabled={isUpdatePending}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                intent="destructive"
                                size="md"
                                isLoading={isUpdatePending}
                                onClick={onDeleteConfirm}
                            >
                                Delete
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            )}
        </>
    )
}
