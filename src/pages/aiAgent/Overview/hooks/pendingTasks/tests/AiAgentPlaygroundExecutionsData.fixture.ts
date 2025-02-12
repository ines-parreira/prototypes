import {AiAgentPlaygroundExecutionsData} from '../useFetchAiAgentPlaygroundExecutionsData'

type AllKeys = keyof AiAgentPlaygroundExecutionsDataFixture
type ConfiguredAiAgentPlaygroundExecutionsDataFixture<
    ToKeepFunctions extends keyof AiAgentPlaygroundExecutionsDataFixture,
> = Omit<
    AiAgentPlaygroundExecutionsDataFixture,
    Exclude<AllKeys, ToKeepFunctions>
>

export type AiAgentPlaygroundExecutionsDataFixtureFullyConfigured =
    ConfiguredAiAgentPlaygroundExecutionsDataFixture<'build'>

export class AiAgentPlaygroundExecutionsDataFixture {
    private aiAgentPlaygroundExecutionsData: AiAgentPlaygroundExecutionsData

    private constructor() {
        this.aiAgentPlaygroundExecutionsData =
            {} as Partial<AiAgentPlaygroundExecutionsData> as any
    }

    static start() {
        return new AiAgentPlaygroundExecutionsDataFixture() as ConfiguredAiAgentPlaygroundExecutionsDataFixture<
            'withoutExecution' | 'withExecutionsCount'
        >
    }

    withoutExecution() {
        this.aiAgentPlaygroundExecutionsData = {count: 0}
        return this as AiAgentPlaygroundExecutionsDataFixtureFullyConfigured
    }

    withExecutionsCount(count: number) {
        this.aiAgentPlaygroundExecutionsData = {count}
        return this as AiAgentPlaygroundExecutionsDataFixtureFullyConfigured
    }

    build(): AiAgentPlaygroundExecutionsData {
        return this.aiAgentPlaygroundExecutionsData
    }
}
