import moment from 'moment'

import localStorageManager from '../localStorageManager'
import {IntegrationType} from '../../models/integration/types'

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
                    localStorageManager.integrations[
                        IntegrationType.ShopifyIntegrationType
                    ].draftOrders
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
                        expect(values).toEqual(new Map(entries as any))
                    })
                })

                describe('setMapItem()', () => {
                    it('should set value when map is not defined', () => {
                        // When
                        methods.setMapItem(1 as any, now)

                        // Then
                        const values = JSON.parse(
                            window.localStorage.getItem(key) as any
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
                        methods.setMapItem(2 as any, soon)

                        // Then
                        const values = JSON.parse(
                            window.localStorage.getItem(key) as any
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
                        methods.deleteMapItem(1 as any)

                        // Then
                        const values = JSON.parse(
                            window.localStorage.getItem(key) as any
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
                        methods.deleteMapItem(1 as any)

                        // Then
                        const values = JSON.parse(
                            window.localStorage.getItem(key) as any
                        )
                        expect(values).toEqual([[2, soon]])
                    })
                })
            })
        })
    })
})
