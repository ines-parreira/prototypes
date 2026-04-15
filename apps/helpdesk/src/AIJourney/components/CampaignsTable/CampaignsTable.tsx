import { useCallback, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useHistory } from 'react-router-dom'

import type { ColumnDef, TableV1ToolbarRow } from '@gorgias/axiom'
import {
    Box,
    Button,
    Size,
    TableHeader,
    TableV1BodyContent,
    TableV1HeaderRowGroup,
    TableV1Root,
    TableV1Toolbar,
    useTableV1,
} from '@gorgias/axiom'
import type { JourneyApiDTO } from '@gorgias/convert-client'
import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import type { UpdatableJourneyCampaignState } from 'AIJourney/constants'
import {
    useAiJourneyStoreConfiguration,
    useJourneyUpdateHandler,
} from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import { useCreateNewJourney } from 'AIJourney/queries'
import { useDeleteJourney } from 'AIJourney/queries/useDeleteJourney/useDeleteJourney'
import { getJourneyData } from 'AIJourney/queries/useJourneyData/useJourneyData'

import { SmsSenderRequiredModal } from '../SmsSenderRequiredModal/SmsSenderRequiredModal'
import CancelCampaignConfirmation from './CancelCampaignConfirmation/CancelCampaignConfirmation'
import EmptyCampaignsState from './EmptyCampaignsState/EmptyCampaignsState'
import RemoveCampaignConfirmation from './RemoveCampaignConfirmation/RemoveCampaignConfirmation'
import SendCampaignConfirmation from './SendCampaignConfirmation/SendCampaignConfirmation'
import type { CampaignsTableMeta } from './types'

import styles from './CampaignsTable.less'

type CampaignsTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onEditColumns?: () => void
    isLoading?: boolean
}

