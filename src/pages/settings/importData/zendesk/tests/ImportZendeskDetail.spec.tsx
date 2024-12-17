import {render, RenderResult, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import * as ReactRouterDom from 'react-router-dom'

import {mockStore} from 'utils/testing'

import {ImportZendeskDetail} from '../ImportZendeskDetail'
import {successImport} from './fixtures'

jest.mock(
    'react-router',
    () =>
        ({
            ...jest.requireActual('react-router'),
            useParams: jest.fn(),
        }) as Record<string, any>
)
const mockUseParams = jest.spyOn(ReactRouterDom, 'useParams')

const renderComponent = (
    props: ComponentProps<typeof ImportZendeskDetail> & {integrationId?: string}
): RenderResult => {
    mockUseParams.mockReturnValue({integrationId: props.integrationId || '1'})

    return render(
        <Provider
            store={mockStore({
                integrations: fromJS({}),
            } as any)}
        >
            <ImportZendeskDetail {...props} />
        </Provider>
    )
}

describe('<ImportZendeskDetail/>', () => {
    describe('rendering', () => {
        it('should display the popover', () => {
            const {getByText} = renderComponent({
                fetchIntegration: jest.fn(),
                updateOrCreateIntegration: jest.fn(),
                integrations: [successImport],
                loading: false,
            } as any)

            fireEvent.click(getByText('Learn'))
        })

        it('should start syncing', () => {
            const updateIntegrationMock = jest.fn()
            const props = {
                fetchIntegration: jest.fn(),
                updateOrCreateIntegration: updateIntegrationMock,
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
                <Provider
                    store={mockStore({
                        integrations: fromJS({}),
                    } as any)}
                >
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
                </Provider>
            )
            expect(getByText('Pause')).toBeDefined()
        })
    })
})
