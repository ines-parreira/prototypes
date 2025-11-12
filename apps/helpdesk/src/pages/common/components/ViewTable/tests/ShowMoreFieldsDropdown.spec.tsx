import * as Segment from '@repo/logging'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { List, Map } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import ShowMoreFieldsDropdown from 'pages/common/components/ViewTable/ShowMoreFieldsDropdown'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { setFieldVisibility } from 'state/views/actions'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        ShowMoreFieldsClicked: 'ShowMoreFieldsClicked',
    },
}))

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = useAppDispatch as jest.Mock

jest.mock('state/views/actions')
const mockSetFieldVisibility = setFieldVisibility as jest.Mock

jest.mock('state/notifications/actions')
const mockNotify = notify as jest.Mock

describe('ShowMoreFieldsDropdown', () => {
    let defaultProps: any

    beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1000,
        })

        defaultProps = {
            config: Map({ mainField: 'field1' }),
            fields: List([
                Map({ name: 'field1', title: 'Field 1' }),
                Map({ name: 'field2', title: 'Field 2' }),
                Map({ name: 'field3', title: 'Field 3' }),
                Map({ name: 'priority', title: 'Priority' }),
            ]),
            visibleFields: List([
                Map({ name: 'field1', title: 'Field 1' }),
                Map({ name: 'field2', title: 'Field 2' }),
            ]),
            shouldStoreFieldConfig: true,
        }
        mockUseAppDispatch.mockReturnValue(jest.fn())
        mockSetFieldVisibility.mockReturnValue(jest.fn())
        mockNotify.mockReturnValue(jest.fn())
    })

    const renderComponent = (props = {}) =>
        render(<ShowMoreFieldsDropdown {...defaultProps} {...props} />)

    it('renders the dropdown header "COLUMNS"', () => {
        renderComponent()

        expect(screen.getByText('COLUMNS')).toBeInTheDocument()
    })

    it('renders the mandatory field checkbox as disabled', () => {
        renderComponent()

        const checkbox = screen.getByLabelText('Field 1')

        expect(checkbox).toBeDisabled()
    })

    it('logs event when the dropdown is clicked', () => {
        renderComponent()

        const dropdownToggle = screen.getByRole('button')

        fireEvent.click(dropdownToggle)

        expect(Segment.logEvent).toHaveBeenCalledWith(
            Segment.SegmentEvent.ShowMoreFieldsClicked,
        )
    })

    it('renders non-mandatory fields as enabled', () => {
        renderComponent()

        const checkbox = screen.getByLabelText('Field 2')
        expect(checkbox).not.toBeDisabled()
    })

    it('dispatches setFieldVisibility action when toggling a non-mandatory field', () => {
        renderComponent()

        const checkbox = screen.getByLabelText('Field 2')
        fireEvent.click(checkbox)

        expect(mockSetFieldVisibility).toHaveBeenCalledWith(
            'field2',
            false,
            true,
        )
    })

    it('shows error notification when trying to remove all columns', () => {
        const props = {
            visibleFields: List([Map({ name: 'field1', title: 'Field 1' })]),
        }
        renderComponent(props)

        const checkbox = screen.getByLabelText('Field 1')
        fireEvent.click(checkbox)

        expect(mockNotify).toHaveBeenCalledWith({
            message: 'You can not remove all columns of a view',
            status: NotificationStatus.Error,
        })
    })

    it('does not store field config when shouldStoreFieldConfig is false', () => {
        const props = {
            shouldStoreFieldConfig: false,
        }
        renderComponent(props)

        const checkbox = screen.getByLabelText('Field 2')
        fireEvent.click(checkbox)

        expect(mockSetFieldVisibility).toHaveBeenCalledWith(
            'field2',
            false,
            false,
        )
    })

    describe('dropdown positioning', () => {
        it('positions dropdown on the right when there is enough space', async () => {
            renderComponent()

            const dropdownToggle = screen.getByRole('button')
            const toggleRect = {
                right: 500,
                bottom: 100,
            }
            dropdownToggle.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(toggleRect)

            fireEvent.click(dropdownToggle)

            const dropdownMenu = document.querySelector('.dropdown-menu')

            await waitFor(() => {
                expect(dropdownMenu).toHaveStyle({ right: '0px' })
            })
        })

        it('positions dropdown fixed when there is not enough space', async () => {
            // Set window width to be smaller than the toggle position
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 400,
            })

            renderComponent()

            const dropdownToggle = screen.getByRole('button')
            const toggleRect = {
                right: 500,
                bottom: 100,
            }
            dropdownToggle.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(toggleRect)

            fireEvent.click(dropdownToggle)

            const dropdownMenu = document.querySelector('.dropdown-menu')

            await waitFor(() => {
                expect(dropdownMenu).toHaveStyle({
                    position: 'fixed',
                    top: '100px',
                    right: '20px',
                })
            })
        })
    })

    it('should render Priority filter', () => {
        renderComponent()

        expect(screen.getByText('Priority')).toBeInTheDocument()
    })
})
