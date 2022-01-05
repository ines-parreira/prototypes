import {section} from '../../../../fixtures/section'
import {RootState} from '../../../types'

import {getSectionIdByName} from '../selectors'
import {SectionsState} from '../types'

describe('sections selectors', () => {
    describe('getSectionIdByName', () => {
        const sectionState = {
            ['1']: {...section, name: 'foo', id: 1},
            ['2']: {...section, name: 'bar', id: 2},
            ['3']: {...section, name: 'baz', id: 3},
        } as SectionsState

        const state: RootState = {
            entities: {
                sections: sectionState,
            },
        } as any

        it('should return a map with the name as key and id as value', () => {
            expect(getSectionIdByName(state)).toMatchSnapshot()
        })
    })
})
