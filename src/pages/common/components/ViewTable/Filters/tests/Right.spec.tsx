import React, {ComponentProps, ReactNode} from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Identifier} from 'estree'

import configureMockStore from 'redux-mock-store'
import {DateTimeFormatMapper, DateTimeFormatType} from 'constants/datetime'
import {CHANNELS} from 'tickets/common/config'
import {RightContainer} from 'pages/common/components/ViewTable/Filters/Right'

jest.mock('moment-timezone', () => () => {
    const moment: (date: string) => Record<string, unknown> =
        jest.requireActual('moment-timezone')

    return moment('2019-09-03')
})

jest.mock(
    'pages/common/forms/DatePicker',
    () =>
        ({children}: {children: ReactNode}) => {
            return <>{children}</>
        }
)

const mockStore = configureMockStore([thunk])
const store = mockStore({})

describe('<Right />', () => {
    const minProps = {
        agents: fromJS([]),
        areFiltersValid: true,
        config: fromJS({}),
        empty: false,
        field: fromJS({
            name: 'created',
            title: 'Created',
            path: 'created_datetime',
            filter: {
                sort: {
                    created_datetime: 'desc',
                },
            },
        }),
        index: 0,
        integrations: fromJS([]),
        objectPath: 'ticket.created_datetime',
        operator: {
            loc: {
                end: {
                    line: 1,
                    column: 3,
                },
                start: {
                    line: 1,
                    column: 0,
                },
            },
            name: 'gte',
            type: 'Identifier',
        } as Identifier,
        tags: fromJS([]),
        teams: fromJS([]),
        updateFieldFilter: jest.fn(),
        datetimeFormat:
            DateTimeFormatMapper[
                DateTimeFormatType.COMPACT_DATE_WITH_TIME_EN_GB_24_HOUR
            ],
    } as unknown as ComponentProps<typeof RightContainer>

    it('should default the current datetime when the date value is invalid', () => {
        const {container} = render(
            <Provider store={store}>
                <RightContainer
                    {...minProps}
                    node={{
                        loc: {
                            end: {
                                line: 1,
                                column: 54,
                            },
                            start: {
                                line: 1,
                                column: 29,
                            },
                        },
                        raw: "'2021-12-1T06:00:00.000Z'",
                        type: 'Literal',
                        value: '2021-12-1T06:00:00.000Z',
                    }}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render humanized label if ticket channel is selected', () => {
        const {container} = render(
            <Provider store={store}>
                <RightContainer
                    {...minProps}
                    operator={{
                        name: 'eq',
                        type: 'Identifier',
                    }}
                    node={{
                        raw: "'contact_form'",
                        type: 'Literal',
                        value: 'contact_form',
                    }}
                    field={fromJS({
                        name: 'channel',
                        title: 'Channel',
                        enum: CHANNELS,
                    })}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
