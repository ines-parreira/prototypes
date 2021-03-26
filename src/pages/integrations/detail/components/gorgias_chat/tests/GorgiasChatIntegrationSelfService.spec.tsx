import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {fromJS, Map} from 'immutable'

import {GorgiasChatIntegrationSelfServiceComponent} from '../GorgiasChatIntegrationSelfService'
import {IntegrationType} from '../../../../../../models/integration/types'

const SHOP_NAME_1 = 'myshop1'
const SHOP_NAME_2 = 'myshop2'

const shopifyIntegrationsSample = fromJS([
    {
        id: 1,
        meta: {
            shop_name: SHOP_NAME_1,
        },
    },
    {
        id: 2,
        meta: {
            shop_name: SHOP_NAME_2,
        },
    },
])

const selfServiceConfigurationsSample = [
    {
        id: 1,
        type: 'shopify',
        shop_name: SHOP_NAME_1,
        created_datetime: new Date().toISOString(),
        updated_datetime: new Date().toISOString(),
        deactivated_datetime: null,
    },
    {
        id: 2,
        type: 'shopify',
        shop_name: SHOP_NAME_2,
        created_datetime: new Date().toISOString(),
        updated_datetime: new Date().toISOString(),
        deactivated_datetime: new Date().toISOString(),
    },
]

type Props = ComponentProps<typeof GorgiasChatIntegrationSelfServiceComponent>
jest.mock('../../../../../common/components/ToggleButton', () => {
    return ({value, onChange}: {value: string; onChange: () => void}) => {
        return (
            <div
                data-testid="toggle-button"
                onClick={onChange}
            >{`ToggleButtonMock value=${value}`}</div>
        )
    }
})

describe('<GorgiasChatIntegrationSelfService/>', () => {
    const integration: Map<any, any> = fromJS({
        id: 7,
        name: 'my chat integration',
        type: IntegrationType.GorgiasChatIntegrationType,
        meta: {
            self_service: {
                enabled: false,
            },
        },
        decoration: {
            introduction_text: 'this is an intro',
            input_placeholder: 'type something please',
            main_color: '#123456',
        },
    }) as Map<any, any>

    beforeEach(() => {
        jest.resetAllMocks()
    })

    const props = ({
        // store: mockStore({}),
        integration: integration,
        isLoadingConfigurations: false,
        selfServiceConfigurations: fromJS([]),
        actions: {
            fetchSelfServiceConfigurations: jest.fn(),
        },
        shopifyIntegrations: fromJS([]),
    } as any) as Props

    describe('render()', () => {
        it('should render the default message when there is no shopify integration - %#', () => {
            const {container} = render(
                <GorgiasChatIntegrationSelfServiceComponent
                    {...props}
                    shopifyIntegrations={fromJS([])}
                    isLoadingConfigurations={false}
                    selfServiceConfigurations={fromJS([])}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the 1 feature enabled and 1 disabled', () => {
            const {container} = render(
                <GorgiasChatIntegrationSelfServiceComponent
                    {...props}
                    shopifyIntegrations={shopifyIntegrationsSample}
                    isLoadingConfigurations={false}
                    selfServiceConfigurations={selfServiceConfigurationsSample}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
