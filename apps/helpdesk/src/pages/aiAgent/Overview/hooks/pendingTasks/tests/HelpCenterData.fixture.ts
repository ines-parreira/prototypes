import type { FaqHelpCentersData } from '../useFetchFaqHelpCentersData'

type AllKeys = keyof HelpCenterDataFixture
type ConfiguredHelpCenterDataFixture<
    ToKeepFunctions extends keyof HelpCenterDataFixture,
> = Omit<HelpCenterDataFixture, Exclude<AllKeys, ToKeepFunctions>>

export type HelpCenterDataFixtureFullyConfigured =
    ConfiguredHelpCenterDataFixture<'build'>

type InternalData = {
    helpCenterId: number
}
export class HelpCenterDataFixture {
    private internalData: InternalData = {
        helpCenterId: 1,
    }
    private helpCenterData: FaqHelpCentersData

    private constructor() {
        this.helpCenterData = []
    }

    static start() {
        return new HelpCenterDataFixture() as ConfiguredHelpCenterDataFixture<
            'withNoHelpCenter' | 'withFaqHelpCenter'
        >
    }

    withNoHelpCenter() {
        this.helpCenterData = []
        return this as HelpCenterDataFixtureFullyConfigured
    }

    withFaqHelpCenter(helpcenterId?: number) {
        this.helpCenterData.push({
            id: helpcenterId ?? this.internalData.helpCenterId++,
            type: 'faq',
        } as Partial<FaqHelpCentersData[number]> as any)

        return this as HelpCenterDataFixtureFullyConfigured
    }

    build(): FaqHelpCentersData {
        return this.helpCenterData
    }
}
