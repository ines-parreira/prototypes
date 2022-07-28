import React, {useRef} from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {user} from 'fixtures/users'
import {RootState} from 'state/types'
import {UserSettingType, UserSetting} from 'config/types/user'
import {ticket} from 'fixtures/ticket'
import {logEvent} from 'store/middlewares/segmentTracker'

import OnbordingMacroPopover from '../OnbordingMacroPopover'

jest.mock('store/middlewares/segmentTracker.ts')

jest.mock('hooks/useAppDispatch.ts', () => {
    return {
        __esModule: true,
        default: () => jest.fn(),
    }
})

const mockStore = configureMockStore([thunk])

// https://github.com/react-bootstrap/react-bootstrap/issues/4997
jest.mock('popper.js', () => {
    const PopperJS = jest.requireActual('popper.js')

    return class {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        static placements = PopperJS.placements

        constructor() {
            return {
                destroy: () => null,
                scheduleUpdate: () => null,
            }
        }
    }
})

describe('<OnbordingMacroPopover />', () => {
    function OnbordingMacroPopoverTestComp({
        defaultState,
        props,
    }: {
        defaultState: Partial<RootState>
        props?: {
            onClearMacro?: () => void
        }
    }) {
        const ref = useRef<any>()
        return (
            <Provider store={mockStore(defaultState)}>
                <div style={{width: 800}} ref={ref} data-testid="parent">
                    <OnbordingMacroPopover
                        onClearMacro={props?.onClearMacro || jest.fn()}
                        target={ref}
                    />
                </div>
            </Provider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should display popover', () => {
        const userSettings: UserSetting[] = [
            {
                data: {
                    show_macros: true,
                    macros_default_to_search_popover: true,
                    available: true,
                },
                id: 3,
                type: UserSettingType.Preferences,
            },
        ]

        user.settings = userSettings

        const defaultState: Partial<RootState> = {
            currentUser: fromJS(user),
            ticket: fromJS(ticket),
        }
        const {baseElement} = render(
            <OnbordingMacroPopoverTestComp defaultState={defaultState} />
        )

        expect(baseElement).toMatchSnapshot()
    })

    it('should not display popover when macros_default_to_search_popover settings disabled', () => {
        const userSettings: UserSetting[] = [
            {
                data: {
                    show_macros: true,
                    macros_default_to_search_popover: false,
                    available: true,
                },
                id: 3,
                type: UserSettingType.Preferences,
            },
        ]

        user.settings = userSettings

        const defaultState: Partial<RootState> = {
            currentUser: fromJS(user),
            ticket: fromJS(ticket),
        }
        render(<OnbordingMacroPopoverTestComp defaultState={defaultState} />)

        expect(screen.queryByText('Got it')).toBeFalsy()
    })

    it("should not display popover when macros_default_to_search_popover settings don't exited", () => {
        const userSettings: UserSetting[] = [
            {
                data: {
                    show_macros: true,
                    available: true,
                },
                id: 3,
                type: UserSettingType.Preferences,
            },
        ]

        user.settings = userSettings

        const defaultState: Partial<RootState> = {
            currentUser: fromJS(user),
            ticket: fromJS(ticket),
        }
        render(<OnbordingMacroPopoverTestComp defaultState={defaultState} />)

        expect(screen.queryByText('Got it')).toBeFalsy()
    })

    it('should not display popover when show_macros is disabled', () => {
        const userSettings: UserSetting[] = [
            {
                data: {
                    show_macros: false,
                    macros_default_to_search_popover: true,
                    available: true,
                },
                id: 3,
                type: UserSettingType.Preferences,
            },
        ]

        user.settings = userSettings

        const defaultState: Partial<RootState> = {
            currentUser: fromJS(user),
            ticket: fromJS(ticket),
        }
        render(<OnbordingMacroPopoverTestComp defaultState={defaultState} />)

        expect(screen.queryByText('Got it')).toBeFalsy()
    })

    it('should not display popover when show_macros settings disabled', () => {
        const userSettings: UserSetting[] = [
            {
                data: {
                    show_macros: false,
                    macros_default_to_search_popover: true,
                    available: true,
                },
                id: 3,
                type: UserSettingType.Preferences,
            },
        ]

        user.settings = userSettings

        const defaultState: Partial<RootState> = {
            currentUser: fromJS(user),
            ticket: fromJS(ticket),
        }
        render(<OnbordingMacroPopoverTestComp defaultState={defaultState} />)

        expect(screen.queryByText('Got it')).toBeFalsy()
    })

    it("should hide popover after select 'Keep Search'", async () => {
        const userSettings: UserSetting[] = [
            {
                data: {
                    show_macros: true,
                    macros_default_to_search_popover: true,
                    available: true,
                },
                id: 3,
                type: UserSettingType.Preferences,
            },
        ]

        user.settings = userSettings

        const defaultState: Partial<RootState> = {
            currentUser: fromJS(user),
            ticket: fromJS(ticket),
        }

        const onClearMacro = jest.fn()

        render(
            <OnbordingMacroPopoverTestComp
                props={{onClearMacro}}
                defaultState={defaultState}
            />
        )

        fireEvent.click(await screen.findByText('Got it'))
        fireEvent.click(await screen.findByText('Keep search'))

        expect(screen.queryByText('Keep search')).toBeFalsy()
        expect(onClearMacro).not.toHaveBeenCalled()
    })

    it("should hide TicketMacroSearch dropdown after select 'Revert Back'", async () => {
        const userSettings: UserSetting[] = [
            {
                data: {
                    show_macros: true,
                    macros_default_to_search_popover: true,
                    available: true,
                },
                id: 3,
                type: UserSettingType.Preferences,
            },
        ]

        user.settings = userSettings

        const defaultState: Partial<RootState> = {
            currentUser: fromJS(user),
            ticket: fromJS(ticket),
        }

        const onClearMacro = jest.fn()
        render(
            <OnbordingMacroPopoverTestComp
                props={{onClearMacro}}
                defaultState={defaultState}
            />
        )

        fireEvent.click(await screen.findByText('Got it'))
        fireEvent.click(await screen.findByText('Revert back'))

        expect(screen.queryByText('Revert back')).toBeFalsy()
        expect(onClearMacro).toHaveBeenCalledTimes(1)
    })

    it('should log segment when user revert back', async () => {
        const userSettings: UserSetting[] = [
            {
                data: {
                    show_macros: true,
                    macros_default_to_search_popover: true,
                    available: true,
                },
                id: 3,
                type: UserSettingType.Preferences,
            },
        ]

        user.settings = userSettings

        const defaultState: Partial<RootState> = {
            currentUser: fromJS(user),
            ticket: fromJS(ticket),
        }

        render(<OnbordingMacroPopoverTestComp defaultState={defaultState} />)

        fireEvent.click(await screen.findByText('Got it'))
        fireEvent.click(await screen.findByText('Revert back'))
        await waitFor(() => expect(logEvent).toHaveBeenCalled())

        expect(screen.queryByText('Revert back')).toBeFalsy()
    })
})
