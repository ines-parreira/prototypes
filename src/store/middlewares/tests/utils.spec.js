import {humanizeActionType} from '../utils'
describe('store', () => {
    describe('middlewares', () => {
        describe('utils', () => {
            describe('humanizeActionType', () => {
                it('should format action type to be more readable', () => {
                    // here we use irregular verbs and different cases of conjugation
                    expect(humanizeActionType('send')).toEqual('Sent')
                    expect(humanizeActionType('fetch')).toEqual('Fetched')
                    expect(humanizeActionType('move')).toEqual('Moved')
                    expect(humanizeActionType('cry')).toEqual('Cried')
                    expect(humanizeActionType('open')).toEqual('Opened')
                    // use space separator and format sentence
                    expect(humanizeActionType('OPEN_TICKET ')).toEqual('Opened ticket')
                    // remove noise
                    expect(humanizeActionType('FETCH_ITEM_SUCCESS')).toEqual('Fetched item')
                })
            })
        })
    })
})
