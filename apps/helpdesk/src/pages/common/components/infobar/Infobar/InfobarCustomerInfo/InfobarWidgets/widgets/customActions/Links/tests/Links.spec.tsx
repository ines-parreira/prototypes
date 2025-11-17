import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import * as actions from 'state/widgets/actions'

import type { Link } from '../../types'
import { Links } from '../Links'

const mockStore = configureMockStore([thunk])

jest.spyOn(actions, 'startWidgetEdition')
jest.spyOn(actions, 'updateCustomActions')
jest.spyOn(actions, 'removeEditedWidget')
const startWidgetEdition = actions.startWidgetEdition as jest.Mock
const updateCustomActions = actions.updateCustomActions as jest.Mock
const removeEditedWidget = actions.removeEditedWidget as jest.Mock

describe('<Links/>', () => {
    const props = {
        templatePath: 'template.path',
        absolutePath: ['template', 'absolute', 'path'],
        source: {},
    }

    const label = 'Gorgias'

    function getLinks(numberOfLinks: number): Link[] {
        return Array(numberOfLinks)
            .fill(null)
            .map((_, index) => ({
                label: `${label}-${index}`,
                url: 'okok',
            }))
    }

    it('should render an empty component (no links, no button)', () => {
        const { container } = render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Links {...props} links={[]} />
            </Provider>,
        )

        expect(container).toMatchSnapshot()
        expect(screen.queryByText('Add Link')).toBeNull()
    })

    it('should render no links but an `Add Link` button', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Links {...props} links={[]} isEditing />
            </Provider>,
        )

        expect(
            screen.queryAllByText(new RegExp(label + '.*', 'm')),
        ).toHaveLength(0)
        expect(screen.queryByText('Add Link')).toBeTruthy()
    })

    it('should render all the links without the `Add Link` button and without a `SHOW MORE` button', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Links {...props} links={getLinks(4)} />
            </Provider>,
        )

        expect(
            screen.queryAllByText(new RegExp(label + '.*', 'm')),
        ).toHaveLength(4)
        expect(screen.queryByText('SHOW MORE')).toBeNull()
        expect(screen.queryByText('Add Link')).toBeNull()
    })

    it('should render some links and a `SHOW MORE` button but without an `Add Link` button', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Links {...props} links={getLinks(5)} />
            </Provider>,
        )

        expect(
            screen.queryAllByText(new RegExp(label + '.*', 'm')),
        ).toHaveLength(5)
        expect(screen.queryByText('Add Link')).toBeFalsy()
        expect(screen.queryByText(/show more/i)).toBeTruthy()
    })

    it('should open Editor when clicking on Add Link', async () => {
        const user = userEvent.setup()
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Links {...props} links={[]} isEditing />
            </Provider>,
        )

        await act(() => user.click(screen.getByText('Add Link')))

        expect(await screen.findByText('Save')).toBeInTheDocument()
    })

    it('should call only `removeEditedWidget` action when removing the last link', async () => {
        const user = userEvent.setup()
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Links {...props} links={getLinks(1)} isEditing />
            </Provider>,
        )

        await act(() => user.click(screen.getAllByText('delete')[0]))
        expect(removeEditedWidget.mock.calls).toMatchSnapshot()
        expect(startWidgetEdition.mock.calls).toMatchSnapshot()
        expect(updateCustomActions.mock.calls).toMatchSnapshot()
    })

    it('should call all actions when removing a link', async () => {
        const user = userEvent.setup()
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Links {...props} links={getLinks(2)} isEditing />
            </Provider>,
        )

        await act(() => user.click(screen.getAllByText('delete')[0]))

        expect(removeEditedWidget.mock.calls).toMatchSnapshot()
        expect(startWidgetEdition.mock.calls).toMatchSnapshot()
        expect(updateCustomActions.mock.calls).toMatchSnapshot()
    })

    it('should call widget actions when editing a link', async () => {
        const user = userEvent.setup()
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Links {...props} links={getLinks(1)} isEditing />
            </Provider>,
        )

        await act(() => user.click(screen.getByText('edit')))
        await act(() => user.click(screen.getByText('Save')))
        expect(startWidgetEdition.mock.calls).toMatchSnapshot()
        expect(updateCustomActions.mock.calls).toMatchSnapshot()
    })

    it('should call actions when adding a link', async () => {
        const user = userEvent.setup()
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({ active: {} }),
                })}
            >
                <Links {...props} links={[]} isEditing />
            </Provider>,
        )

        await act(() => user.click(screen.getByText('Add Link')))

        const saveButton = await screen.findByText('Save')
        expect(saveButton).toBeInTheDocument()

        await act(async () => {
            const title = screen.getByLabelText('Title')
            await user.clear(title)
            await user.type(title, 'Gorgias')
        })
        await act(async () => {
            const link = screen.getByLabelText('Link')
            await user.clear(link)
            await user.type(link, 'www.gorgias.com')
        })

        await act(() => user.click(saveButton))

        expect(startWidgetEdition.mock.calls).toMatchSnapshot()
        expect(updateCustomActions.mock.calls).toMatchSnapshot()
    })
})
