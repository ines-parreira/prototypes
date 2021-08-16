import React from 'react'
import {act, fireEvent, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import HelpCenterNewView from '../HelpCenterNewView'
import {renderWithRouter} from '../../../../../utils/testing'
import {RootState, StoreDispatch} from '../../../../../state/types'

import {useHelpcenterApi} from '../../hooks/useHelpcenterApi'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>()

jest.mock('../../hooks/useHelpcenterApi', () => {
    return {
        useHelpcenterApi: () => ({
            isReady: true,
            client: {
                createHelpCenter: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({})),
            },
        }),
    }
})

jest.mock('../../hooks/useLocales', () => ({
    useLocales: () => [
        {
            name: 'English - USA',
            code: 'en-US',
        },
        {
            name: 'French - France',
            code: 'fr-FR',
        },
        {
            name: 'French - Canada',
            code: 'fr-CA',
        },
        {
            name: 'Czech - Czech Republic',
            code: 'cs-CZ',
        },
    ],
}))

describe('<HelpCenterNewView/>', () => {
    const defaultState: Partial<RootState> = {}
    const props = {}

    beforeEach(() => {
        jest.clearAllMocks()
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
            const {findByRole, getByTestId} = renderWithRouter(
                <Provider store={mockedStore(defaultState)}>
                    <HelpCenterNewView {...props} />
                </Provider>
            )
            const brandInput = await findByRole('textbox', {
                name: /help center name/i,
            })
            const submitButton = await findByRole('button', {
                name: /add new helpcenter/i,
            })

            void act(async () => {
                fireEvent.change(brandInput, {target: {value: 'My brand'}})
                fireEvent.click(submitButton)

                await waitFor(() => getByTestId('loading'))

                expect(
                    useHelpcenterApi().client?.createHelpCenter
                ).toHaveBeenLastCalledWith(null, {
                    name: 'My brand',
                    default_locale: 'en-US',
                })
            })
        })
    })
})
