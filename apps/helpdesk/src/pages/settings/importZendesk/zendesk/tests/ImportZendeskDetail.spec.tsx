import { ComponentProps } from 'react'

import { fireEvent, render, RenderResult } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, useParams } from 'react-router-dom'

import { mockStore } from 'utils/testing'

import { ImportZendeskDetail } from '../ImportZendeskDetail'
import { successImport } from './fixtures'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

const mockUseParams = useParams as jest.Mock

const renderComponent = (
    props: ComponentProps<typeof ImportZendeskDetail> & {
        integrationId?: string
    },
): RenderResult => {
    mockUseParams.mockReturnValue({ integrationId: props.integrationId || '1' })

    return render(
        <MemoryRouter>
            <Provider
                store={mockStore({
                    integrations: fromJS({}),
                } as any)}
            >
                <ImportZendeskDetail {...props} />
            </Provider>
        </MemoryRouter>,
    )
}

describe('<ImportZendeskDetail/>', () => {
    describe('rendering', () => {
        it('should display the popover', () => {
            const { getByText } = renderComponent({
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

            const { getByText, rerender } = renderComponent(props)
            fireEvent.click(getByText('Resume'))
            expect(updateIntegrationMock).toBeCalledWith(
                fromJS({
                    id: 1,
                    meta: { continuous_import_enabled: true },
                }),
            )
            rerender(
                <MemoryRouter>
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
                </MemoryRouter>,
            )
            expect(getByText('Pause')).toBeDefined()
        })
    })
})
