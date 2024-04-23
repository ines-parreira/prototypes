import {HelpCenterClient} from 'rest_api/help_center_api/client'
import {HELP_CENTER_ROOT_CATEGORY_ID} from 'pages/settings/helpCenter/constants'
import {
    getHelpCenterArticles,
    getCategoryTree,
    getHelpCenterList,
} from '../resources'

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
    describe('getCategoryTree', () => {
        it('should return null when client is not set', async () => {
            const result = await getCategoryTree(
                undefined,
                {
                    help_center_id,
                    parent_category_id: HELP_CENTER_ROOT_CATEGORY_ID,
                },
                {locale: 'en-US'}
            )

            expect(result).toBeNull()
        })

        it('should return correct params from API', async () => {
            const response = {
                created_datetime: '2023-11-21T11:08:23.932Z',
                updated_datetime: '2023-11-21T11:08:23.932Z',
                id: 0,
                help_center_id,
                available_locales: [],
                unlisted_id: 'id',
                children: [],
                articles: [],
            }
            const client = {
                getCategoryTree: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({data: response})),
            }
            const result = await getCategoryTree(
                client as unknown as HelpCenterClient,
                {
                    help_center_id,
                    parent_category_id: HELP_CENTER_ROOT_CATEGORY_ID,
                },
                {locale: 'en-US'}
            )

            expect(result).toEqual(response)
        })
    })

    describe('getHelpCenterList', () => {
        it('should return null when client is not set', async () => {
            const result = await getHelpCenterList(undefined, {})

            expect(result).toBeNull()
        })

        it('should return correct result from API', async () => {
            const client = {
                listHelpCenters: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({data: []})),
            }

            const result = await getHelpCenterList(
                client as unknown as HelpCenterClient,
                {}
            )

            expect(result).toEqual({data: []})
        })
    })
})
