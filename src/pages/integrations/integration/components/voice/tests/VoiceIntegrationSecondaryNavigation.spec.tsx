import React from 'react'
import {render} from '@testing-library/react'

import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {IntegrationType} from 'models/integration/constants'
import {PhoneIntegration} from 'models/integration/types'

import {mockStore} from 'utils/testing'
import {integrationsState} from 'fixtures/integrations'
import VoiceIntegrationSecondaryNavigation from '../VoiceIntegrationSecondaryNavigation'

const defaultState = {
    integrations: fromJS(integrationsState),
}

describe('<VoiceIntegrationSecondaryNavigation />', () => {
    let integration: PhoneIntegration

    beforeEach(() => {
        integration = {
            id: 1,
            type: IntegrationType.Phone,
        } as PhoneIntegration
    })

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <Provider store={mockStore(defaultState as any)}>
                    <VoiceIntegrationSecondaryNavigation
                        integration={integration}
                    />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
