import {GuidancesData} from '../useFetchGuidancesData'

type AllKeys = keyof GuidancesDataFixture
type ConfiguredGuidancesDataFixture<
    ToKeepFunctions extends keyof GuidancesDataFixture,
> = Omit<GuidancesDataFixture, Exclude<AllKeys, ToKeepFunctions>>

export type GuidancesDataFixtureFullyConfigured =
    ConfiguredGuidancesDataFixture<'build'>

type InternalData = {
    guidanceId: number
}
export class GuidancesDataFixture {
    private guidancesData: GuidancesData
    private internalData: InternalData = {
        guidanceId: 1,
    }

    private constructor() {
        this.guidancesData = []
    }

    static start() {
        return new GuidancesDataFixture() as ConfiguredGuidancesDataFixture<
            'withoutGuidance' | 'withGuidance'
        >
    }

    withoutGuidance() {
        this.guidancesData = []
        return this as GuidancesDataFixtureFullyConfigured
    }

    withGuidance() {
        this.guidancesData.push({
            id: this.internalData.guidanceId++,
        } as any)
        return this as GuidancesDataFixtureFullyConfigured
    }

    build(): GuidancesData {
        return this.guidancesData
    }
}
