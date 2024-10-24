import classnames from 'classnames'
import React, {useState, useMemo, useCallback} from 'react'
import {useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {useListABTests} from 'models/convert/abTest/queries'
import {
    ABTest,
    ABTestListOptions as ABTestListOptionsParams,
} from 'models/convert/abTest/types'
import Button from 'pages/common/components/button/Button'
import UpdateReportLinkModal from 'pages/convert/abTests/components/UpdateReportLinkModal'
import {useUpdateABTest} from 'pages/convert/abTests/hooks/useUpdateABTest'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {getIntegrationById} from 'state/integrations/selectors'
import {toJS} from 'utils'

import css from './UpdateABTestView.less'

const UpdateABTestView = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: integrationId} =
        useParams<ConvertRouteParams>()

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false)

    const chatIntegrationId = parseInt(integrationId)
    const integration = useAppSelector(getIntegrationById(chatIntegrationId))

    const {channelConnection, isLoading: isChannelConnectionLoading} =
        useGetOrCreateChannelConnection(toJS(integration))

    const {mutateAsync: updateABTest} = useUpdateABTest()

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

    const abTest = useMemo<ABTest | undefined>(() => {
        if (!abTests) {
            return undefined
        }
        return abTests[0]
    }, [abTests])

    const handleUpdateABTest = useCallback(
        async (data: any) => {
            if (!abTests) {
                return
            }

            await updateABTest([
                undefined,
                {
                    ab_test_id: abTests[0].id,
                },
                data,
            ])
        },
        [abTests, updateABTest]
    )

    const updateObject = async (data: any) => {
        await handleUpdateABTest(data)
        setIsUpdateModalOpen(false)
    }

    const hasOngoingTest = useMemo(() => {
        if (!abTests) {
            return false
        }
        return abTests?.length > 0
    }, [abTests])

    if (isChannelConnectionLoading || areABTestLoading) {
        return null
    }

    return (
        <div className={classnames('full-width', css.pageContainer)}>
            <h3>Update A/B Test!</h3>
            <div>
                {hasOngoingTest ? (
                    <Button onClick={() => setIsUpdateModalOpen(true)}>
                        Update Report Link
                    </Button>
                ) : (
                    <span>First run A/B Test</span>
                )}
            </div>
            <UpdateReportLinkModal
                abTest={abTest}
                isOpen={isUpdateModalOpen}
                onSubmit={updateObject}
                onClose={() => setIsUpdateModalOpen(false)}
            />
        </div>
    )
}

export default UpdateABTestView
