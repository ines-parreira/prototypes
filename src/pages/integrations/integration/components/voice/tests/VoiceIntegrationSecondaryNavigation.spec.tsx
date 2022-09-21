import React from 'react'
import {render} from '@testing-library/react'

import {IntegrationType} from 'models/integration/constants'
import {PhoneIntegration} from 'models/integration/types'

import VoiceIntegrationSecondaryNavigation from '../VoiceIntegrationSecondaryNavigation'

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
                <VoiceIntegrationSecondaryNavigation
                    integration={integration}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
