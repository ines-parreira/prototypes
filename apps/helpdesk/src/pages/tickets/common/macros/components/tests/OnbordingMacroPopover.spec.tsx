import { useRef } from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import type { UserSetting } from 'config/types/user'
import { UserSettingType } from 'config/types/user'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import type { RootState } from 'state/types'

import OnbordingMacroPopover from '../OnbordingMacroPopover'

jest.mock('hooks/useAppDispatch.ts', () => {
    return {
        __esModule: true,
        default: () => jest.fn(),
    }
})

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
        props,
    }: {
        props?: {
            onClearMacro?: () => void
            macrosVisible?: boolean
        }
    }) {
        const ref = useRef<any>()
        return (
            <div style={{ width: 800 }} ref={ref} data-testid="parent">
                <OnbordingMacroPopover
                    macrosVisible={props?.macrosVisible ?? true}
                    onClearMacro={props?.onClearMacro || jest.fn()}
                    target={ref}
                />
            </div>
        )
    }

    const renderPopover = (
        defaultState: Partial<RootState>,
        props?: {
            onClearMacro?: () => void
            macrosVisible?: boolean
        },
    ) =>
        render(<OnbordingMacroPopoverTestComp props={props} />, {
            storeState: defaultState,
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
        const { baseElement } = renderPopover(defaultState)

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
        renderPopover(defaultState)

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
        renderPopover(defaultState)

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
        renderPopover(defaultState)

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
        renderPopover(defaultState)

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

        renderPopover(defaultState, { onClearMacro })

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
        renderPopover(defaultState, { onClearMacro })

        fireEvent.click(await screen.findByText('Got it'))
        fireEvent.click(await screen.findByText('Revert back'))

        expect(screen.queryByText('Revert back')).toBeFalsy()
        expect(onClearMacro).toHaveBeenCalledTimes(1)
    })

    it("should not render popover if 'macro search' is hidden", () => {
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

        const { rerender } = renderPopover(defaultState, {
            onClearMacro,
            macrosVisible: false,
        })

        expect(screen.queryByText('Got it')).toBeFalsy()

        rerender(
            <OnbordingMacroPopoverTestComp
                props={{ onClearMacro, macrosVisible: true }}
            />,
        )

        expect(screen.queryByText('Got it')).toBeTruthy()
    })
})
