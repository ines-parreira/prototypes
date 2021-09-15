import React, {ReactNode} from 'react'
import {fromJS} from 'immutable'
import _isUndefined from 'lodash/isUndefined'

import HTTPIntegrationLayout from '../HTTPIntegrationLayout'
import {renderWithRouter} from '../../../../../../../utils/testing'

const HTTPintegration = fromJS({
    id: 1,
    name: 'Backend integration',
})

jest.mock('reactstrap', () => {
    const reactstrap = jest.requireActual('reactstrap')
    const isUndefined: typeof _isUndefined = jest.requireActual(
        'lodash/isUndefined'
    )

    return {
        ...reactstrap,
        BreadcrumbItem: ({
            active,
            children,
        }: {
            active: boolean
            children: ReactNode
        }) => {
            return (
                <li>
                    <div>{children}</div>
                    {!isUndefined(active) && (
                        <div>is active: {active.toString()}</div>
                    )}
                </li>
            )
        },
    } as unknown
})

describe('HTTPIntegrationLayout', () => {
    it('should render layout for a new HTTP integration', () => {
        const {container} = renderWithRouter(
            <HTTPIntegrationLayout integration={fromJS({})} isUpdate={false}>
                <span>children</span>
            </HTTPIntegrationLayout>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the layout of the settings page of a HTTP integration', () => {
        const {container} = renderWithRouter(
            <HTTPIntegrationLayout
                integration={HTTPintegration}
                isUpdate={true}
            >
                <span>children</span>
            </HTTPIntegrationLayout>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the layout of the events page of a HTTP integration', () => {
        const {container} = renderWithRouter(
            <HTTPIntegrationLayout
                integration={HTTPintegration}
                isUpdate={true}
            >
                <span>children</span>
            </HTTPIntegrationLayout>,
            {
                path: '/:integrationType/:integrationId?/:extra?/',
                route: `/http/1/events/`,
            }
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the layout of an event page of a HTTP integration', () => {
        const {container} = renderWithRouter(
            <HTTPIntegrationLayout
                integration={HTTPintegration}
                isUpdate={true}
            >
                <span>children</span>
            </HTTPIntegrationLayout>,
            {
                path: '/:integrationType/:integrationId?/:extra?/:subId?',
                route: `/http/1/events/2`,
            }
        )
        expect(container).toMatchSnapshot()
    })
})
