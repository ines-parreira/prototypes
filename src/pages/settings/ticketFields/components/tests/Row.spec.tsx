import React, {ComponentProps} from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'

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

jest.mock('models/customField/resources')

describe('<Row />', () => {
    it('should render correctly active field', () => {
        const props = {
            ticketField: customField,
            onFieldChange: jest.fn(),
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
            onFieldChange: jest.fn(),
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
            onFieldChange: jest.fn(),
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

    it('should archive a field', async () => {
        const props = {
            ticketField: customField,
            onFieldChange: jest.fn(),
        }

        render(
            <Provider store={mockStore({})}>
                <table>
                    <tbody>
                        <Row {...props} />
                    </tbody>
                </table>
            </Provider>
        )

        // click on the archive icon
        fireEvent.click(screen.getByText(/archive/))

        // wait for the confirmation modal to open
        await waitFor(() => {
            expect(
                screen.getByText(/Are you sure you want to archive this field/)
            ).toBeDefined()
        })

        // click on the confirmation button from modal
        fireEvent.click(screen.getAllByText(/Archive/)[1])
        // fireEvent.click(screen.getByText(/Cancel/))

        // wait for the confirmation modal to close
        await waitFor(() => {
            expect(
                screen.queryByText(
                    'Are you sure you want to archive this field'
                )
            ).not.toBeInTheDocument()
        })

        expect(props.onFieldChange).toHaveBeenCalled()
    })

    it('should unarchive a field', async () => {
        const props = {
            ticketField: {
                ...customField,
                deactivated_datetime: '2022-01-02T03:04:05.123456+00:00',
            },
            onFieldChange: jest.fn(),
        }

        render(
            <Provider store={mockStore({})}>
                <table>
                    <tbody>
                        <Row {...props} />
                    </tbody>
                </table>
            </Provider>
        )

        // click on the archive icon
        fireEvent.click(screen.getByText(/unarchive/))

        // wait for the loading to disappear
        await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument()
        })

        expect(props.onFieldChange).toHaveBeenCalled()
    })
})
