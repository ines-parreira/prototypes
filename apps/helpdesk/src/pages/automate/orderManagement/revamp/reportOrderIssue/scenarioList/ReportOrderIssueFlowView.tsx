import { useCallback, useEffect } from 'react'

import { useForm } from 'react-hook-form'
import { useHistory, useLocation } from 'react-router-dom'

import { Box, Button, Icon, Skeleton, Text } from '@gorgias/axiom'

import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { SaveChangesPrompt } from 'pages/integrations/integration/components/gorgias_chat/revamp/CreationWizard/components/SaveChangesPrompt'

import { OrderManagementFlowHeader } from '../../components/OrderManagementFlowHeader/OrderManagementFlowHeader'
import { useReportOrderIssueFlow } from './hooks/useReportOrderIssueFlow'
import { ReportOrderIssueScenarioList } from './ReportOrderIssueScenarioList'
import { REPORT_ORDER_ISSUE_PREVIEW_ORDERS } from './utils/reportOrderIssuePreviewOrdersData'

type FormValues = {
    scenarios: SelfServiceReportIssueCase[]
}

export const ReportOrderIssueFlowView = () => {
    // Router hooks
    const history = useHistory()
    const { pathname } = useLocation()

    // Data hooks
    const { isLoading, isUpdatePending, scenarios, handleScenariosUpdate } =
        useReportOrderIssueFlow()

    const { updatePreviewOrders, displayPage, onChatPreviewLoaded } =
        useChatPreviewPanelContext()

    useEffect(() => {
        return onChatPreviewLoaded(() => {
            updatePreviewOrders(REPORT_ORDER_ISSUE_PREVIEW_ORDERS)
            displayPage('orders')
        }, true)
    }, [onChatPreviewLoaded, updatePreviewOrders, displayPage])

    // Form
    const {
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { isDirty },
    } = useForm<FormValues>({
        defaultValues: { scenarios },
    })

    useEffect(() => {
        reset({ scenarios })
    }, [scenarios, reset])

    const formScenarios = watch('scenarios')

    // Handlers
    const handleReorder = useCallback(
        (reorderedScenarios: SelfServiceReportIssueCase[]) => {
            setValue('scenarios', reorderedScenarios, { shouldDirty: true })
        },
        [setValue],
    )

    const handleCreateScenario = useCallback(() => {
        history.push(`${pathname}/new`)
    }, [history, pathname])

    const onSubmit = handleSubmit(({ scenarios: updatedScenarios }) => {
        handleScenariosUpdate(updatedScenarios)
    })

    return (
        <>
            <SaveChangesPrompt
                when={isDirty}
                onSave={onSubmit}
                shouldRedirectAfterSave
            />
            <OrderManagementFlowHeader
                title="Report order issue"
                onSave={onSubmit}
                isSaveDisabled={!isDirty || isUpdatePending}
                isSaveLoading={isUpdatePending}
            />
            <Box flexDirection="column" gap="md" p="lg">
                {isLoading ? (
                    <Box flexDirection="column" gap="sm">
                        <Box justifyContent="space-between" alignItems="center">
                            <Skeleton height={32} width={280} />
                            <Skeleton height={36} width={140} />
                        </Box>
                        <Skeleton height={52} />
                        <Skeleton height={52} />
                        <Skeleton height={52} />
                        <Skeleton height={52} />
                        <Skeleton height={52} />
                        <Skeleton height={52} />
                        <Skeleton height={52} />
                    </Box>
                ) : (
                    <>
                        <Box justifyContent="space-between" alignItems="center">
                            <Box gap="xs" alignItems="center">
                                <Icon name="arrow-down" alt="" />
                                <Text>Scenarios apply in the order below</Text>
                            </Box>
                            <Button onClick={handleCreateScenario}>
                                Create Scenario
                            </Button>
                        </Box>
                        <ReportOrderIssueScenarioList
                            scenarios={formScenarios}
                            onReorder={handleReorder}
                        />
                    </>
                )}
            </Box>
        </>
    )
}
