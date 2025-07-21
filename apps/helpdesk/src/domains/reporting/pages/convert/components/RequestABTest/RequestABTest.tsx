import React, { useCallback, useMemo, useState } from 'react'

import { useParams } from 'react-router-dom'

import css from 'domains/reporting/pages/convert/components/RequestABTest/RequestABTest.less'
import RequestABTestModal from 'domains/reporting/pages/convert/components/RequestABTestModal'
import ViewABTestModal from 'domains/reporting/pages/convert/components/ViewABTestModal'
import { useCanRequestABTest } from 'domains/reporting/pages/convert/hooks/stats/useCanRequestABTest'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { useGetNamespacedShopNameForStore } from 'domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'
import useAppSelector from 'hooks/useAppSelector'
import { useListABTests } from 'models/convert/abTest/queries'
import { ABTestListOptions as ABTestListOptionsParams } from 'models/convert/abTest/types'
import {
    GorgiasChatIntegration,
    IntegrationType,
} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import { useCreateABTest } from 'pages/convert/abTests/hooks/useCreateABTest'
import { useUpdateABTest } from 'pages/convert/abTests/hooks/useUpdateABTest'
import { CONVERT_ROUTE_PARAM_NAME } from 'pages/convert/common/constants'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import { ConvertRouteParams } from 'pages/convert/common/types'
import { getIntegrationById } from 'state/integrations/selectors'
import { toJS } from 'utils'

const RequestABTest = () => {
    const { [CONVERT_ROUTE_PARAM_NAME]: integrationId } =
        useParams<ConvertRouteParams>()
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    const chatIntegrationId = parseInt(integrationId)
    const integration = useAppSelector(getIntegrationById(chatIntegrationId))

    const { selectedIntegrations } = useCampaignStatsFilters()

    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const { channelConnection, isLoading: isChannelConnectionLoading } =
        useGetOrCreateChannelConnection(toJS(integration))

    const { mutateAsync: createABTest } = useCreateABTest()
    const { mutateAsync: updateABTest } = useUpdateABTest()

    const { isFetching, canRequestABTest } =
        useCanRequestABTest(namespacedShopName)

    const abTestListOptions = useMemo(() => {
        const channelConnectionId = channelConnection?.id
        return {
            channelConnectionId: channelConnectionId,
            state: 'active',
        } as ABTestListOptionsParams
    }, [channelConnection])

    const { data: abTests, isLoading: areABTestLoading } = useListABTests(
        abTestListOptions,
        {
            enabled: !!channelConnection && !!abTestListOptions,
        },
    )

    const handleCreateABTest = useCallback(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const chatIntegration = toJS(integration) as GorgiasChatIntegration
        const shop_integration_id =
            chatIntegration?.meta?.shop_type === IntegrationType.Shopify
                ? chatIntegration.meta?.shop_integration_id
                : null

        if (!!channelConnection) {
            await createABTest([
                undefined,
                {
                    channel_connection_id: channelConnection.id,
                    store_integration_id: shop_integration_id,
                },
            ])
        }
    }, [integration, channelConnection, createABTest])

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
