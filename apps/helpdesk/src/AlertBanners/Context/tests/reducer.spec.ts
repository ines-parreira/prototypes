import { AlertBannerTypes, BannerCategories, ContextBanner } from '../../types'
import { bannersReducer } from '../reducer'
import { BannerActionTypes } from '../types'

const banner1 = {
    type: AlertBannerTypes.Critical,
    category: BannerCategories.STATUS_PAGE_INCIDENT,
    instanceId: '1',
    message: 'oyooo',
}

const banner2 = {
    type: AlertBannerTypes.Warning,
    category: BannerCategories.STATUS_PAGE_MAINTENANCE,
    instanceId: '2',
    message: 'wayaaa',
}

const banner3 = {
    type: AlertBannerTypes.Critical,
    category: BannerCategories.STATUS_PAGE_INCIDENT,
    instanceId: '3',
    message: 'oh no, another incident',
}

describe('bannersReducer', () => {
    describe('ADD', () => {
        it("should default to inserting a banner as if it was of type 'Info'", () => {
            const state: ContextBanner[] = [banner1, banner2]
            const action = {
                type: BannerActionTypes.ADD,
                payload: {
                    ...banner1,
                    instanceId: '3',
                    type: undefined,
                },
            }

            const result = bannersReducer(state, action)
            expect(result).toEqual([...state, action.payload])
        })

        it('should add a banner to the state', () => {
            const state: ContextBanner[] = []
            const action = {
                type: BannerActionTypes.ADD,
                payload: banner1,
            }

            const result = bannersReducer(state, action)
            expect(result).toEqual([action.payload])
        })

        it('should add a banner to the state at the correct position', () => {
            const state = [banner1, banner2]
            const action = {
                type: BannerActionTypes.ADD,
                payload: {
                    ...banner1,
                    instanceId: 'exclusive',
                    type: AlertBannerTypes.Warning,
                },
            }

            const result = bannersReducer(state, action)
            expect(result).toEqual([banner1, action.payload, banner2])
        })

        it('should not add a banner if it is already in the state', () => {
            const state = [banner1]
            const action = {
                type: BannerActionTypes.ADD,
                payload: banner1,
            }

            const result = bannersReducer(state, action)
            expect(result).toEqual(state)
        })
    })

    describe('REMOVE_CATEGORY', () => {
        it('should do nothing if there is no banner of this category in the state', () => {
            const state = [banner1]
            const action = {
                type: BannerActionTypes.REMOVE_CATEGORY,
                category: banner2.category,
            }

            const result = bannersReducer(state, action)
            expect(result).toBe(state)
        })

        it('should remove all banners of a category from the state', () => {
            const state = [banner1, banner1, banner2, banner1]
            const action = {
                type: BannerActionTypes.REMOVE_CATEGORY,
                category: banner1.category,
            }

            const result = bannersReducer(state, action)
            expect(result).toEqual([banner2])
        })
    })

    describe('REMOVE_BANNER', () => {
        it('should do nothing if there is no banner of this category/instanceId in the state', () => {
            const state = [banner1]
            const action = {
                type: BannerActionTypes.REMOVE_BANNER,
                category: banner2.category,
                instanceId: banner2.instanceId,
            }

            const result = bannersReducer(state, action)
            expect(result).toBe(state)
        })

        it('should remove a banner from the state', () => {
            const state = [banner1, banner2, banner3]
            const action = {
                type: BannerActionTypes.REMOVE_BANNER,
                category: banner1.category,
                instanceId: banner1.instanceId,
            }

            const result = bannersReducer(state, action)

            expect(result).toEqual([banner2, banner3])
        })
    })
})
