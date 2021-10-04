import React from 'react'
import {render} from '@testing-library/react'

import IntegrationListLimitAlert from '../IntegrationListLimitAlert'

describe('<IntegrationListLimitAlert/>', () => {
    it('should not render', () => {
        const {container} = render(
            <IntegrationListLimitAlert
                totalIntegrations={0}
                maxIntegrations={2}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a warning message', () => {
        const {container} = render(
            <IntegrationListLimitAlert
                totalIntegrations={1}
                maxIntegrations={2}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an error message', () => {
        const {container} = render(
            <IntegrationListLimitAlert
                totalIntegrations={2}
                maxIntegrations={2}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
