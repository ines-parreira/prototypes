import { useCallback, useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { Box, Button, Icon, Skeleton, Text } from '@gorgias/axiom'

import type { LANGUAGE } from 'constants/languages'
import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { ChatChannelSelector } from 'pages/automate/connectedChannels/revamp/components/ChatChannelSelector/ChatChannelSelector'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import SaveChangesPrompt from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatCreationWizard/components/SaveChangesPrompt'

import { OrderManagementFlowHeader } from '../../components/OrderManagementFlowHeader/OrderManagementFlowHeader'
import { useReportOrderIssueFlow } from './hooks/useReportOrderIssueFlow'
import { ReportOrderIssueScenarioList } from './ReportOrderIssueScenarioList'

type FormValues = {
    scenarios: SelfServiceReportIssueCase[]
}

export const ReportOrderIssueFlowView = () => {
    // Router hooks
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const history = useHistory()
    const { pathname } = useLocation()

    // State
    const [selectedChannelId, setSelectedChannelId] = useState<
        number | undefined
    >()

    // Data hooks
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)
    const { isLoading, isUpdatePending, scenarios, handleScenariosUpdate } =
        useReportOrderIssueFlow()

    // Memoized values
    const selectedChannel = useMemo(
        () =>
            chatChannels.find((c) => c.value.id === selectedChannelId) ??
            chatChannels[0],
        [chatChannels, selectedChannelId],
    )

    const appId = selectedChannel?.value.meta.app_id ?? null

    const selectedChannelLanguage = useMemo(() => {
        const primaryLanguage: LANGUAGE | undefined =
            selectedChannel?.value?.meta?.languages?.find((lang) => {
                return lang.primary === true
            })?.language

        return primaryLanguage
    }, [selectedChannel])

    const PreviewPanelHeaderActions = useMemo(() => {
        return chatChannels.length > 0 ? (
            <ChatChannelSelector
                chatChannels={chatChannels}
                selectedChannelId={selectedChannelId}
                onSelect={setSelectedChannelId}
            />
        ) : undefined
    }, [selectedChannelId, chatChannels])

    // Preview panel
    const { showPreviewPanel, chatPreviewPortal } = useChatPreviewPanel({
        headerActions: PreviewPanelHeaderActions,
        locale: selectedChannelLanguage,
    })

    useEffect(() => {
        showPreviewPanel(appId)
    }, [showPreviewPanel, appId])

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
            {chatPreviewPortal}
        </>
    )
}
