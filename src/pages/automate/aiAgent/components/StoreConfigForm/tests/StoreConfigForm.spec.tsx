import {screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {IntegrationType} from 'models/integration/types'
import {renderWithRouter} from 'utils/testing'
import {StoreConfigForm} from '../StoreConfigForm'
import {useStoreConfigurationMutation} from '../../../hooks/useStoreConfigurationMutation'
import {useAiAgentHelpCenter} from '../../../hooks/useAiAgentHelpCenter'

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('state/notifications/actions')
jest.mock('../../../hooks/useStoreConfigurationMutation', () => ({
    useStoreConfigurationMutation: jest.fn(),
}))
jest.mock('../../../hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(),
}))

const mockedUseStoreConfigurationMutation = jest.mocked(
    useStoreConfigurationMutation
)
const mockedUseAiAgentHelpCenter = jest.mocked(useAiAgentHelpCenter)

const mockStore = configureMockStore([thunk])

const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Email,
                name: 'My email integration',
                meta: {
                    address: MOCK_EMAIL_ADDRESS,
                },
            },
        ],
    }),
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': {id: 1, name: 'help center 1', type: 'faq'},
                    '2': {id: 2, name: 'help center 2', type: 'faq'},
                },
            },
        },
    },
}

const renderComponent = (
    props: Partial<ComponentProps<typeof StoreConfigForm>>
) => {
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <StoreConfigForm
                shopName="test-shop"
                accountDomain="test-domain"
                {...props}
            />
        </Provider>
    )
}

describe('<StoreConfigForm />', () => {
    beforeEach(() => {
        mockedUseStoreConfigurationMutation.mockReturnValue({
            isLoading: false,
            createStoreConfiguration: () => Promise.resolve(),
            upsertStoreConfiguration: () => Promise.resolve(),
        })
        mockedUseAiAgentHelpCenter.mockReturnValue(undefined)
    })
    it('should render the component', () => {
        renderComponent({})

        expect(screen.getByText('General settings')).toBeInTheDocument()
    })
})
