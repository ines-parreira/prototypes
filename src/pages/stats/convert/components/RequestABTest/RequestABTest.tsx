import React, {useState, useMemo, useCallback} from 'react'
import {useParams} from 'react-router-dom'

import {toJS} from 'utils'

import Button from 'pages/common/components/button/Button'

import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationById} from 'state/integrations/selectors'

import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {useListABTests} from 'models/convert/abTest/queries'
import {ABTestListOptions as ABTestListOptionsParams} from 'models/convert/abTest/types'
import {useCreateABTest} from 'pages/convert/abTests/hooks/useCreateABTest'
import {useUpdateABTest} from 'pages/convert/abTests/hooks/useUpdateABTest'
import {useGetNamespacedShopNameForStore} from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import RequestABTestModal from 'pages/stats/convert/components/RequestABTestModal'
import ViewABTestModal from 'pages/stats/convert/components/ViewABTestModal'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'

import {useCanRequestABTest} from 'pages/stats/convert/hooks/stats/useCanRequestABTest'

import css from './RequestABTest.less'

const RequestABTest = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: integrationId} =
        useParams<ConvertRouteParams>()
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    const chatIntegrationId = parseInt(integrationId)
    const integration = useAppSelector(getIntegrationById(chatIntegrationId))

    const {selectedIntegrations} = useCampaignStatsFilters()

    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const {channelConnection, isLoading: isChannelConnectionLoading} =
        useGetOrCreateChannelConnection(toJS(integration))

    const {mutateAsync: createABTest} = useCreateABTest()
    const {mutateAsync: updateABTest} = useUpdateABTest()

    const {isFetching, canRequestABTest} =
        useCanRequestABTest(namespacedShopName)

    const abTestListOptions = useMemo(() => {
        const channelConnectionId = channelConnection?.id
        return {
            channelConnectionId: channelConnectionId,
            state: 'active',
        } as ABTestListOptionsParams
    }, [channelConnection])

    const {data: abTests, isLoading: areABTestLoading} = useListABTests(
        abTestListOptions,
        {
            enabled: !!channelConnection && !!abTestListOptions,
        }
    )

    const handleCreateABTest = useCallback(async () => {
        if (!!channelConnection) {
            await createABTest([
                undefined,
                {
                    channel_connection_id: channelConnection.id,
                },
            ])
        }
    }, [channelConnection, createABTest])

    const handleStopABTest = useCallback(async () => {
        if (!abTests) {
            return
        }

        await updateABTest([
            undefined,
            {
                ab_test_id: abTests[0].id,
            },
            {
                state: 'inactive',
            },
        ])
    }, [abTests, updateABTest])

    const hasOngoingTest = useMemo(() => {
        if (!abTests) {
            return false
        }
        return abTests?.length > 0
    }, [abTests])

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const startABTestTestSubmit = async () => {
        await handleCreateABTest()
        closeModal()
    }

    const stopTestSubmit = async () => {
        await handleStopABTest()
        closeModal()
    }

    if (isFetching || isChannelConnectionLoading) {
        return null
    }

    if (!hasOngoingTest && !canRequestABTest) {
        return null
    }

    return (
        <div className={css.container}>
            <Button
                onClick={openModal}
                intent="secondary"
                isLoading={areABTestLoading}
                data-testid="request-ab-test-modal"
                className={css.btn}
            >
                {hasOngoingTest ? 'View ongoing A/B test' : 'Request A/B Test'}
            </Button>
            <ViewABTestModal
                abTests={abTests}
                isOpen={hasOngoingTest && isModalOpen}
                onClose={closeModal}
                onSubmit={stopTestSubmit}
            />
            <RequestABTestModal
                isOpen={!hasOngoingTest && isModalOpen}
                onClose={closeModal}
                onSubmit={startABTestTestSubmit}
            />
        </div>
    )
}

export default RequestABTest
