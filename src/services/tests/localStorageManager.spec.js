// @flow

import localStorageManager from '../localStorageManager'
import {SHOPIFY_INTEGRATION_TYPE} from '../../constants/integration'

describe('localStorageManager', () => {
    beforeAll(() => {
        window.localStorage.clear()
    })

    afterEach(() => {
        window.localStorage.clear()
    })

    describe('integrations', () => {
        describe('[SHOPIFY_INTEGRATION_TYPE]', () => {
            describe('draftOrders', () => {
                const methods = localStorageManager.integrations[SHOPIFY_INTEGRATION_TYPE].draftOrders
                const key = methods._key

                describe('getList()', () => {
                    it('should get list of IDs when list is not defined', () => {
                        const ids = methods.getList()
                        expect(ids).toEqual(new Set())
                    })

                    it('should get list of IDs when list is defined', () => {
                        window.localStorage.setItem(key, JSON.stringify([1, 2, 3]))
                        const ids = methods.getList()
                        expect(ids).toEqual(new Set([1, 2, 3]))
                    })
                })

                describe('setList()', () => {
                    it('should set list of IDs when list is empty', () => {
                        methods.setList([])
                        const ids = JSON.parse(window.localStorage.getItem(key))
                        expect(ids).toEqual([])
                    })

                    it('should set list of IDs when list is not empty', () => {
                        methods.setList([1, 2, 3])
                        const ids = JSON.parse(window.localStorage.getItem(key))
                        expect(ids).toEqual([1, 2, 3])
                    })
                })

                describe('addListItem()', () => {
                    it('should add ID when list is not defined', () => {
                        methods.addListItem(1)
                        const ids = JSON.parse(window.localStorage.getItem(key))
                        expect(ids).toEqual([1])
                    })

                    it('should add ID when list is defined', () => {
                        window.localStorage.setItem(key, JSON.stringify([1]))

                        methods.addListItem(2)
                        const ids = JSON.parse(window.localStorage.getItem(key))
                        expect(ids).toEqual([1, 2])
                    })
                })

                describe('removeListItem()', () => {
                    it('should remove ID when list is not defined', () => {
                        methods.removeListItem(1)
                        const ids = JSON.parse(window.localStorage.getItem(key))
                        expect(ids).toEqual([])
                    })

                    it('should remove ID when list is defined', () => {
                        window.localStorage.setItem(key, JSON.stringify([1, 2, 3]))

                        methods.removeListItem(1)
                        const ids = JSON.parse(window.localStorage.getItem(key))
                        expect(ids).toEqual([2, 3])
                    })
                })
            })
        })
    })
})
