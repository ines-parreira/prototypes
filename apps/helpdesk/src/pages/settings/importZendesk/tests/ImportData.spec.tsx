import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import useAppDispatch from 'hooks/useAppDispatch'
import { fetchIntegrations } from 'state/integrations/actions'
import { RootState } from 'state/types'
import { mockStore, renderWithRouter } from 'utils/testing'

import ImportZendesk from '../ImportZendesk'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)
const dispatchMock = jest.fn()
useAppDispatchMock.mockReturnValue(dispatchMock)

jest.mock('state/integrations/actions')
const fetchIntegrationsMock = assumeMock(fetchIntegrations)

jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loader</div>
))

describe('<ImportZendesk />', () => {
    const renderComponent = (state: RootState) =>
        renderWithRouter(
            <Provider store={mockStore(state)}>
                <ImportZendesk />
            </Provider>,
        )

    it('should load', () => {
        renderComponent({
            integrations: fromJS({
                integrations: [],
                state: {
                    loading: {
                        integrations: true,
                    },
                },
            }),
        } as RootState)

        expect(screen.getByText('Loader')).toBeInTheDocument()
        expect(fetchIntegrationsMock).toHaveBeenCalled()
    })

    it('should display empty list of integrations', () => {
        renderComponent({
            integrations: fromJS({
                integrations: [],
            }),
        } as RootState)
        expect(
            screen.getByText("You don't have any imports at the moment"),
        ).toBeInTheDocument()
    })

    it('should display list of integrations', () => {
        renderComponent({
            integrations: fromJS({
                integrations: [
                    {
                        type: 'zendesk',
                        meta: {
                            status: 'success',
                        },
                        updated_datetime: '2024-09-02T00:00:00+00:00',
                    },
                ],
            }),
        } as RootState)
        expect(
            screen.getByText('Completed on 09/02/2024 12:00 AM'),
        ).toBeInTheDocument()
    })
})
