// @flow

import moment from 'moment'

import localStorageManager from '../localStorageManager'
import {SHOPIFY_INTEGRATION_TYPE} from '../../constants/integration'

describe('localStorageManager', () => {
    const now = moment().format()
    const soon = moment(now).add(5, 'minutes').format()

    beforeAll(() => {
        window.localStorage.clear()
    })

    afterEach(() => {
        window.localStorage.clear()
    })

    describe('integrations', () => {
        describe('[SHOPIFY_INTEGRATION_TYPE]', () => {
            describe('draftOrders', () => {
                const methods =
                    localStorageManager.integrations[SHOPIFY_INTEGRATION_TYPE]
                        .draftOrders
                const key = methods._key

                describe('getMap()', () => {
                    it('should get values when it is not defined', () => {
                        // When
                        const values = methods.getMap()

                        // Then
                        expect(values).toEqual(new Map())
                    })

                    it('should get values when it is defined', () => {
                        // Given
                        const entries = [
                            [1, now],
                            [2, soon],
                        ]
                        window.localStorage.setItem(
                            key,
                            JSON.stringify(entries)
                        )

                        // When
                        const values = methods.getMap()

                        // Then
                        expect(values).toEqual(new Map(entries))
                    })
                })

                describe('setMapItem()', () => {
                    it('should set value when map is not defined', () => {
                        // When
                        methods.setMapItem(1, now)

                        // Then
                        const values = JSON.parse(
                            window.localStorage.getItem(key)
                        )
                        expect(values).toEqual([[1, now]])
                    })

                    it('should set value when map is defined', () => {
                        // Given
                        window.localStorage.setItem(
                            key,
                            JSON.stringify([[1, now]])
                        )

                        // When
                        methods.setMapItem(2, soon)

                        // Then
                        const values = JSON.parse(
                            window.localStorage.getItem(key)
                        )
                        expect(values).toEqual([
                            [1, now],
                            [2, soon],
                        ])
                    })
                })

                describe('deleteMapItem()', () => {
                    it('should remove value when map is not defined', () => {
                        // When
                        methods.deleteMapItem(1)

                        // Then
                        const values = JSON.parse(
                            window.localStorage.getItem(key)
                        )
                        expect(values).toEqual([])
                    })

                    it('should remove value when map is defined', () => {
                        // Given
                        window.localStorage.setItem(
                            key,
                            JSON.stringify([
                                [1, now],
                                [2, soon],
                            ])
                        )

                        // When
                        methods.deleteMapItem(1)

                        // Then
                        const values = JSON.parse(
                            window.localStorage.getItem(key)
                        )
                        expect(values).toEqual([[2, soon]])
                    })
                })
            })
        })
    })
})
