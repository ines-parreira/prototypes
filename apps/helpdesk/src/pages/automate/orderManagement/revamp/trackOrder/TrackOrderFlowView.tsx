import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { Box, Skeleton, Text } from '@gorgias/axiom'

import useTrackOrderFlow from '../../legacy/trackOrder/hooks/useTrackOrderFlow'
import { OrderManagementFlowHeader } from '../components/OrderManagementFlowHeader/OrderManagementFlowHeader'

import css from './TrackOrderFlowView.less'

type FormValues = {
    unfulfilledMessage: string
}

export const TrackOrderFlowView = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const {
        trackOrderFlow,
        isUpdatePending,
        selfServiceConfiguration,
        handleTrackOrderFlowUpdate,
    } = useTrackOrderFlow(shopName)

    const { register, handleSubmit, formState } = useForm<FormValues>({
        values: {
            unfulfilledMessage: trackOrderFlow?.unfulfilledMessage?.text ?? '',
        },
    })

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
