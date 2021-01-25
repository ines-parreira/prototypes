import {render} from '@testing-library/react'
import React from 'react'
import {fromJS} from 'immutable'

import IntegrationListRow from '../IntegrationListRow'

describe('IntegrationListRow', () => {
    it('should display an integration section', () => {
        const integrationConfig = fromJS({
            title: 'an integration',
            displayUpgrade: true,
            description: 'this is a cool integration',
        })

        const {container} = render(
            <IntegrationListRow integrationConfig={integrationConfig} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the integration row as a link', () => {
        const integrationConfig = fromJS({
            title: 'an integration',
            displayUpgrade: false,
            description: 'this is a cool integration',
        })

        const {container} = render(
            <IntegrationListRow integrationConfig={integrationConfig} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display an external integration', () => {
        const integrationConfig = fromJS({
            title: 'an integration',
            displayUpgrade: false,
            description: 'this is a cool integration',
            url: 'http://www.foo.bar',
        })

        const {container} = render(
            <IntegrationListRow integrationConfig={integrationConfig} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
