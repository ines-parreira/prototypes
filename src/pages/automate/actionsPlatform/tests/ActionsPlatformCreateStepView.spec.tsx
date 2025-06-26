import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from 'models/integration/constants'
import {
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import ActionsPlatformCreateStepView from '../ActionsPlatformCreateStepView'
import useApps from '../hooks/useApps'
import useCreateActionTemplate from '../hooks/useCreateActionTemplate'

jest.mock('models/workflows/queries')
jest.mock('../hooks/useApps')
jest.mock('../hooks/useCreateActionTemplate')

const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockUseApps = jest.mocked(useApps)
const mockUseCreateActionTemplate = jest.mocked(useCreateActionTemplate)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)
const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])()

mockUseListActionsApps.mockReturnValue({
    data: [
        {
            id: 'someid2',
            auth_type: 'api-key',
            auth_settings: {
                url: 'https://example.com',
            },
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useListActionsApps>)
mockUseApps.mockReturnValue({
    apps: [
        {
            id: 'someid2',
            name: 'test app',
            icon: '/assets/img/integrations/app.png',
            type: IntegrationType.App,
        },
        {
            icon: '/assets/img/integrations/shopify.png',
            id: 'shopify',
            name: 'Shopify',
            type: IntegrationType.Shopify,
        },
        {
            icon: '/assets/img/integrations/recharge.png',
            id: 'recharge',
            name: 'Recharge',
            type: IntegrationType.Recharge,
        },
    ],
    isLoading: false,
} as unknown as ReturnType<typeof mockUseApps>)
mockUseCreateActionTemplate.mockReturnValue({
    createActionTemplate: jest.fn(),
    isLoading: false,
})
mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
    data: [],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)

describe('<ActionsPlatformCreateStepView />', () => {
    it('should render create step visual builder', () => {
        render(
            <Provider store={mockStore}>
                <ActionsPlatformCreateStepView />
            </Provider>,
        )

        expect(
            screen.getByPlaceholderText('e.g. Update shipping address'),
        ).toBeInTheDocument()
    })

    it('should require to select App', async () => {
        render(
            <Provider store={mockStore}>
                <ActionsPlatformCreateStepView />
            </Provider>,
        )

        act(() => {
            fireEvent.focus(
                within(screen.getByRole('combobox')).getByText('Select App'),
            )
        })

        await userEvent.click(screen.getByText('Shopify'))

        await userEvent.click(screen.getByText('Use'))

        await waitFor(() => {
            expect(screen.queryByText('Select App')).not.toBeInTheDocument()
        })
    })

    it('should redirect on cancel', () => {
        const history = createMemoryHistory({ initialEntries: ['/'] })

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformCreateStepView />
            </Provider>,
            {
                history,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Cancel'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/ai-agent/actions-platform/steps',
        )
    })

    it('should show errors on save', () => {
        render(
            <Provider store={mockStore}>
                <ActionsPlatformCreateStepView />
            </Provider>,
        )

        act(() => {
            fireEvent.focus(
                within(screen.getByRole('combobox')).getByText('Select App'),
            )
        })

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Use'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Save'))
        })

        expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
})
