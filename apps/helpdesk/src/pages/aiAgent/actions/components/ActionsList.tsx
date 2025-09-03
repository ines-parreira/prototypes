import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useParams } from 'react-router-dom'

import { useFlag } from 'core/flags'
import useOrderBy from 'hooks/useOrderBy'
import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import GuidanceReferenceProvider from '../providers/GuidanceReferenceProvider'
import StoreAppsProvider from '../providers/StoreAppsProvider'
import StoreTrackstarProvider from '../providers/StoreTrackstarProvider'
import {
    StoresWorkflowConfiguration,
    StoreWorkflowsConfiguration,
} from '../types'
import ActionsRow from './ActionsRow'

import css from './ActionsList.less'

type Props = {
    actions: StoresWorkflowConfiguration
}

export default function ActionsList({ actions }: Props) {
    const { shopName, shopType } = useParams<{
        shopType: 'shopify'
        shopName: string
    }>()
    const { orderDirection, orderBy, orderParam, toggleOrderBy } =
        useOrderBy<'updated'>('updated')

    const showFakeActions = useFlag(FeatureFlagKey.FakeActionPlaceholder)

    const { data: templateSteps = [] } = useGetWorkflowConfigurationTemplates({
        triggers: ['reusable-llm-prompt'],
    })

    const shopifyActionTemplate = templateSteps.find(
        (template) => template.apps[0].type === 'shopify',
    )

    const mockedShopifyOrderDetailsAction: StoreWorkflowsConfiguration =
        useMemo(
            () => ({
                id: 'mocked-get-order-info',
                internal_id: 'mocked-get-order-info',
                account_id: null,
                steps: [
                    {
                        kind: 'reusable-llm-prompt-call',
                        id: 'mocked-get-order-info',
                        settings: {
                            configuration_id: shopifyActionTemplate?.id || '',
                            configuration_internal_id:
                                shopifyActionTemplate?.internal_id || '',
                            values: {},
                        },
                    },
                ],
                transitions: [],
                available_languages: [],
                triggers: [],
                entrypoints: [],
                is_draft: false,
                updated_datetime: '',
                name: 'Get order info',
                apps: [{ type: 'shopify' }],
            }),
            [shopifyActionTemplate],
        )

    const sortedActions = useMemo(() => {
        const orderedActionList = [...actions].sort((a, b) => {
            if (!a.updated_datetime || !b.updated_datetime) {
                return 0
            }
            if (orderParam === 'updated:asc') {
                return a.updated_datetime > b.updated_datetime ? -1 : 1
            }
            if (orderParam === 'updated:desc') {
                return a.updated_datetime < b.updated_datetime ? -1 : 1
            }
            return 0
        })
        if (showFakeActions) {
            orderedActionList.unshift(mockedShopifyOrderDetailsAction)
        }
        return orderedActionList
    }, [actions, orderParam, mockedShopifyOrderDetailsAction, showFakeActions])

    return (
        <StoreTrackstarProvider storeName={shopName} storeType={shopType}>
            <StoreAppsProvider storeName={shopName} storeType={shopType}>
                <GuidanceReferenceProvider actions={sortedActions}>
                    <TableWrapper className={css.tableWrapper}>
                        <TableHead>
                            <HeaderCellProperty
                                title="ACTION NAME"
                                className={css.name}
                            />
                            <HeaderCellProperty title="APPS" />
                            <HeaderCellProperty
                                justifyContent="right"
                                title="LAST UPDATED"
                                direction={orderDirection}
                                isOrderedBy={orderBy === 'updated'}
                                onClick={() => {
                                    toggleOrderBy('updated')
                                }}
                            />
                            <HeaderCell />
                        </TableHead>
                        <TableBody>
                            {sortedActions.map((action) => (
                                <ActionsRow action={action} key={action.id} />
                            ))}
                        </TableBody>
                    </TableWrapper>
                </GuidanceReferenceProvider>
            </StoreAppsProvider>
        </StoreTrackstarProvider>
    )
}
