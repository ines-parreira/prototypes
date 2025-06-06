import { fromJS } from 'immutable'

import { Integration, IntegrationType } from 'models/integration/types'
import { initialState as initialStatsFiltersState } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { initialState } from 'state/ui/stats/filtersSlice'

import { IntegrationFixture } from './Integration.fixture'

type AllKeys = keyof AiAgentOverviewRootStateFixture
type ConfiguredAiAgentOverviewRootStateFixture<
    ToKeepFunctions extends keyof AiAgentOverviewRootStateFixture,
> = Omit<AiAgentOverviewRootStateFixture, Exclude<AllKeys, ToKeepFunctions>>

export type AiAgentOverviewRootStateFixtureFullyConfigured =
    ConfiguredAiAgentOverviewRootStateFixture<'build'>

type InternalData = {
    integrationId: number
    chatUpdatedAt: string
    storeIntegrationId: string
}

type ChatIntegrationArgs = {
    updatedAt?: string
    isDraft?: boolean
    appId?: string
}

export class AiAgentOverviewRootStateFixture {
    private rootState: RootState
    private integrations: Integration[] = []

    private internalData: InternalData = {
        integrationId: 1,
        chatUpdatedAt: '2021-01-01T00:00:00Z',
        storeIntegrationId: 'storeIntegration123',
    }

    private constructor() {
        this.rootState = {
            currentAccount: fromJS({
                domain: 'storybookaccountdomain',
            }),
            integrations: fromJS({ integrations: [] }),
            entities: {
                selfServiceConfigurations: fromJS({
                    data: {
                        id: this.internalData.storeIntegrationId,
                    },
                }),
            },
            ui: {
                stats: { filters: initialState },
            },
            stats: initialStatsFiltersState,
        } as Partial<RootState> as RootState
    }

    static start() {
        return new AiAgentOverviewRootStateFixture() as ConfiguredAiAgentOverviewRootStateFixture<
            | 'with2ShopifyIntegrations'
            | 'withGmailEmailIntegration'
            | 'withChatIntegration'
            | 'build'
        >
    }

    with2ShopifyIntegrations() {
        this.integrations.push(
            IntegrationFixture.start()
                .asShopify()
                .withDetails({
                    id: this.internalData.integrationId++,
                    name: `Super Store`,
                    storeIntegrationId: this.internalData.storeIntegrationId,
                })
                .build(),
        )
        this.integrations.push(
            IntegrationFixture.start()
                .asShopify()
                .withDetails({
                    id: this.internalData.integrationId++,
                    name: `Awesome Store`,
                    storeIntegrationId: this.internalData.storeIntegrationId,
                })
                .build(),
        )

        return this as ConfiguredAiAgentOverviewRootStateFixture<
            'withGmailEmailIntegration' | 'withChatIntegration'
        > &
            AiAgentOverviewRootStateFixtureFullyConfigured
    }

    withGmailEmailIntegration() {
        const id = this.internalData.integrationId++
        this.integrations.push(
            IntegrationFixture.start()
                .asEmail({
                    type: IntegrationType.Gmail,
                    address: `gmail-${id}@gmail.com`,
                })
                .withDetails({
                    id,
                    name: `Email ${id}`,
                    storeIntegrationId: this.internalData.storeIntegrationId,
                })
                .build(),
        )
        return this as ConfiguredAiAgentOverviewRootStateFixture<
            | 'with2ShopifyIntegrations'
            | 'withGmailEmailIntegration'
            | 'withChatIntegration'
        > &
            AiAgentOverviewRootStateFixtureFullyConfigured
    }

    withChatIntegration({
        updatedAt,
        isDraft = false,
        appId,
    }: ChatIntegrationArgs = {}) {
        const id = this.internalData.integrationId++
        const _updatedAt = new Date(
            updatedAt ?? this.internalData.chatUpdatedAt,
        )
        if (updatedAt) {
            _updatedAt.setSeconds(_updatedAt.getSeconds() + 1)
        }

        this.integrations.push(
            IntegrationFixture.start()
                .asChat({ updatedAt: _updatedAt.toISOString(), appId })
                .withDetails({
                    id,
                    name: `Chat ${id}`,
                    isDraft,
                    storeIntegrationId: this.internalData.storeIntegrationId,
                })
                .build(),
        )
        return this as ConfiguredAiAgentOverviewRootStateFixture<
            | 'with2ShopifyIntegrations'
            | 'withGmailEmailIntegration'
            | 'withChatIntegration'
        > &
            AiAgentOverviewRootStateFixtureFullyConfigured
    }

    build(): RootState {
        this.rootState = {
            ...this.rootState,
            integrations: fromJS({
                integrations: this.integrations,
            }),
        } as RootState

        return this.rootState
    }
}
