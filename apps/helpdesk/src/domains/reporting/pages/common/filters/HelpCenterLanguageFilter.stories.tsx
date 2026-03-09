import type { ComponentProps } from 'react'
import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { appQueryClient } from 'api/queryClient'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import HelpCenterLanguageFilter from 'domains/reporting/pages/common/filters/HelpCenterLanguageFilter'
import { campaignsResponseData } from 'fixtures/campaign'
import { campaignKeys } from 'models/convert/campaign/queries'
import type { HelpCenter } from 'models/helpCenter/types'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { HelpCenterApiClientContext } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'
import type { RootState } from 'state/types'

appQueryClient.setQueryData(
    campaignKeys.list({
        channelConnectionExternalIds: ['321'],
        // @ts-ignore-next-line
        deleted: true,
    }),
    {
        data: campaignsResponseData,
    },
)

const mockStore = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: getHelpCentersResponseFixture.data.reduce(
                    (acc: Record<string, HelpCenter>, hCenter) => {
                        acc[hCenter.id] = hCenter
                        return acc
                    },
                    {},
                ),
            },
        },
    },
    stats: {
        filters: {
            period: {
                start_datetime: '',
                end_datetime: '',
            },
            [FilterKey.HelpCenters]: {
                logicalOperator: LogicalOperatorEnum.ONE_OF,
                values: [1],
            },
            [FilterKey.LocaleCodes]: {
                logicalOperator: LogicalOperatorEnum.ONE_OF,
                values: ['en-US'],
            },
        },
    },
} as unknown as RootState

const storyConfig: Meta = {
    title: 'Stats/Filters/HelpCenterLanguageFilter',
    component: HelpCenterLanguageFilter,
}

const Template: StoryFn<ComponentProps<typeof HelpCenterLanguageFilter>> = (
    props,
) => {
    return (
        <Provider store={configureMockStore([thunk])(mockStore)}>
            <HelpCenterApiClientContext.Provider
                value={{
                    isReady: true,
                    client: {
                        listLocales: async () =>
                            Promise.resolve({
                                data: [{ code: 'en-US', name: 'English' }],
                            } as any),
                    } as any,
                }}
            >
                <SupportedLocalesProvider>
                    <HelpCenterLanguageFilter {...props} />
                </SupportedLocalesProvider>
            </HelpCenterApiClientContext.Provider>
        </Provider>
    )
}

export const Default = Template.bind({})
Default.args = {
    value: withDefaultLogicalOperator(['en-US']),
}

export default storyConfig
