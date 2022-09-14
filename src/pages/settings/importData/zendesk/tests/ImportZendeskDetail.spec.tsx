import React, {ComponentProps} from 'react'
import {render, RenderResult, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'

import {ImportZendeskDetail} from '../ImportZendeskDetail'

import {
    IntegrationType,
    ZendeskIntegration,
} from '../../../../../models/integration/types'

import {failedImport, pendingImport, successImport} from './fixtures'

const renderComponent = (
    props: ComponentProps<typeof ImportZendeskDetail>
): RenderResult => {
    return render(<ImportZendeskDetail {...props} />)
}

describe('<ImportZendeskDetail/>', () => {
    describe('rendering', () => {
        it.each([successImport, failedImport, pendingImport])(
            'should assert snapshot rendered with different statuses',
            (zendeskImport: ZendeskIntegration) => {
                const fetchIntegrationMock = jest.fn()
                const {container} = renderComponent({
                    fetchIntegration: fetchIntegrationMock,
                    match: {
                        params: {
                            integrationId: zendeskImport.id.toString(10),
                        },
                    },
                    updateOrCreateIntegration: jest.fn(),
                    integrations: [zendeskImport],
                    loading: false,
                } as any)
                expect(fetchIntegrationMock).toBeCalledWith(
                    zendeskImport.id.toString(10),
                    IntegrationType.Zendesk
                )
                expect(container).toMatchSnapshot()
            }
        )

        it('should display the popover', () => {
            const {getByText, getByRole} = renderComponent({
                fetchIntegration: jest.fn(),
                updateOrCreateIntegration: jest.fn(),
                match: {
                    params: {
                        integrationId: '1',
                    },
                },
                integrations: [successImport],
                loading: false,
            } as any)

            fireEvent.click(getByText('Learn'))

            expect(getByRole('tooltip')).toMatchSnapshot()
        })

        it('should start syncing', () => {
            const updateIntegrationMock = jest.fn()
            const props = {
                fetchIntegration: jest.fn(),
                updateOrCreateIntegration: updateIntegrationMock,
                match: {
                    params: {
                        integrationId: '1',
                    },
                },
                integrations: [successImport],
                loading: false,
            } as any

            const {getByText, rerender} = renderComponent(props)
            fireEvent.click(getByText('Resume'))
            expect(updateIntegrationMock).toBeCalledWith(
                fromJS({
                    id: 1,
                    meta: {continuous_import_enabled: true},
                })
            )
            rerender(
                <ImportZendeskDetail
                    {...{
                        ...props,
                        integrations: [
                            {
                                ...successImport,
                                meta: {
                                    ...successImport.meta,
                                    continuous_import_enabled: true,
                                },
                            },
                        ],
                    }}
                />
            )
            expect(getByText('Pause')).toBeDefined()
        })
    })
})
