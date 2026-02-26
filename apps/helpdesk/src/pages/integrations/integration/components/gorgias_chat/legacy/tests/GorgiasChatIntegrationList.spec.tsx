import { useFlag } from '@repo/feature-flags'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
    GorgiasChatStatusEnum,
    IntegrationType,
} from '../../../../../../../models/integration/types'
import GorgiasChatIntegrationList from '../GorgiasChatIntegrationList/GorgiasChatIntegrationList'

jest.mock('@repo/feature-flags')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const mockUseFlag = useFlag as jest.Mock

describe('<GorgiasChatIntegrationList />', () => {
    const props = {
        loading: fromJS({
            integrations: false,
        }),
        integrations: fromJS([
            {
                id: 1,
                name: 'my chat enabled',
                type: IntegrationType.GorgiasChat,
                meta: {
                    self_service: {
                        enabled: false,
                    },
                    shop_name: 'my associated Shopify store',
                    shop_type: IntegrationType.Shopify,
                    shop_integration_id: 3,
                    status: GorgiasChatStatusEnum.ONLINE,
                    wizard: {
                        status: GorgiasChatCreationWizardStatus.Published,
                        step: GorgiasChatCreationWizardSteps.Installation,
                    },
                },
                decoration: {
                    introduction_text: 'this is an intro',
                    input_placeholder: 'type something please',
                    main_color: '#123456',
                },
            },
            {
                id: 3,
                name: 'my associated Shopify store',
                type: IntegrationType.Shopify,
                meta: {
                    self_service: {
                        enabled: false,
                    },
                    wizard: {
                        status: GorgiasChatCreationWizardStatus.Published,
                        step: GorgiasChatCreationWizardSteps.Installation,
                    },
                },
                decoration: {
                    introduction_text: 'this is an intro',
                    input_placeholder: 'type something please',
                    main_color: '#123456',
                },
                deactivated_datetime: new Date('2020-12-17'),
            },
        ]) as List<Map<any, any>>,
    }
    const defaultState = {
        integrations: fromJS({ integrations: props.integrations }),
    } as RootState

    beforeEach(() => {
        jest.resetAllMocks()

        mockUseFlag.mockReturnValue(false)
    })

    it('should display correcty the list of chat integrations', () => {
        const { container } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationList {...props} />
            </Provider>,
        )
        expect(container).toMatchSnapshot()
    })

    it('should display associated Shopify store to chat integration', () => {
        const { getByText } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationList {...props} />
            </Provider>,
        )
        expect(getByText(/my associated Shopify store/)).toBeDefined()
    })

    it('should display disconnected icon if Shopify store is disconnected', () => {
        const { getByAltText } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <GorgiasChatIntegrationList {...props} />
            </Provider>,
        )
        expect(getByAltText(/warning icon/)).toBeDefined()
    })
})
