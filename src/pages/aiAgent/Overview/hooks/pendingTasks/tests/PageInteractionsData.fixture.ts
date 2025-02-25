import { PageInteractionsData } from '../useFetchPageInteractionsData'

type AllKeys = keyof PageInteractionsDataFixture
type ConfiguredPageInteractionsDataFixture<
    ToKeepFunctions extends keyof PageInteractionsDataFixture,
> = Omit<PageInteractionsDataFixture, Exclude<AllKeys, ToKeepFunctions>>

export type PageInteractionsDataFixtureFullyConfigured =
    ConfiguredPageInteractionsDataFixture<'build'>

export class PageInteractionsDataFixture {
    private pageInteractionsData: PageInteractionsData

    private constructor() {
        this.pageInteractionsData = {} as Partial<PageInteractionsData> as any
    }

    static start() {
        return new PageInteractionsDataFixture() as ConfiguredPageInteractionsDataFixture<
            'withPageInteractions' | 'withoutPageInteraction'
        >
    }

    withoutPageInteraction() {
        this.pageInteractionsData.pageInteractions = []
        return this as ConfiguredPageInteractionsDataFixture<
            | 'withConvertChatInstallSnippetEnabled'
            | 'withConvertChatInstallSnippetDisabled'
        >
    }

    withPageInteractions() {
        this.pageInteractionsData.pageInteractions = []
        this.pageInteractionsData.pageInteractions.push({})
        return this as ConfiguredPageInteractionsDataFixture<
            | 'withConvertChatInstallSnippetEnabled'
            | 'withConvertChatInstallSnippetDisabled'
        >
    }

    withConvertChatInstallSnippetEnabled() {
        this.pageInteractionsData.isConvertChatInstallSnippetEnabled = true
        return this as PageInteractionsDataFixtureFullyConfigured
    }

    withConvertChatInstallSnippetDisabled() {
        this.pageInteractionsData.isConvertChatInstallSnippetEnabled = false
        return this as PageInteractionsDataFixtureFullyConfigured
    }

    build() {
        return this.pageInteractionsData
    }
}
