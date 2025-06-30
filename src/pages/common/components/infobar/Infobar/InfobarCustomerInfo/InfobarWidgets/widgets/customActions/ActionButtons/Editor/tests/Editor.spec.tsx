import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { actionFixture } from 'fixtures/infobarCustomActions'
import * as actions from 'state/widgets/actions'

import { Editor } from '../Editor'

jest.spyOn(actions, 'startWidgetEdition')
jest.spyOn(actions, 'updateCustomActions')
jest.spyOn(actions, 'removeEditedWidget')
const startWidgetEdition = actions.startWidgetEdition as jest.Mock
const updateCustomActions = actions.updateCustomActions as jest.Mock
const removeEditedWidget = actions.removeEditedWidget as jest.Mock

const mockStore = configureMockStore([thunk])

describe('<Editor/>', () => {
    const action = actionFixture()

    const props = {
        buttons: [
            { label: 'I am in snapshots', action },
            { label: 'I am in snapshots too', action },
        ],
        templatePath: 'some.template',
        absolutePath: ['some', 'absolute', 'template'],
        source: {},
    }

    it('should render with buttons and "add button" button', () => {
        const { container } = render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Editor {...props} />
            </Provider>,
        )
        expect(container).toMatchSnapshot()
    })

    it('should open modal when clicking on "add button" button', async () => {
        const user = userEvent.setup()
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Editor {...props} />
            </Provider>,
        )
        user.click(screen.getByRole('button', { name: 'Add Button' }))
        expect(
            await screen.findByRole('button', { name: 'Save' }),
        ).toBeInTheDocument()
    })

    it('should close the modal when clicking "Cancel"', async () => {
        const user = userEvent.setup()
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Editor {...props} />
            </Provider>,
        )
        await act(() =>
            user.click(screen.getByRole('button', { name: 'Add Button' })),
        )
        await act(() =>
            user.click(screen.getByRole('button', { name: 'Cancel' })),
        )
        await waitFor(() =>
            expect(
                screen.queryByRole('button', { name: 'Save' }),
            ).not.toBeInTheDocument(),
        )
    })

    it('should call the correct callbacks when removing a button', async () => {
        const user = userEvent.setup()
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Editor {...props} />
            </Provider>,
        )
        await act(() => user.click(screen.getAllByText('delete')[1]))
        expect(startWidgetEdition.mock.calls).toMatchSnapshot()
        expect(updateCustomActions.mock.calls).toMatchSnapshot()
        expect(removeEditedWidget.mock.calls).toMatchSnapshot()
    })

    it('should call the correct callbacks when submitting a new button', async () => {
        const user = userEvent.setup()
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Editor {...props} />
            </Provider>,
        )
        await act(() =>
            user.click(screen.getByRole('button', { name: 'Add Button' })),
        )
        const saveButton = await screen.findByRole('button', { name: 'Save' })
        await act(async () => {
            const buttonTitle = screen.getByLabelText(/Button title/)
            await user.clear(buttonTitle)
            await user.type(buttonTitle, 'ok')
        })
        await act(() => user.click(saveButton))
        expect(startWidgetEdition.mock.calls).toMatchSnapshot()
        expect(updateCustomActions.mock.calls).toMatchSnapshot()
    })

    it('should call the correct callbacks when submitting a edited button', async () => {
        const user = userEvent.setup()
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Editor {...props} />
            </Provider>,
        )
        await act(() => user.click(screen.getAllByText('edit')[1]))
        const saveButton = await screen.findByRole('button', { name: 'Save' })
        await act(() => user.click(saveButton))
        expect(startWidgetEdition.mock.calls).toMatchSnapshot()
        expect(updateCustomActions.mock.calls).toMatchSnapshot()
    })
})
