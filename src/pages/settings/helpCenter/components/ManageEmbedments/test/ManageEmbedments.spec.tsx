import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { logEvent, SegmentEvent } from 'common/segment'
import { account as accountFixture } from 'fixtures/account'
import { integrationsState } from 'fixtures/integrations'
import { user as userFixture } from 'fixtures/users'
import { HelpCenterPageEmbedment } from 'models/helpCenter/types'
import { PageEmbedmentPosition } from 'pages/common/components/PageEmbedmentForm'
import { HELP_CENTER_BASE_PATH } from 'pages/settings/helpCenter/constants'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {
    useDeletePageEmbedment,
    useUpdatePageEmbedment,
} from 'pages/settings/helpCenter/queries'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithRouter } from 'utils/testing'

import ManageEmbedments from '../ManageEmbedments'

jest.mock('common/segment')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const queryClient = mockQueryClient()
jest.mock(
    'pages/settings/helpCenter/queries',
    () =>
        ({
            ...jest.requireActual('pages/settings/helpCenter/queries'),
            useUpdatePageEmbedment: jest.fn(),
            useDeletePageEmbedment: jest.fn(),
        }) as Record<string, unknown>,
)
const mockUpdatePageEmbedment = jest.fn()
const mockDeletePageEmbedment = jest.fn()
const useUpdatePageEmbedmentMock = assumeMock(useUpdatePageEmbedment)
const useDeletePageEmbedmentMock = assumeMock(useDeletePageEmbedment)

const embedments: HelpCenterPageEmbedment[] = Array.from({ length: 3 }).map(
    (_, i) => ({
        id: i + 1,
        page_path_url: `/pages/test-${i}`,
        page_title: `Test ${i}`,
        page_external_id: (i + 1000).toString(),
        position: PageEmbedmentPosition.TOP,
        updated_datetime: '2021-01-01T00:00:00.000Z',
        created_datetime: '2021-01-01T00:00:00.000Z',
    }),
)

const helpCenter = {
    ...getSingleHelpCenterResponseFixture,
    shop_name: 'shop-name',
}

const defaultState: Partial<RootState> = {
    integrations: fromJS(integrationsState),
    currentAccount: fromJS(accountFixture),
    currentUser: fromJS(userFixture),
}

const renderView = ({
    state,
    path = `${HELP_CENTER_BASE_PATH}/publish-track`,
    route = `${HELP_CENTER_BASE_PATH}/publish-track`,
    embedments,
}: {
    state: Partial<RootState>
    path?: string
    route?: string
    embedments: HelpCenterPageEmbedment[]
}) => {
    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state)}>
                <ManageEmbedments
                    embedments={embedments}
                    isEmbedmentsLoading={false}
                    helpCenterId={helpCenter.id}
                    shopName={helpCenter.shop_name}
                />
                ,
            </Provider>
        </QueryClientProvider>,
        {
            path,
            route,
        },
    )
}

describe('<ManageEmbedments', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useUpdatePageEmbedmentMock.mockImplementation(() => {
            return {
                mutate: mockUpdatePageEmbedment,
                mutateAsync: mockUpdatePageEmbedment,
                isLoading: false,
            } as unknown as ReturnType<typeof useUpdatePageEmbedmentMock>
        })
        useDeletePageEmbedmentMock.mockImplementation(() => {
            return {
                mutate: mockDeletePageEmbedment,
                mutateAsync: mockDeletePageEmbedment,
                isLoading: false,
            } as unknown as ReturnType<typeof useDeletePageEmbedmentMock>
        })
    })

    it('wording check', () => {
        renderView({ state: defaultState, embedments })

        screen.getByText('Manage embedded pages')
        screen.getByText(/Edit the position of your Help Center/)
        screen.getByText(/Note: Please allow a few minutes/)
    })

    it('renders the embedments', () => {
        renderView({ state: defaultState, embedments })

        embedments.forEach((embedment) => {
            // Renders the page title for each embedment
            screen.getByText(embedment.page_title)

            // Renders the delete button for each embedment
            screen.getByTestId(`delete-button-${embedment.id}`)

            // Renders the preview button for each embedment
            const link = screen.getByTestId(`preview-button-${embedment.id}`)
            expect(link).toHaveAttribute(
                'href',
                `https://${helpCenter.shop_name}.myshopify.com${embedment.page_path_url}`,
            )
        })

        // Renders the select field for position for each embedment
        const positionSelectFields = screen.getAllByText(/top/i)
        expect(positionSelectFields).toHaveLength(embedments.length)
    })

    it('logs an event when trying to embed on another page', () => {
        renderView({ state: defaultState, embedments })

        const button = screen.getByText(/embed on another page/i)

        userEvent.click(button)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.HelpCenterAutoEmbedEmbedOnAnotherPageClicked,
            {
                user_id: userFixture.id,
                account_domain: accountFixture.domain,
                help_center_id: helpCenter.id,
                page_embedments_count: embedments.length,
            },
        )
    })

    it('saves the changes when Save Changes is clicked', async () => {
        renderView({ state: defaultState, embedments: [embedments[0]] })

        const button = screen.getByRole('button', { name: /save changes/i })
        expect(button).toBeAriaDisabled()

        // Change the position of the first embedment
        const select = screen.getByText(/top/i)
        userEvent.click(select)
        const option = screen.getByText(/bottom/i)
        userEvent.click(option)

        await waitFor(() => {
            expect(button).toBeAriaEnabled()
        })

        userEvent.click(button)

        //expect Save action to be called
        await waitFor(() => {
            expect(mockUpdatePageEmbedment).toHaveBeenCalled()
        })

        const deleteButton = screen.getByTestId(`delete-button-1`)
        userEvent.click(deleteButton)
        const confirmButton = screen.getByRole('button', {
            name: /remove embed/i,
        })
        userEvent.click(confirmButton)

        //expect Delete action to be called
        await waitFor(() => {
            expect(mockDeletePageEmbedment).toHaveBeenCalled()
        })
    })
})
