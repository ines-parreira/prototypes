import {fromJS} from 'immutable'

import {initialState as initialStatsFiltersState} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {initialState} from 'state/ui/stats/filtersSlice'

import {IntegrationFixture} from './Integration.fixture'

type AllKeys = keyof AiAgentOverviewRootStateFixture
type ConfiguredAiAgentOverviewRootStateFixture<
    ToKeepFunctions extends keyof AiAgentOverviewRootStateFixture,
> = Omit<AiAgentOverviewRootStateFixture, Exclude<AllKeys, ToKeepFunctions>>

export type AiAgentOverviewRootStateFixtureFullyConfigured =
    ConfiguredAiAgentOverviewRootStateFixture<'build'>

export class AiAgentOverviewRootStateFixture {
    private rootState: RootState

    private constructor() {
        this.rootState = {
            currentAccount: fromJS({
                domain: 'storybookaccountdomain',
            }),
            integrations: fromJS({integrations: []}),
            ui: {
                stats: {filters: initialState},
            },
            stats: initialStatsFiltersState,
        } as Partial<RootState> as RootState
    }

    static start() {
        return new AiAgentOverviewRootStateFixture() as ConfiguredAiAgentOverviewRootStateFixture<'with2ShopifyIntegrations'>
    }

    with2ShopifyIntegrations() {
        this.rootState = {
            ...this.rootState,
            integrations: fromJS({
                integrations: [
                    IntegrationFixture.start()
                        .asShopify()
                        .withDetails({id: 123, name: `Super Store`})
                        .build(),
                    IntegrationFixture.start()
                        .asShopify()
                        .withDetails({id: 321, name: `Awesome Store`})
                        .build(),
                ],
            }),
        } as RootState
        return this as AiAgentOverviewRootStateFixtureFullyConfigured
    }

    build(): RootState {
        return this.rootState
    }
}
