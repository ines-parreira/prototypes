import * as search from '../search'
import * as fixtures from '../../../fixtures/macro'
import {fromJS} from 'immutable'

describe('search', () => {
    describe('macro', () => {
        beforeEach(() => {
            search.populate(fromJS(fixtures.macros), true)
        })

        it('should reset and populate', () => {
            const macros = fromJS(fixtures.macros.slice(1))
            search.populate(macros, true)
            expect(search.index.documentStore.length).toEqual(fixtures.macros.length - 1)
        })

        it('should search name', () => {
            const macroIds = search.search('waive')
            expect(macroIds).toEqual(['1', '2'])
        })

        it('should search tags', () => {
            const macroIds = search.search('rejectedTag')
            expect(macroIds).toEqual(['2'])
        })

        it('should search body', () => {
            const macroIds = search.search('patience')
            expect(macroIds).toEqual(['2'])
        })

        it('should search partial words', () => {
            let macroIds = search.search('patien')
            expect(macroIds).toEqual(['2'])

            macroIds = search.search('waiv')
            expect(macroIds).toEqual(['1', '2'])
        })

        it('should search with custom config', () => {
            let macroIds = search.search('patience', {
                fields: {
                    name: {boost: 4}
                }
            })
            expect(macroIds).toEqual([])

            macroIds = search.search('patience', {
                fields: {
                    body: {boost: 4}
                }
            })
            expect(macroIds).toEqual(['2'])
        })

        it('should add', () => {
            const macro = {
                id: 4,
                name: 'a macro',
                actions: [{
                    arguments: {tags: 'uniqueTag'},
                    name: 'addTags'
                }, {
                    name: 'setResponseText',
                    arguments: {
                        body_text: 'some text',
                    },
                }]
            }
            search.add(macro)

            let macroIds = search.search('uniqueTag')
            expect(macroIds).toEqual(['4'])

            macroIds = search.search('some text')
            expect(macroIds).toEqual(['4'])
        })

        it('should update', () => {
            const macro = fixtures.macros.slice(-1)[0]
            macro.name = 'unique macro name'
            search.update(macro)

            let macroIds = search.search('unique')
            expect(macroIds).toEqual([macro.id.toString()])
        })

        it('should delete', () => {
            const macro = fixtures.macros.slice(-1)[0]
            macro.name = 'unique macro name'
            search.remove(macro)

            let macroIds = search.search('unique')
            expect(macroIds).toEqual([])
        })
    })
})
