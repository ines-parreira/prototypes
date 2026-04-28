import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { SavedFilterMenu } from 'domains/reporting/pages/common/filters/SavedFilterMenu'
import { agents } from 'fixtures/agents'
import { getCurrentUser } from 'state/currentUser/selectors'

jest.mock('state/currentUser/selectors', () => ({ getCurrentUser: jest.fn() }))
const getCurrentUserMock = assumeMock(getCurrentUser)

describe('SavedFilterMenu', () => {
    const action = {
        label: 'some label',
        callback: () => null,
    }
    const actions = [action]

    it('should be disabled for Agents', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({
                ...agents[0],
                role: { name: UserRole.BasicAgent },
            }),
        )
        render(<SavedFilterMenu actions={actions} />, { storeState: {} })

        expect(screen.getByRole('button')).toBeAriaDisabled()
    })

    it('should be enabled for Team Leads', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({
                ...agents[0],
                role: { name: UserRole.Agent },
            }),
        )
        render(<SavedFilterMenu actions={actions} />, { storeState: {} })

        expect(screen.getByRole('button')).toBeAriaEnabled()
    })
})
