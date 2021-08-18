import reducer, {initialState} from '../reducer'

import {changeViewLanguage} from '../actions'

import {ChangeViewLanguage} from '../types'

describe('Help Center/UI reducer', () => {
    it('has the correct initial state', () => {
        expect(reducer(undefined, {} as ChangeViewLanguage)).toEqual(
            initialState
        )
    })

    describe('dispatch changeViewLanguage', () => {
        it('saves the new language', () => {
            const nextState = reducer(undefined, changeViewLanguage('fr-FR'))

            expect(nextState.currentLanguage).toEqual('fr-FR')
        })
    })
})
