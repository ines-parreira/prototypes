import React from 'react'

import { userEvent } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import * as segmentTracker from 'common/segment'
import { UserRole } from 'config/types/user'
import { getCurrentUser } from 'state/currentUser/selectors'
import { assumeMock } from 'utils/testing'

import { Heading } from '../Heading'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))
const mockedGetCurrentUser = assumeMock(getCurrentUser)

const logEventSpy = jest.spyOn(segmentTracker, 'logEvent')
const { SegmentEvent } = segmentTracker

describe('Heading', () => {
    beforeEach(() => {
        mockedGetCurrentUser.mockReturnValue(
            fromJS({
                role: {
                    name: UserRole.Admin,
                },
            }),
        )
    })

    it("should render a 'new' badge", () => {
        render(<Heading />)
        expect(screen.getByText('Customer Fields')).toBeInTheDocument()
    })

    it('should render a link when user is admin', () => {
        render(<Heading />)
        expect(screen.getByText('open_in_new')).toBeInTheDocument()
        fireEvent.click(screen.getByText('Customer Fields'))
        expect(logEventSpy).toHaveBeenCalledWith(
            SegmentEvent.CustomFieldCustomerAddFieldsClicked,
        )
    })

    it('should render a icon with a tooltip when user is not admin', async () => {
        mockedGetCurrentUser.mockReturnValue(
            fromJS({
                role: {
                    name: UserRole.Agent,
                },
            }),
        )
        render(<Heading />)
        expect(screen.getByText('Customer Fields')).toBeInTheDocument()
        userEvent.hover(screen.getByText('info'))
        await waitFor(() => {
            expect(screen.getByText(/Add customer fields/)).toBeInTheDocument()
        })
    })
})
