import React from 'react'
import {fromJS, List} from 'immutable'
import userEvent from '@testing-library/user-event'
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {Link} from '../../types'
import {Links} from '../Links'

const mockStore = configureMockStore([thunk])

describe('<Links/>', () => {
    const props = {
        templatePath: 'templatePath',
        templateAbsolutePath: 'templateAbsolutePath',
        source: fromJS({}),
        startWidgetEdition: jest.fn(),
        updateEditedWidget: jest.fn(),
        removeEditedWidget: jest.fn(),
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

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render an empty component (no links, no button)', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} immutableLinks={List()} />
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
                <Links {...props} immutableLinks={List()} isEditing />
            </Provider>
        )

        expect(
            screen.queryAllByText(new RegExp(label + '.*', 'gm'))
        ).toHaveLength(0)
        expect(screen.queryByText('Add Redirection Link')).toBeTruthy()
    })

    it('should render all the links without the `Add Redirection Link` button and without a `SHOW MORE` button', () => {
        const links = getLinks(4)
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} immutableLinks={fromJS(links)} />
            </Provider>
        )

        expect(
            screen.queryAllByText(new RegExp(label + '.*', 'gm'))
        ).toHaveLength(4)
        expect(screen.queryByText('SHOW MORE')).toBeNull()
        expect(screen.queryByText('Add Redirection Link')).toBeNull()
    })

    it('should render some links and a `SHOW MORE` button but without an `Add Redirection Link` button', () => {
        const links = getLinks(5)
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} immutableLinks={fromJS(links)} />
            </Provider>
        )

        expect(
            screen.queryAllByText(new RegExp(label + '.*', 'gm'))
        ).toHaveLength(5)
        expect(screen.queryByText('Add Redirection Link')).toBeFalsy()
        expect(screen.queryByText('SHOW MORE')).toBeTruthy()
    })

    it('should open Editor when clicking on Add Redirection Link', async () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} immutableLinks={List()} isEditing />
            </Provider>
        )

        fireEvent.click(screen.getByText('Add Redirection Link'))
        await waitFor(() => {
            expect(screen.queryByText('Save')).toBeTruthy()
        })
    })

    it('should call only `removeEditedWidget` action when removing the last link', () => {
        const links = getLinks(1)
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} immutableLinks={fromJS(links)} isEditing />
            </Provider>
        )

        fireEvent.click(screen.getAllByText('close')[0])
        expect(props.removeEditedWidget).toHaveBeenCalled()
        expect(props.startWidgetEdition).not.toHaveBeenCalled()
        expect(props.updateEditedWidget).not.toHaveBeenCalled()
    })

    it('should call all actions when removing a link', () => {
        const links = getLinks(2)
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} immutableLinks={fromJS(links)} isEditing />
            </Provider>
        )

        fireEvent.click(screen.getAllByText('close')[0])
        expect(props.removeEditedWidget).toHaveBeenCalled()
        expect(props.startWidgetEdition).toHaveBeenCalledWith(
            `${props.templatePath}.meta.custom`
        )
        expect(props.updateEditedWidget).toHaveBeenCalledWith({
            links: [links[1]],
        })
    })

    it('should call widget actions when editing a link', async () => {
        const links = getLinks(1)
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} immutableLinks={fromJS(links)} isEditing />
            </Provider>
        )

        fireEvent.click(screen.getByText('settings'))
        await waitFor(() => expect(screen.getByText('Save')))

        fireEvent.click(screen.getByText('Save'))
        expect(props.startWidgetEdition).toHaveBeenCalledWith(
            `${props.templatePath}.meta.custom`
        )
        expect(props.updateEditedWidget).toHaveBeenCalledWith({
            links: [links[0]],
        })
    })

    it('should call actions when adding a link', async () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Links {...props} immutableLinks={List()} isEditing />
            </Provider>
        )

        fireEvent.click(screen.getByText('Add Redirection Link'))
        await waitFor(() => {
            expect(screen.getByText('Save'))
        })
        await userEvent.type(screen.getByText('Title'), 'Gorgias')
        await userEvent.type(screen.getByText('Link'), 'www.gorgias.com')

        fireEvent.click(screen.getByText('Save'))

        expect(props.startWidgetEdition).toHaveBeenCalledWith(
            `${props.templatePath}.meta.custom`
        )
        expect(props.updateEditedWidget).toHaveBeenCalledWith({
            links: [{label: 'Gorgias', url: 'www.gorgias.com'}],
        })
    })
})
