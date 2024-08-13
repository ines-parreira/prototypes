import {HelpCenterClient} from 'rest_api/help_center_api/client'
import {getAIGuidanceFixture} from 'pages/automate/aiAgent/fixtures/aiGuidance.fixture'
import {getAIGeneratedGuidances} from '../resources/guidances'

const help_center_id = 1
const store_integration_id = 1

const mockedAIGuidances = [getAIGuidanceFixture('1'), getAIGuidanceFixture('2')]

describe('resources', () => {
    describe('getHelpCenterArticles', () => {
        it('should return null when client is not set', async () => {
            const result = await getAIGeneratedGuidances(undefined, {
                help_center_id,
                store_integration_id,
            })

            expect(result).toBeNull()
        })

        it('should return correct params from API', async () => {
            const listAIGuidancesByHelpCenterAndStore = jest
                .fn()
                .mockReturnValue(Promise.resolve({data: mockedAIGuidances}))
            const result = await getAIGeneratedGuidances(
                {
                    listAIGuidancesByHelpCenterAndStore,
                } as unknown as HelpCenterClient,
                {help_center_id, store_integration_id}
            )

            expect(result).toEqual(mockedAIGuidances)
        })
    })
})
