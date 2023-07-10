import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'

import {ticketInputFieldDefinition} from 'fixtures/customField'
import {DatetimeLabel} from 'pages/common/utils/labels'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithDnD} from 'utils/testing'
import Row from '../Row'

const mockStore = configureMockStore([thunk])

jest.mock('pages/common/utils/labels', () => ({
    DatetimeLabel: ({dateTime}: ComponentProps<typeof DatetimeLabel>) => {
        return <div>{dateTime}</div>
    },
}))

jest.mock('models/customField/resources')

const queryClient = createTestQueryClient()

describe('<Row />', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    it.each([true, false])(
        'should render correctly active field',
        (canReorder) => {
            const props = {
                ticketField: ticketInputFieldDefinition,
                canReorder,
                position: 0,
                onMoveEntity: jest.fn(),
                onDropEntity: jest.fn(),
            }

            const {container} = renderWithDnD(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore({})}>
                        <table>
                            <tbody>
                                <Row {...props} />
                            </tbody>
                        </table>
                    </Provider>
                </QueryClientProvider>
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([true, false])(
        'should render correctly active required field',
        (canReorder) => {
            const props = {
                ticketField: {
                    ...ticketInputFieldDefinition,
                    required: true,
                },
                canReorder,
                position: 0,
                onMoveEntity: jest.fn(),
                onDropEntity: jest.fn(),
            }

            const {container} = renderWithDnD(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore({})}>
                        <table>
                            <tbody>
                                <Row {...props} />
                            </tbody>
                        </table>
                    </Provider>
                </QueryClientProvider>
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([true, false])(
        'should render correctly archived required field',
        (canReorder) => {
            const props = {
                ticketField: {
                    ...ticketInputFieldDefinition,
                    required: true,
                    deactivated_datetime: '2022-01-02T03:04:05.123456+00:00',
                },
                canReorder,
                position: 0,
                onMoveEntity: jest.fn(),
                onDropEntity: jest.fn(),
            }

            const {container} = renderWithDnD(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore({})}>
                        <table>
                            <tbody>
                                <Row {...props} />
                            </tbody>
                        </table>
                    </Provider>
                </QueryClientProvider>
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )
})
