import { userEvent } from '@repo/testing'
import { render, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { user as currentUserFixture } from 'fixtures/users'
import { view as mockViewFixture } from 'fixtures/views'
import { ViewVisibility } from 'models/view/types'
import GorgiasApi from 'services/gorgiasApi'
import { viewUpdated } from 'state/entities/views/actions'

import ViewSharingModal from '../ViewSharingModal'

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
        const { queryByText } = render(
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
                queryByText(/Everyone can access this view/),
            ).toBeInTheDocument(),
        )
        expect(
            queryByText('Public')?.classList.contains('selected'),
        ).toBeTruthy()
    })

    it('should render as shared', async () => {
        const { queryByText } = render(
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
                queryByText(/Lead agents and admins see all the shared views/),
            ),
        )
        expect(queryByText(/Sharing restricted to specific people or teams/))
        expect(
            queryByText('Shared')?.classList.contains('selected'),
        ).toBeTruthy()
    })

    it('should render as private', async () => {
        const { queryByText } = render(
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
            expect(queryByText(/Only you can access this view/)),
        )
        expect(
            queryByText('Private')?.classList.contains('selected'),
        ).toBeTruthy()
    })

    it('should update the view on save', async () => {
        const { getByRole, queryByText } = render(
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
        await waitFor(() => {
            expect(queryByText(/Only you can access this view/))
            userEvent.click(
                getByRole('button', {
                    name: /Update view sharing/i,
                }),
            )
            expect(viewUpdated).toHaveBeenNthCalledWith(1, mockViewFixture)
        })
    })
})
