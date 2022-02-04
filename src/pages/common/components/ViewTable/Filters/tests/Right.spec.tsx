import React, {ComponentProps, ReactNode} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Identifier} from 'estree'

import {RightContainer} from '../Right'

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
    } as unknown as ComponentProps<typeof RightContainer>

    it('should default the current datetime when the date value is invalid', () => {
        const {container} = render(
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
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
