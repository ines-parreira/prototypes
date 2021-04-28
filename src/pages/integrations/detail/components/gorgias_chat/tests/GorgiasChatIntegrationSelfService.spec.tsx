import React from 'react'
import {render} from '@testing-library/react'

import {fromJS, Map} from 'immutable'

import {GorgiasChatIntegrationSelfServiceComponent} from '../GorgiasChatIntegrationSelfService'
import {IntegrationType} from '../../../../../../models/integration/types'

describe('<GorgiasChatIntegrationSelfService/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const props = {
        integration: fromJS({
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
        }) as Map<any, any>,
    }

    describe('render()', () => {
        it('should render the product update message', () => {
            const {container} = render(
                <GorgiasChatIntegrationSelfServiceComponent {...props} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