export default function CampaignsTable<TData, TValue>({
    columns,
    data,
    onEditColumns,
    isLoading = false,
}: CampaignsTableProps<TData, TValue>) {
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
    const [isSendModalOpen, setIsSendModalOpen] = useState(false)
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [isSmsSenderModalOpen, setIsSmsSenderModalOpen] = useState(false)
    const [selectedCampaignId, setSelectedCampaignId] = useState<
        string | undefined
    >()
    const [selectedCampaignHasAudiences, setSelectedCampaignHasAudiences] =
        useState(false)

    const history = useHistory()
    const { shopName, currency, currentIntegration } = useJourneyContext()

    const storeSettingsEnabled = useFlag(
        FeatureFlagKey.AiJourneyStoreSettingsEnabled,
    )
    const { storeConfiguration } = useAiJourneyStoreConfiguration(
        currentIntegration?.id,
    )
    const isMissingSmsSender =
        storeSettingsEnabled && !storeConfiguration?.sms_sender_integration_id

    const createNewJourney = useCreateNewJourney()

    // delete campaign
    const { mutate: deleteCampaign } = useDeleteJourney()

    const handleOpenRemoveModal = useCallback(
        (id: string) => {
            setSelectedCampaignId(id)
            setIsRemoveModalOpen(true)
        },
        [setSelectedCampaignId, setIsRemoveModalOpen],
    )

    const handleCloseRemoveModal = useCallback(() => {
        setIsRemoveModalOpen(false)
        setSelectedCampaignId(undefined)
    }, [setSelectedCampaignId, setIsRemoveModalOpen])

    const handleConfirmRemove = useCallback(() => {
        if (selectedCampaignId) {
            deleteCampaign({ id: selectedCampaignId })
        }
        handleCloseRemoveModal()
    }, [selectedCampaignId, handleCloseRemoveModal, deleteCampaign])

    const { handleUpdate } = useJourneyUpdateHandler({
        integrationId: currentIntegration?.id,
    })

    // send campaign
    const handleOpenSendModal = useCallback(
        (id: string, hasIncludedAudiences: boolean) => {
            if (isMissingSmsSender) {
                setIsSmsSenderModalOpen(true)
                return
            }
            setSelectedCampaignId(id)
            setSelectedCampaignHasAudiences(hasIncludedAudiences)
            setIsSendModalOpen(true)
        },
        [isMissingSmsSender, setSelectedCampaignId, setIsSendModalOpen],
    )

    const handleCloseSendModal = useCallback(() => {
        setIsSendModalOpen(false)
        setSelectedCampaignId(undefined)
    }, [setSelectedCampaignId, setIsSendModalOpen])

    const handleConfirmSend = useCallback(() => {
        if (selectedCampaignId) {
            handleUpdate({
                id: selectedCampaignId,
                campaignState: JourneyCampaignStateEnum.Scheduled,
            })
        }
        handleCloseSendModal()
    }, [selectedCampaignId, handleCloseSendModal, handleUpdate])

    // cancel campaign
    const handleOpenCancelModal = useCallback(
        (id: string) => {
            setSelectedCampaignId(id)
            setIsCancelModalOpen(true)
        },
        [setSelectedCampaignId, setIsCancelModalOpen],
    )

    const handleCloseCancelModal = useCallback(() => {
        setIsCancelModalOpen(false)
        setSelectedCampaignId(undefined)
    }, [setSelectedCampaignId, setIsCancelModalOpen])

    const handleConfirmCancel = useCallback(() => {
        if (selectedCampaignId) {
            handleUpdate({
                id: selectedCampaignId,
                campaignState: JourneyCampaignStateEnum.Canceled,
            })
        }
        handleCloseCancelModal()
    }, [selectedCampaignId, handleCloseCancelModal, handleUpdate])

    const handleChangeStatus = useCallback(
        (id: string, status: UpdatableJourneyCampaignState) => {
            if (id) {
                handleUpdate({
                    id,
                    campaignState: status,
                })
            }
        },
        [handleUpdate],
    )

    const handleDuplicate = useCallback(
        async (journey: JourneyApiDTO) => {
            const journeyData = await getJourneyData(journey.id)

            const createdJourney = await createNewJourney.mutateAsync({
                params: {
                    store_integration_id: journeyData.store_integration_id,
                    store_name: journeyData.store_name,
                    type: journeyData.type,
                    campaign: {
                        title:
                            (journeyData.campaign?.title || 'Untitled') +
                            ' (Copy)',
                    },
                    included_audience_list_ids:
                        journeyData.included_audience_list_ids,
                    excluded_audience_list_ids:
                        journeyData.excluded_audience_list_ids,
                    message_instructions: journeyData.message_instructions,
                },
                journeyConfigs: {
                    max_follow_up_messages:
                        journeyData.configuration.max_follow_up_messages,
                    offer_discount: journeyData.configuration.offer_discount,
                    max_discount_percent:
                        journeyData.configuration.max_discount_percent,
                    sms_sender_integration_id:
                        journeyData.configuration.sms_sender_integration_id,
                    sms_sender_number:
                        journeyData.configuration.sms_sender_number,
                    discount_code_message_threshold:
                        journeyData.configuration
                            .discount_code_message_threshold,
                },
            })

            history.push(
                `/app/ai-journey/${shopName}/${createdJourney.type}/setup/${createdJourney.id}`,
            )
        },
        [history, createNewJourney, shopName],
    )

    const table = useTableV1({
        data,
        columns,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: true,
        },
        paginationConfig: {
            enablePagination: true,
            manualPagination: false,
            pageSize: 10,
            initialPageIndex: 0,
        },
        globalFilterConfig: {
            enableGlobalFilter: true,
            globalFilterFn: 'includesString',
        },
        additionalOptions: {
            meta: {
                onRemoveClick: handleOpenRemoveModal,
                onSendClick: handleOpenSendModal,
                onCancelClick: handleOpenCancelModal,
                onChangeStatus: handleChangeStatus,
                onDuplicateClick: handleDuplicate,
                currency: currency,
            } as CampaignsTableMeta,
        },
    })

    const shouldRenderPaginationComponent =
        table.getFilteredRowModel().rows.length > 10
    const tableToolbarBottonRowElements: TableV1ToolbarRow =
        shouldRenderPaginationComponent ? { right: ['pagination'] } : {}

    return (
        <>
            <div className={styles.tableWrapper}>
                <Box
                    paddingLeft={Size.Lg}
                    paddingRight={Size.Lg}
                    display="block"
                >
                    <TableV1Toolbar<TData>
                        table={table}
                        topRow={{ left: ['search'] }}
                        bottomRow={{
                            left: ['totalCount'],
                            right: [
                                {
                                    key: 'edit',
                                    content: (
                                        <Button
                                            onClick={onEditColumns}
                                            intent="regular"
                                            leadingSlot="columns"
                                            size="sm"
                                            variant="tertiary"
                                        >
                                            Edit table
                                        </Button>
                                    ),
                                },
                            ],
                        }}
                    />
                </Box>

                <TableV1Root withBorder={false}>
                    <TableHeader>
                        <TableV1HeaderRowGroup
                            headerGroups={table.getHeaderGroups()}
                        />
                    </TableHeader>

                    <TableV1BodyContent
                        isLoading={isLoading}
                        rows={table.getRowModel().rows}
                        columnCount={columns.length}
                        table={table}
                        renderEmptyStateComponent={() => (
                            <Box alignItems="center" justifyContent="center">
                                <EmptyCampaignsState />
                            </Box>
                        )}
                    />
                </TableV1Root>
                <Box
                    paddingRight={Size.Lg}
                    display="flex"
                    justifyContent="flex-end"
                >
                    <TableV1Toolbar
                        table={table}
                        bottomRow={tableToolbarBottonRowElements}
                    />
                </Box>
            </div>
            <SmsSenderRequiredModal
                isOpen={isSmsSenderModalOpen}
                onClose={() => setIsSmsSenderModalOpen(false)}
                settingsUrl={`/app/ai-journey/${shopName}/settings`}
                isCampaign
            />
            <RemoveCampaignConfirmation
                isOpen={isRemoveModalOpen}
                onClose={handleCloseRemoveModal}
                onConfirm={handleConfirmRemove}
            />
            <SendCampaignConfirmation
                isOpen={isSendModalOpen}
                onClose={handleCloseSendModal}
                onConfirm={handleConfirmSend}
                hasIncludedAudiences={selectedCampaignHasAudiences}
            />
            <CancelCampaignConfirmation
                isOpen={isCancelModalOpen}
                onClose={handleCloseCancelModal}
                onConfirm={handleConfirmCancel}
            />
        </>
    )
}
