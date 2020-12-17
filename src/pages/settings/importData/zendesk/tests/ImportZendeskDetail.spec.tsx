import React from 'react'
import {render, RenderResult, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'

import {
    ImportZendeskDetail,
    ImportZendeskDetailProps,
} from '../ImportZendeskDetail'

import {IntegrationType} from '../../../../../models/integration/types'

import {failedImport, pendingImport, successImport} from './fixtures'

const renderComponent = (props: ImportZendeskDetailProps): RenderResult => {
    return render(<ImportZendeskDetail {...props} />)
}

describe('<ImportZendeskDetail/>', () => {
    describe('rendering', () => {
        it.each([successImport, failedImport, pendingImport])(
            'should assert snapshot rendered with different statuses',
            (zendeskImport: Record<string, unknown>) => {
                const fetchIntegrationMock = jest.fn()
                const {container} = renderComponent({
                    fetchIntegration: fetchIntegrationMock,
                    params: {
                        integrationId: zendeskImport.id as string,
                    },
                    integration: fromJS(zendeskImport),
                    loading: false,
                })
                expect(fetchIntegrationMock).toBeCalledWith(
                    zendeskImport.id,
                    IntegrationType.ZendeskIntegrationType
                )
                expect(container).toMatchSnapshot()
            }
        )

        it('should display the popover', () => {
            const {getByText} = renderComponent({
                fetchIntegration: jest.fn(),
                params: {
                    integrationId: '1',
                },
                integration: fromJS(successImport),
                loading: false,
            })

            fireEvent.click(getByText('Learn'))

            const learnMoreButton = getByText('Learn more')
            expect(learnMoreButton).toBeDefined()
            expect(learnMoreButton.getAttribute('href')).toEqual(
                'https://docs.gorgias.com/migrating-helpdesks/switching-from-zendesk'
            )
        })
    })
})
