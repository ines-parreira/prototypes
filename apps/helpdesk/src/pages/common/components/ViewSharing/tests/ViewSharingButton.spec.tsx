import React from 'react'

import { render, screen } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { BASIC_AGENT_ROLE } from 'config/user'
import { user } from 'fixtures/users'
import { ViewCategory, ViewVisibility } from 'models/view/types'

import { ViewSharingButtonContainer } from '../ViewSharingButton'

const minProps = {
    currentUser: fromJS(user),
    agents: fromJS({
        all: [
            { id: 1, name: 'User 1' },
            { id: 2, name: 'User 2' },
            { id: 3, name: 'User 3' },
        ],
    }),
    teams: fromJS({
        all: {
            '1': { id: 1, name: 'Team 1' },
            '2': { id: 2, name: 'Team 2' },
            '3': { id: 3, name: 'Team 3' },
        },
    }),
    hasViewSharingFeature: true,
    dispatch: jest.fn(),
}

describe('<ViewSharingButton/>', () => {
    describe('render()', () => {
        it('should render as public', () => {
            const { getByText } = render(
                <ViewSharingButtonContainer
                    {...minProps}
                    view={fromJS({ visibility: ViewVisibility.Public })}
                />,
            )

            expect(getByText('Public')).toBeInTheDocument()
        })

        it('should render as shared', () => {
            const { getByText } = render(
                <ViewSharingButtonContainer
                    {...minProps}
                    view={fromJS({ visibility: ViewVisibility.Shared })}
                />,
            )

            expect(getByText('Shared')).toBeInTheDocument()
        })

        it('should render as private', () => {
            const { getByText } = render(
                <ViewSharingButtonContainer
                    {...minProps}
                    view={fromJS({ visibility: ViewVisibility.Private })}
                />,
            )

            expect(getByText('Private')).toBeInTheDocument()
        })

        it('should be disabled because this is a system view', () => {
            render(
                <ViewSharingButtonContainer
                    {...minProps}
                    view={fromJS({
                        visibility: ViewVisibility.Public,
                        category: ViewCategory.System,
                    })}
                />,
            )

            expect(
                screen.getByRole('button', { name: /Sharing:/ }),
            ).toBeAriaDisabled()
        })

        it('should be disabled because user is not allowed', () => {
            const role = fromJS({ name: BASIC_AGENT_ROLE })
            render(
                <ViewSharingButtonContainer
                    {...minProps}
                    currentUser={(fromJS(user) as Map<any, any>).set(
                        'role',
                        role,
                    )}
                    view={fromJS({ visibility: ViewVisibility.Public })}
                />,
            )

            expect(
                screen.getByRole('button', { name: /Sharing:/ }),
            ).toBeAriaDisabled()
        })
    })
})
