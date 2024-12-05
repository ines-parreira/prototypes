import {BannerActionTypes, BannerCategories, ContextBanner} from '../../types'
import {bannersReducer} from '../reducer'

const banner1 = {
    category: BannerCategories.STATUS_PAGE_INCIDENT,
    instanceId: '1',
    message: 'oyooo',
}

const banner2 = {
    category: BannerCategories.STATUS_PAGE_MAINTENANCE,
    instanceId: '2',
    message: 'wayaaa',
}

describe('bannersReducer', () => {
    describe('ADD', () => {
        it('should add a banner to the state', () => {
            const state: ContextBanner[] = []
            const action = {
                type: BannerActionTypes.ADD,
                payload: banner1,
            }

            const result = bannersReducer(state, action)
            expect(result).toEqual([action.payload])
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

    describe('FORCE_ADD', () => {
        it('should add a banner to the state', () => {
            const state: ContextBanner[] = []
            const action = {
                type: BannerActionTypes.FORCE_ADD,
                payload: banner1,
            }

            const result = bannersReducer(state, action)
            expect(result).toEqual([action.payload])
        })

        it('should not add a banner if it is already in the state', () => {
            const state = [banner1]
            const action = {
                type: BannerActionTypes.FORCE_ADD,
                payload: banner1,
            }

            const result = bannersReducer(state, action)
            expect(result).toEqual(state)
        })
    })

    describe('REMOVE_CATEGORY', () => {
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
        it('should remove a banner from the state', () => {
            const state = [banner1, banner2]
            const action = {
                type: BannerActionTypes.REMOVE_BANNER,
                category: banner1.category,
                instanceId: banner1.instanceId,
            }

            const result = bannersReducer(state, action)
            expect(result).toEqual([banner2])
        })
    })

    describe('DISMISS_BANNER', () => {
        it('should remove a banner from the state', () => {
            const state = [banner1, banner2]
            const action = {
                type: BannerActionTypes.DISMISS_BANNER,
                category: banner1.category,
                instanceId: banner1.instanceId,
            }

            const result = bannersReducer(state, action)
            expect(result).toEqual([banner2])
        })
    })
})
