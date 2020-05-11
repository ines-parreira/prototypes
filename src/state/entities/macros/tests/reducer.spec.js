//@flow
import {
    macroCreated,
    macroDeleted,
    macroFetched,
    macroUpdated,
    macrosFetched,
} from '../actions'
import reducer from '../reducer'

import {macros as macrosFixtures} from '../../../../fixtures/macro'

describe('macros reducer', () => {
    describe('createMacro action', () => {
        it('should add a new macro to the state', () => {
            const newState = reducer({}, macroCreated(macrosFixtures[0]))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('deleteMacro action', () => {
        it('should delete a macro from the state', () => {
            const newState = reducer({'1': macrosFixtures[0]}, macroDeleted('1'))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('fetchMacro action', () => {
        it('should add a new macro to the state', () => {
            const newState = reducer({}, macroFetched(macrosFixtures[0]))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('updateMacro action', () => {
        it('should replace an existing macro in the state', () => {
            const updatedMacroMock = {
                ...macrosFixtures[0],
                name: 'bar',
            }
            const newState = reducer({'1': macrosFixtures[0]}, macroUpdated(updatedMacroMock))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('fetchMacros action', () => {
        it('should add the macros to the state', () => {
            const newState = reducer({}, macrosFetched(macrosFixtures))
            expect(newState).toMatchSnapshot()
        })
    })
})
