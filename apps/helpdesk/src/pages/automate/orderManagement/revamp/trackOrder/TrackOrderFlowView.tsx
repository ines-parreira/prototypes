import { useEffect, useMemo } from 'react'

import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { Box, Skeleton, Text } from '@gorgias/axiom'

import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import useTrackOrderFlow from '../../legacy/trackOrder/hooks/useTrackOrderFlow'
import { OrderManagementFlowHeader } from '../components/OrderManagementFlowHeader/OrderManagementFlowHeader'
import { TRACK_ORDER_PREVIEW_ORDERS } from '../utils/previewOrdersData'

import css from './TrackOrderFlowView.less'

type FormValues = {
    unfulfilledMessage: string
}

function buildPreviewOrders(unfulfilledMessage: string) {
    const order = TRACK_ORDER_PREVIEW_ORDERS.orders!['#1001']
    return {
        ...TRACK_ORDER_PREVIEW_ORDERS,
        orders: {
            '#1001': {
                ...order,
                fulfillments: [
                    {
                        ...order.fulfillments[0],
                        flows: {
                            ...order.fulfillments[0].flows,
                            ...(unfulfilledMessage && {
                                track_order_unfulfilled_message: {
                                    html: unfulfilledMessage,
                                    text: unfulfilledMessage,
                                },
                            }),
                        },
                    },
                ],
            },
        },
    }
}

export const TrackOrderFlowView = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const {
        trackOrderFlow,
        isUpdatePending,
        selfServiceConfiguration,
        handleTrackOrderFlowUpdate,
    } = useTrackOrderFlow(shopName)

    const { register, handleSubmit, formState, watch } = useForm<FormValues>({
        values: {
            unfulfilledMessage: trackOrderFlow?.unfulfilledMessage?.text ?? '',
        },
    })

    const unfulfilledMessage = watch('unfulfilledMessage')

    const computedPreviewOrders = useMemo(
        () => buildPreviewOrders(unfulfilledMessage),
        [unfulfilledMessage],
    )

    const { updatePreviewOrders, displayPage, onChatPreviewLoaded } =
        useChatPreviewPanelContext()

    useEffect(() => {
        return onChatPreviewLoaded(() => {
            updatePreviewOrders(computedPreviewOrders)
            displayPage('track', {
                orderName: Object.values(computedPreviewOrders.orders)[0]?.name,
            })
        }, true)
    }, [
        onChatPreviewLoaded,
        updatePreviewOrders,
        computedPreviewOrders,
        displayPage,
    ])

    useEffect(() => {
        updatePreviewOrders(computedPreviewOrders)
    }, [computedPreviewOrders, updatePreviewOrders])

    const onSave = handleSubmit(async ({ unfulfilledMessage }) => {
        if (!trackOrderFlow) return
        await handleTrackOrderFlowUpdate({
            ...trackOrderFlow,
            unfulfilledMessage: {
                text: unfulfilledMessage,
                html: unfulfilledMessage,
            },
        })
    })

    const isLoading = !selfServiceConfiguration

    return (
        <>
            <OrderManagementFlowHeader
                title="Track order"
                onSave={onSave}
                isSaveDisabled={!formState.isDirty || isUpdatePending}
            />
            <Box flexDirection="column" gap="sm" p="lg">
                {isLoading ? (
                    <Skeleton height={120} />
                ) : (
                    <>
                        <Text size="md">Response for unfulfilled orders</Text>
                        <textarea
                            className={css.textarea}
                            {...register('unfulfilledMessage')}
                        />
                        <Text size="sm" color="content-neutral-secondary">
                            Display a custom message when customers track orders
                            that have not been packed and shipped. This is
                            useful for reminding customers of expected shipping
                            timelines or to inform them about possible delays.
                        </Text>
                    </>
                )}
            </Box>
        </>
    )
}
