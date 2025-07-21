import { ActionsData } from '../useFetchActionsData'

type AllKeys = keyof ActionsDataFixture
type ConfiguredActionsDataFixture<
    ToKeepFunctions extends keyof ActionsDataFixture,
> = Omit<ActionsDataFixture, Exclude<AllKeys, ToKeepFunctions>>

export type ActionsDataFixtureFullyConfigured =
    ConfiguredActionsDataFixture<'build'>

type WithActionArgs = {
    isDraft: boolean
}
type InternalData = {
    actionId: number
}
export class ActionsDataFixture {
    private actionsData: ActionsData
    private internalData: InternalData = {
        actionId: 1,
    }

    private constructor() {
        this.actionsData = []
    }

    static start() {
        return new ActionsDataFixture() as ConfiguredActionsDataFixture<
            'withoutAction' | 'withPublishedAction' | 'withDraftAction'
        >
    }

    withoutAction() {
        this.actionsData = []
        return this as ActionsDataFixtureFullyConfigured
    }

    private withAction({ isDraft }: WithActionArgs) {
        const id = `${this.internalData.actionId++}`
        this.actionsData.push({
            id,
            is_draft: isDraft,
        } as Partial<ActionsData[number]> as any)
    }

    withPublishedAction() {
        this.withAction({ isDraft: false })
        return this as ConfiguredActionsDataFixture<
            'withPublishedAction' | 'withDraftAction' | 'build'
        >
    }

    withDraftAction() {
        this.withAction({ isDraft: true })
        return this as ConfiguredActionsDataFixture<
            'withPublishedAction' | 'withDraftAction' | 'build'
        >
    }

    build(): ActionsData {
        return this.actionsData
    }
}
