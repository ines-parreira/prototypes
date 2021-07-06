import React from 'react'
import {fireEvent} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import HelpCenterNewView from '../HelpCenterNewView'
import {renderWithRouter} from '../../../../../utils/testing'
import {RootState, StoreDispatch} from '../../../../../state/types'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const mockedCreateHelpCenter = jest.fn(() => Promise.resolve())

const mockedHelpCenterClient = {
    createHelpCenter: mockedCreateHelpCenter,
}

jest.mock('../../../../../../../../rest_api/help_center_api/index', () => ({
    getHelpCenterClient: () => Promise.resolve(mockedHelpCenterClient),
}))

describe('<HelpCenterNewView/>', () => {
    const defaultState: Partial<RootState> = {}
    const props = {}

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render the component', async () => {
        const {container, findByRole} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterNewView {...props} />
            </Provider>
        )
        await findByRole('textbox', {
            name: /help center name/i,
        })
        expect(container).toMatchSnapshot()
    })

    describe('Reset form', () => {
        it('should disabled the cancel button when the form has its initial state', async () => {
            const {findByRole} = renderWithRouter(
                <Provider store={mockedStore(defaultState)}>
                    <HelpCenterNewView {...props} />
                </Provider>
            )
            const cancelButton = await findByRole('button', {name: /cancel/i})
            expect(cancelButton.className).toMatch(/disabled/i)
        })
        it('should enable the cancel button when the form is different from its initial state', async () => {
            const {findByRole} = renderWithRouter(
                <Provider store={mockedStore(defaultState)}>
                    <HelpCenterNewView {...props} />
                </Provider>
            )
            const brandInput = await findByRole('textbox', {
                name: /help center name/i,
            })
            fireEvent.change(brandInput, {target: {value: 'My brand'}})
            const cancelButton = await findByRole('button', {name: /cancel/i})
            expect(cancelButton.className).not.toMatch(/disabled/i)
        })
    })

    describe('Submit form', () => {
        it('should disable the submit button if all the required fields are not filled', async () => {
            const {findByRole} = renderWithRouter(
                <Provider store={mockedStore(defaultState)}>
                    <HelpCenterNewView {...props} />
                </Provider>
            )
            const brandInput = await findByRole('textbox', {
                name: /help center name/i,
            })
            fireEvent.change(brandInput, {target: {value: 'My brand'}})
            fireEvent.change(brandInput, {target: {value: ''}})
            const submitButton = await findByRole('button', {
                name: /add new helpcenter/i,
            })
            expect(submitButton.className).toMatch(/disabled/i)
        })
        it('should enable the submit button when all the required fields are filled', async () => {
            const {findByRole} = renderWithRouter(
                <Provider store={mockedStore(defaultState)}>
                    <HelpCenterNewView {...props} />
                </Provider>
            )
            const brandInput = await findByRole('textbox', {
                name: /help center name/i,
            })
            fireEvent.change(brandInput, {target: {value: 'My brand'}})
            const submitButton = await findByRole('button', {
                name: /add new helpcenter/i,
            })
            expect(submitButton.className).not.toMatch(/disabled/i)
        })
        it('should call helpcenter API on submit a new helpcenter', async () => {
            const {findByRole} = renderWithRouter(
                <Provider store={mockedStore(defaultState)}>
                    <HelpCenterNewView {...props} />
                </Provider>
            )
            const brandInput = await findByRole('textbox', {
                name: /help center name/i,
            })
            fireEvent.change(brandInput, {target: {value: 'My brand'}})
            const submitButton = await findByRole('button', {
                name: /add new helpcenter/i,
            })
            fireEvent.click(submitButton)
            expect(mockedCreateHelpCenter).toHaveBeenLastCalledWith(null, {
                name: 'My brand',
                default_locale: 'en-US',
            })
        })
    })
})
