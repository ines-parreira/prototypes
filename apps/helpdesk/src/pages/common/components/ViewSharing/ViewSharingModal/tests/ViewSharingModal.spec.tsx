import { render, userEvent } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { user as currentUserFixture } from 'fixtures/users'
import { view as mockViewFixture } from 'fixtures/views'
import { ViewVisibility } from 'models/view/types'
import { GorgiasApi } from 'services/gorgiasApi'
import { viewUpdated } from 'state/entities/views/actions'
import * as viewTypes from 'state/views/constants'

import { ViewSharingModal } from '../ViewSharingModal'

const mockStore = configureMockStore([thunk])
const mockData = fromJS({
    shared_with_teams: [],
    shared_with_users: [],
})
jest.mock('services/gorgiasApi')

jest.mock('state/entities/views/actions.ts')

const GorgiasApiMock = jest.mocked(GorgiasApi)

describe('<ViewSharingModal/>', () => {
    const minProps = {
        isOpen: true,
        toggle: jest.fn(),
    }
    const view = { name: 'My view' }

    const store = mockStore({
        currentUser: fromJS(currentUserFixture),
    })

    beforeEach(() => {
        store.clearActions()
        minProps.toggle.mockClear()
        jest.mocked(viewUpdated).mockClear()
        jest.mocked(viewUpdated).mockImplementation((updatedView) => ({
            type: 'VIEW_UPDATED',
            payload: updatedView,
        }))
        GorgiasApiMock.mockImplementation(
            () =>
                ({
                    getViewSharing: jest.fn().mockResolvedValue(mockData),
                    setViewSharing: jest
                        .fn()
                        .mockResolvedValue(mockViewFixture),
                }) as unknown as GorgiasApi,
        )
    })

    it('should render as public', async () => {
        render(
            <Provider store={store}>
                <ViewSharingModal
                    {...minProps}
                    view={fromJS({
                        ...view,
                        visibility: ViewVisibility.Public,
                    })}
                />
            </Provider>,
        )

        await waitFor(() =>
            expect(
                screen.getByText(/Everyone can access this view/),
            ).toBeInTheDocument(),
        )
        expect(
            screen.getByText('Public').classList.contains('selected'),
        ).toBeTruthy()
    })

    it('should render as shared', async () => {
        render(
            <Provider store={store}>
                <ViewSharingModal
                    {...minProps}
                    view={fromJS({
                        ...view,
                        visibility: ViewVisibility.Shared,
                    })}
                />
            </Provider>,
        )

        await waitFor(() =>
            expect(
                screen.getByText(
                    /Lead agents and admins see all the shared views/,
                ),
            ).toBeInTheDocument(),
        )
        expect(
            screen.getByText(/Sharing restricted to specific people or teams/),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Shared').classList.contains('selected'),
        ).toBeTruthy()
    })

    it('should render as private', async () => {
        render(
            <Provider store={store}>
                <ViewSharingModal
                    {...minProps}
                    view={fromJS({
                        ...view,
                        visibility: ViewVisibility.Private,
                    })}
                />
            </Provider>,
        )

        await waitFor(() =>
            expect(
                screen.getByText(/Only you can access this view/),
            ).toBeInTheDocument(),
        )
        expect(
            screen.getByText('Private').classList.contains('selected'),
        ).toBeTruthy()
    })

    it('should update the view on save', async () => {
        render(
            <Provider store={store}>
                <ViewSharingModal
                    {...minProps}
                    view={fromJS({
                        ...view,
                        visibility: ViewVisibility.Private,
                    })}
                />
            </Provider>,
        )

        await waitFor(() =>
            expect(
                screen.getByText(/Only you can access this view/),
            ).toBeInTheDocument(),
        )

        const updateButton = screen.getByRole('button', {
            name: /Update view sharing/i,
        })

        await waitFor(() => {
            expect(updateButton).toBeEnabled()
        })

        await userEvent.click(updateButton)

        await waitFor(() => {
            expect(viewUpdated).toHaveBeenNthCalledWith(1, mockViewFixture)
            expect(
                store
                    .getActions()
                    .some(
                        (action: { type?: string }) =>
                            action.type === viewTypes.SYNC_ACTIVE_VIEW_SHARING,
                    ),
            ).toBe(true)
            expect(minProps.toggle).toHaveBeenCalled()
        })
    })
})
