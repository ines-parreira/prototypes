import {HelpCenterClient} from 'rest_api/help_center_api'
import {getHelpCenterArticles} from '../resources'

const help_center_id = 1

describe('resources', () => {
    describe('getHelpCenterArticles', () => {
        it('should return null when client is not set', async () => {
            const result = await getHelpCenterArticles(
                undefined,
                {help_center_id},
                {}
            )

            expect(result).toBeNull()
        })

        it('should return correct params from API', async () => {
            const listArticles = jest
                .fn()
                .mockReturnValue(Promise.resolve({data: []}))
            const result = await getHelpCenterArticles(
                {listArticles} as unknown as HelpCenterClient,
                {help_center_id},
                {}
            )

            expect(result).toEqual([])
        })
    })
})
