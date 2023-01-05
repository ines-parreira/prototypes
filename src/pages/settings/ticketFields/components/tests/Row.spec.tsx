import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {customField} from 'fixtures/customField'
import {DatetimeLabel} from 'pages/common/utils/labels'
import Row from '../Row'

const mockStore = configureMockStore([thunk])

jest.mock('pages/common/utils/labels', () => ({
    DatetimeLabel: ({dateTime}: ComponentProps<typeof DatetimeLabel>) => {
        return <div>{dateTime}</div>
    },
}))

describe('<Row />', () => {
    it('should render correctly active field', () => {
        const props = {
            ticketField: customField,
        }

        const {container} = render(
            <Provider store={mockStore({})}>
                <table>
                    <tbody>
                        <Row {...props} />
                    </tbody>
                </table>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render correctly active required field', () => {
        const props = {
            ticketField: {
                ...customField,
                required: true,
            },
        }

        const {container} = render(
            <Provider store={mockStore({})}>
                <table>
                    <tbody>
                        <Row {...props} />
                    </tbody>
                </table>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render correctly archived required field', () => {
        const props = {
            ticketField: {
                ...customField,
                required: true,
                deactivated_datetime: '2022-01-02T03:04:05.123456+00:00',
            },
        }

        const {container} = render(
            <Provider store={mockStore({})}>
                <table>
                    <tbody>
                        <Row {...props} />
                    </tbody>
                </table>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
