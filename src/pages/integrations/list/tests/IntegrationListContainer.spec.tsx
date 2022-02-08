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
        currentAccount: fromJS({}),
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

    describe('SMS integrations feature flag', () => {
        const smsMinProps = {
            ...minProps,
            integrationsConfig: fromJS([{type: 'sms', title: 'SMS'}]),
        }

        it('should include SMS tile SMS preview accounts', () => {
            const props = {
                ...smsMinProps,
                currentAccount: fromJS({
                    domain: 'acme',
                }),
            }
            const {container, queryByText} = render(
                <IntegrationListContainer {...props} />
            )

            expect(queryByText('SMS')).not.toBeFalsy()
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not include SMS tile for all other accounts', () => {
            const {container, queryByText} = render(
                <IntegrationListContainer {...minProps} />
            )

            expect(queryByText('SMS')).toBeFalsy()
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
