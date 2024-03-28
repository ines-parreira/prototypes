import React from 'react'
import {fromJS} from 'immutable'
import userEvent from '@testing-library/user-event'
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import * as actions from 'state/widgets/actions'
import {Link} from '../../types'
import {Links} from '../Links'

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
        const {container} = render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} links={[]} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
        expect(screen.queryByText('Add Redirection Link')).toBeNull()
    })

    it('should render no links but an `Add Redirection Link` button', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} links={[]} isEditing />
            </Provider>
        )

        expect(
            screen.queryAllByText(new RegExp(label + '.*', 'gm'))
        ).toHaveLength(0)
        expect(screen.queryByText('Add Redirection Link')).toBeTruthy()
    })

    it('should render all the links without the `Add Redirection Link` button and without a `SHOW MORE` button', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} links={getLinks(4)} />
            </Provider>
        )

        expect(
            screen.queryAllByText(new RegExp(label + '.*', 'gm'))
        ).toHaveLength(4)
        expect(screen.queryByText('SHOW MORE')).toBeNull()
        expect(screen.queryByText('Add Redirection Link')).toBeNull()
    })

    it('should render some links and a `SHOW MORE` button but without an `Add Redirection Link` button', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} links={getLinks(5)} />
            </Provider>
        )

        expect(
            screen.queryAllByText(new RegExp(label + '.*', 'gm'))
        ).toHaveLength(5)
        expect(screen.queryByText('Add Redirection Link')).toBeFalsy()
        expect(screen.queryByText(/show more/i)).toBeTruthy()
    })

    it('should open Editor when clicking on Add Redirection Link', async () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} links={[]} isEditing />
            </Provider>
        )

        fireEvent.click(screen.getByText('Add Redirection Link'))
        await waitFor(() => {
            expect(screen.queryByText('Save')).toBeTruthy()
        })
    })

    it('should call only `removeEditedWidget` action when removing the last link', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} links={getLinks(1)} isEditing />
            </Provider>
        )

        fireEvent.click(screen.getAllByText('delete')[0])
        expect(removeEditedWidget.mock.calls).toMatchSnapshot()
        expect(startWidgetEdition.mock.calls).toMatchSnapshot()
        expect(updateCustomActions.mock.calls).toMatchSnapshot()
    })

    it('should call all actions when removing a link', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} links={getLinks(2)} isEditing />
            </Provider>
        )

        fireEvent.click(screen.getAllByText('delete')[0])
        expect(removeEditedWidget.mock.calls).toMatchSnapshot()
        expect(startWidgetEdition.mock.calls).toMatchSnapshot()
        expect(updateCustomActions.mock.calls).toMatchSnapshot()
    })

    it('should call widget actions when editing a link', async () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} links={getLinks(1)} isEditing />
            </Provider>
        )

        fireEvent.click(screen.getByText('edit'))
        await waitFor(() => expect(screen.getByText('Save')))

        fireEvent.click(screen.getByText('Save'))
        expect(startWidgetEdition.mock.calls).toMatchSnapshot()
        expect(updateCustomActions.mock.calls).toMatchSnapshot()
    })

    it('should call actions when adding a link', async () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} links={[]} isEditing />
            </Provider>
        )

        fireEvent.click(screen.getByText('Add Redirection Link'))
        await waitFor(() => {
            expect(screen.getByText('Save'))
        })
        await userEvent.type(screen.getByText('Title'), 'Gorgias')
        await userEvent.type(screen.getByText('Link'), 'www.gorgias.com')

        fireEvent.click(screen.getByText('Save'))

        expect(startWidgetEdition.mock.calls).toMatchSnapshot()
        expect(updateCustomActions.mock.calls).toMatchSnapshot()
    })
})
