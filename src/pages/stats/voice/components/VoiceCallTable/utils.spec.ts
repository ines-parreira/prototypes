import {VoiceCallTableColumnName} from './constants'
import {filterAndOrderCells} from './utils'

describe('utils', () => {
    describe('filterAndOrderCells', () => {
        it('should return an array of cells with the correct order', () => {
            const allColumns = {
                column1: {props: {someProp: 'someValue'}},
                column2: {props: {someProp: 'someValue'}},
                column3: {props: {someProp: 'someValue'}},
            }
            const requiredColumns = ['column2', 'column1']

            const result = filterAndOrderCells(
                allColumns as any,
                requiredColumns as VoiceCallTableColumnName[]
            )

            expect(result).toEqual([
                {key: 'column2', props: {someProp: 'someValue'}},
                {key: 'column1', props: {someProp: 'someValue'}},
            ])
        })
    })
})
