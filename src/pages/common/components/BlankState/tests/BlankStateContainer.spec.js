import React from 'react'
import {render, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'

import {BlankStateContainer} from '../BlankStateContainer.tsx'
import {user} from '../../../../../fixtures/users.ts'
import client from '../../../../../models/api/resources.ts'
import {TICKETS_CLOSED_PER_AGENT} from '../../../../../config/stats.tsx'

const mockServer = new MockAdapter(client)

mockServer.onAny(`/api/stats/${TICKETS_CLOSED_PER_AGENT}/`).reply(200, {
    data: {
        data: {
            lines: [[undefined, {value: 11}]],
        },
    },
})

const mockedCancelRequest = jest.fn()

describe('<BlankStateContainer />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display', () => {
        const {container} = render(
            <BlankStateContainer currentUser={fromJS(user)} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch tickets closed per agent on mount', async () => {
        const {getByText} = render(
            <BlankStateContainer currentUser={fromJS(user)} />
        )

        await waitFor(() => {
            expect(getByText(/You closed 11 tickets this week/i)).toBeTruthy()
        })
    })

    it('should cancel fetch on unmount', () => {
        jest.spyOn(axios.CancelToken, 'source').mockImplementation(() => ({
            token: undefined,
            cancel: mockedCancelRequest,
        }))
        const {unmount} = render(
            <BlankStateContainer currentUser={fromJS(user)} />
        )

        unmount()
        expect(mockedCancelRequest).toHaveBeenCalled()
    })
})
