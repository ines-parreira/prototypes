import * as utils from '../utils'
import moment from 'moment'

describe('utils', () => {
    describe('RecentViewStorage', () => {
        describe('get()', () => {
            it('should return undefined(invalid data stored)', () => {
                expect(utils.recentViewsStorage.get()).toBe(undefined)
                localStorage.setItem('recentViews', JSON.stringify({1: {}}))
                expect(utils.recentViewsStorage.get()).toBe(undefined)
                localStorage.setItem('recentViews', JSON.stringify(1))
                expect(utils.recentViewsStorage.get()).toBe(undefined)
                localStorage.setItem('recentViews', JSON.stringify('hello'))
                expect(utils.recentViewsStorage.get()).toBe(undefined)
            })

            it('should not crash if there is no storage', () => {
                const _storage = utils.recentViewsStorage.storage
                utils.recentViewsStorage.storage = {}
                utils.recentViewsStorage.get()
                utils.recentViewsStorage.storage = _storage
            })

            it('should get recent views', () => {
                localStorage.setItem('recentViews', JSON.stringify([1, 2]))

                const beforeGetDt = moment.utc()
                const views = utils.recentViewsStorage.get()
                const now = moment.utc().add(10, 's')

                expect(Object.keys(views)).toEqual(['1', '2'])

                for (let view in views) {
                    expect(moment(view.updated_datetime).isBetween(beforeGetDt, now)).toBe(true)
                    expect(moment(view.inserted_datetime).isBetween(beforeGetDt, now)).toBe(true)
                }
            })
        })

        describe('set()', () => {
            it('should not crash if there is no storage', () => {
                const _storage = utils.recentViewsStorage.storage
                utils.recentViewsStorage.storage = {}
                utils.recentViewsStorage.set([1, 2])
                utils.recentViewsStorage.storage = _storage
            })

            it('should set recent views', () => {
                utils.recentViewsStorage.set([1, 2])
                expect(JSON.parse(localStorage.getItem('recentViews'))).toEqual([1,2])
            })
        })
    })
})
