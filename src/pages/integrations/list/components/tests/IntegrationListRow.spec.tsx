import {render} from '@testing-library/react'
import React from 'react'
import {fromJS} from 'immutable'

import IntegrationListRow from '../IntegrationListRow'
import {IntegrationType} from '../../../../../models/integration/constants'

describe('IntegrationListRow', () => {
    it('should display the integration row as a link', () => {
        const integrationConfig = fromJS({
            title: 'an integration',
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
            description: 'this is a cool integration',
            url: 'http://www.foo.bar',
        })

        const {container} = render(
            <IntegrationListRow integrationConfig={integrationConfig} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display an external integration even if it has a type', () => {
        const integrationConfig = fromJS({
            title: 'an integration',
            description: 'this is a cool integration',
            url: 'http://www.foo.bar',
            type: IntegrationType.Klaviyo,
        })

        const {container} = render(
            <IntegrationListRow integrationConfig={integrationConfig} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display an early access integration link', () => {
        const integrationConfig = fromJS({
            title: 'an integration',
            description: 'this is a cool integration',
            url: 'http://www.foo.bar',
            isEarlyAccess: true,
        })

        const {container} = render(
            <IntegrationListRow integrationConfig={integrationConfig} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display an integration with upgrade requirement', () => {
        const integrationConfig = fromJS({
            title: 'an integration',
            description: 'this is a cool integration',
            requiredPlanName: 'Basic',
        })

        const {container} = render(
            <IntegrationListRow integrationConfig={integrationConfig} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
