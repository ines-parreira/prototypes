import React from 'react'
import {render} from '@testing-library/react'

import PhoneIntegrationListAlert from '../PhoneIntegrationListAlert'

describe('<PhoneIntegrationListAlert/>', () => {
    it('should not render', () => {
        const {container} = render(
            <PhoneIntegrationListAlert
                totalIntegrations={0}
                maxIntegrations={2}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a warning message', () => {
        const {container} = render(
            <PhoneIntegrationListAlert
                totalIntegrations={1}
                maxIntegrations={2}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an error message', () => {
        const {container} = render(
            <PhoneIntegrationListAlert
                totalIntegrations={2}
                maxIntegrations={2}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
