import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {IntegrationListContainer} from '../IntegrationListContainer'

describe('<IntegrationListContainer />', () => {
    const minProps = {
        fetchIntegrations: jest.fn(),
        activeIntegrations: 0,
        allowedIntegrations: 100,
        currentPlan: fromJS({}),
        integrations: fromJS([]),
        integrationsConfig: fromJS([{type: 'email'}]),
        plans: fromJS({}),
    }

    it('should display content', () => {
        const {container} = render(<IntegrationListContainer {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch integrations on first render', () => {
        render(<IntegrationListContainer {...minProps} />)

        expect(minProps.fetchIntegrations).toHaveBeenCalled()
    })
})
