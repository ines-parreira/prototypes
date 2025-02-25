import { fromJS, Map } from 'immutable'

import { getEvent } from '..'
import { eventMatcher } from '../matcher'

jest.mock('../matcher')
const mockEventMatcher = eventMatcher as jest.Mock

describe('getEvent', () => {
    const actionConfig = {
        name: 'name',
        label: 'label',
        objectType: 'objectType',
    }

    it('Should return an empty event if the integration is empty', () => {
        const event = getEvent({
            integration: Map(),
            actionConfig,
            payload: Map(),
            data: Map(),
        })
        expect(event).toStrictEqual({
            objectLabel: '',
            objectLink: '',
        })
    })

    it('Should return an empty event if eventMatcher return undefined', () => {
        const event = getEvent({
            integration: fromJS({ type: 'type' }),
            actionConfig,
            payload: Map(),
            data: Map(),
        })
        expect(event).toStrictEqual({
            objectLabel: '',
            objectLink: '',
        })
    })

    it('Should return the event provided by the eventMatcher', () => {
        mockEventMatcher.mockReturnValueOnce({
            objectLabel: 'test',
            objectLink: 'test',
        })
        const event = getEvent({
            integration: fromJS({ type: 'type' }),
            actionConfig,
            payload: Map(),
            data: Map(),
        })

        expect(event).toStrictEqual({
            objectLabel: 'test',
            objectLink: 'test',
        })
    })
})
