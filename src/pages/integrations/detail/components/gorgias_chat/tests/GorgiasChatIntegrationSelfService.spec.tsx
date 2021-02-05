import React, {ComponentProps} from 'react'
import {render, fireEvent} from '@testing-library/react'

import {fromJS, Map} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import GorgiasChatIntegrationSelfService, {
    GorgiasChatIntegrationSelfServiceComponent,
} from '../GorgiasChatIntegrationSelfService'
import {IntegrationType} from '../../../../../../models/integration/types'

const mockStore = configureMockStore([thunk])
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

    const mockUpdateOrCreateIntegration = jest.fn(() => Promise.resolve())

    const props = ({
        store: mockStore({}),
        integration: integration,
        updateOrCreateIntegration: mockUpdateOrCreateIntegration,
    } as any) as ComponentProps<
        typeof GorgiasChatIntegrationSelfServiceComponent
    >

    describe('render()', () => {
        it('should render defaults because the self service is not enabled for the integration', () => {
            const {container} = render(
                <GorgiasChatIntegrationSelfService {...props} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the toggle button of the self service being in the ON state', () => {
            const selfServiceState = fromJS({
                enabled: true,
            })

            const {container, getByTestId} = render(
                <GorgiasChatIntegrationSelfService
                    {...props}
                    integration={integration.setIn(
                        ['meta', 'self_service'],
                        selfServiceState
                    )}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
            fireEvent.click(getByTestId('toggle-button'))
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('onToggleSelfService()', () => {
        it('should turn on the self service before calling updateOrCreateIntegration', () => {
            const {container, getByTestId} = render(
                <GorgiasChatIntegrationSelfServiceComponent {...props} />
            )
            expect(container.firstChild).toMatchSnapshot()
            fireEvent.click(getByTestId('toggle-button'))
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
