import React, {ComponentProps} from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {tags} from 'fixtures/tag'
import useAppDispatch from 'hooks/useAppDispatch'
import {cancel, edit, remove, save, select} from 'state/tags/actions'
import {assumeMock} from 'utils/testing'

import Row from '../Row'

const mockStore = configureMockStore([thunk])

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock
const dispatch = jest.fn()
useAppDispatchMock.mockReturnValue(dispatch)

jest.mock('state/tags/actions')
const cancelMock = assumeMock(cancel)
const editMock = assumeMock(edit)
const removeMock = assumeMock(remove)
const saveMock = assumeMock(save)
const selectMock = assumeMock(select)

const mockDefaultColor = '#654321'
jest.mock('@gorgias/design-tokens/dist/tokens/colors.json', () => ({
    ['🖥 Modern']: {Main: {Secondary: {value: '#654321'}}},
}))

describe('<Row />', () => {
    const defaultTag = tags[0]
    const defaultMeta = {
        edit: false,
        selected: false,
    }

    const defaultProps: ComponentProps<typeof Row> = {
        row: defaultTag,
        meta: fromJS(defaultMeta),
        refresh: jest.fn(),
    }

    it('should display tag informations', () => {
        render(
            <Provider store={mockStore({})}>
                <Row {...defaultProps} />
            </Provider>,
            {
                wrapper: ({children}) => (
                    <table>
                        <tbody>{children}</tbody>
                    </table>
                ),
            }
        )

        expect(screen.getByText(defaultTag.name)).toBeInTheDocument()
        expect(screen.getByText(defaultTag.description!)).toBeInTheDocument()
        expect(screen.getByText(defaultTag.usage)).toBeInTheDocument()
    })

    it('should update tag', async () => {
        const {rerender} = render(
            <Provider store={mockStore()}>
                <Row {...defaultProps} />
            </Provider>,
            {
                wrapper: ({children}) => (
                    <table>
                        <tbody>{children}</tbody>
                    </table>
                ),
            }
        )

        fireEvent.click(screen.getByText('edit'))
        expect(editMock).toHaveBeenCalled()

        // It uses Redux state so I'm faking the change in edition mode
        rerender(
            <Provider store={mockStore({})}>
                <Row
                    {...defaultProps}
                    meta={fromJS({...defaultMeta, edit: true})}
                />
            </Provider>
        )

        const newName = 'billing change'
        fireEvent.change(screen.getByDisplayValue(defaultTag.name), {
            target: {value: newName},
        })
        const newDescription = 'finance change'
        fireEvent.change(screen.getByDisplayValue(defaultTag.description!), {
            target: {value: newDescription},
        })
        const newColor = '#123456'
        fireEvent.change(screen.getByPlaceholderText('ex: #eeeeee'), {
            target: {value: newColor},
        })
        fireEvent.click(screen.getByText('Save'))

        expect(saveMock).toHaveBeenCalledWith({
            ...defaultTag,
            name: newName,
            description: newDescription,
            decoration: {color: newColor},
        })
        await waitFor(() => expect(defaultProps.refresh).toHaveBeenCalled())
    })

    it('should use default value for tag color', () => {
        render(
            <Provider store={mockStore()}>
                <Row
                    {...defaultProps}
                    meta={fromJS({...defaultMeta, edit: true})}
                />
            </Provider>,
            {
                wrapper: ({children}) => (
                    <table>
                        <tbody>{children}</tbody>
                    </table>
                ),
            }
        )

        fireEvent.change(screen.getByPlaceholderText('ex: #eeeeee'), {
            target: {value: null},
        })
        fireEvent.click(screen.getByText('Save'))

        expect(saveMock).toHaveBeenCalledWith({
            ...defaultTag,
            decoration: {color: mockDefaultColor},
        })
    })

    it('should cancel tag update', () => {
        render(
            <Provider store={mockStore()}>
                <Row
                    {...defaultProps}
                    meta={fromJS({...defaultMeta, edit: true})}
                />
            </Provider>,
            {
                wrapper: ({children}) => (
                    <table>
                        <tbody>{children}</tbody>
                    </table>
                ),
            }
        )

        fireEvent.click(screen.getByText('Cancel'))
        expect(cancelMock).toHaveBeenCalled()
    })

    it('should select tag', () => {
        render(
            <Provider store={mockStore({})}>
                <Row {...defaultProps} />
            </Provider>,
            {
                wrapper: ({children}) => (
                    <table>
                        <tbody>{children}</tbody>
                    </table>
                ),
            }
        )

        fireEvent.click(screen.getByRole('checkbox'))
        expect(selectMock).toHaveBeenCalled()
    })

    it('should delete tag', () => {
        render(
            <Provider store={mockStore({})}>
                <Row {...defaultProps} />
            </Provider>,
            {
                wrapper: ({children}) => (
                    <table>
                        <tbody>{children}</tbody>
                    </table>
                ),
            }
        )

        fireEvent.click(screen.getByText('delete'))
        fireEvent.click(screen.getByText('Confirm'))
        expect(removeMock).toHaveBeenCalledWith(defaultProps.row.id.toString())
    })

    it('should handle failed tag deletion', async () => {
        useAppDispatchMock.mockReturnValue(() => Promise.reject())

        render(
            <Provider store={mockStore({})}>
                <Row {...defaultProps} />
            </Provider>,
            {
                wrapper: ({children}) => (
                    <table>
                        <tbody>{children}</tbody>
                    </table>
                ),
            }
        )

        fireEvent.click(screen.getByText('delete'))
        fireEvent.click(screen.getByText('Confirm'))

        expect(removeMock).toHaveBeenCalledWith(defaultProps.row.id.toString())
        await waitFor(() => expect(defaultProps.refresh).toHaveBeenCalled())
    })

    it('should not update state on props change when props row are the same', () => {
        const newName = 'foo'
        const {rerender} = render(
            <Provider store={mockStore()}>
                <Row
                    {...defaultProps}
                    meta={fromJS({...defaultMeta, edit: true})}
                />
            </Provider>,
            {
                wrapper: ({children}) => (
                    <table>
                        <tbody>{children}</tbody>
                    </table>
                ),
            }
        )

        fireEvent.change(screen.getByDisplayValue(defaultTag.name), {
            target: {value: newName},
        })
        rerender(
            <Provider store={mockStore({})}>
                <Row
                    {...defaultProps}
                    meta={fromJS({...defaultMeta, edit: true})}
                />
            </Provider>
        )

        expect(screen.queryByDisplayValue(newName)).toBeInTheDocument()
    })
})
