import type { GuidanceArticle } from 'pages/aiAgent/types'

import type { GuidancesData } from '../useFetchGuidancesData'

type AllKeys = keyof GuidancesDataFixture
type ConfiguredGuidancesDataFixture<
    ToKeepFunctions extends keyof GuidancesDataFixture,
> = Omit<GuidancesDataFixture, Exclude<AllKeys, ToKeepFunctions>>

export type GuidancesDataFixtureFullyConfigured =
    ConfiguredGuidancesDataFixture<'build'>

type WithGuidanceArgs = {
    aiGenerated: boolean
    visibility: 'PUBLIC' | 'UNLISTED'
}
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
            'withoutGuidance' | 'withPublicGuidance' | 'withUnlistedGuidance'
        >
    }

    withoutGuidance() {
        this.guidancesData = []
        return this as GuidancesDataFixtureFullyConfigured
    }

    private withGuidance({ aiGenerated, visibility }: WithGuidanceArgs) {
        const id = this.internalData.guidanceId++
        this.guidancesData.push({
            id,
            visibility,
            templateKey: aiGenerated ? `ai_guidance_id_${id}` : 'none',
        } as Partial<GuidanceArticle> as any)
    }

    withPublicGuidance({ aiGenerated = false } = {}) {
        this.withGuidance({ aiGenerated, visibility: 'PUBLIC' })
        return this as ConfiguredGuidancesDataFixture<
            'withPublicGuidance' | 'withUnlistedGuidance' | 'build'
        >
    }

    withUnlistedGuidance({ aiGenerated = false } = {}) {
        this.withGuidance({ aiGenerated, visibility: 'UNLISTED' })
        return this as ConfiguredGuidancesDataFixture<
            'withPublicGuidance' | 'withUnlistedGuidance' | 'build'
        >
    }

    build(): GuidancesData {
        return this.guidancesData
    }
}
