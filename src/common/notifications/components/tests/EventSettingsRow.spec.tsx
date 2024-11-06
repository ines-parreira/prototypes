import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import EventSettingsRow from '../EventSettingsRow'

jest.mock(
    '../SoundSelect',
    () =>
        ({onChange}: {onChange: (sound: string) => void}) => (
            <select
                onChange={(e) => {
                    onChange(e.target.value)
                }}
            >
                <option value="sound 1">sound 1</option>
                <option value="sound 2">sound 2</option>
            </select>
        )
)

describe('EventSettingsRow', () => {
    it('should render the given config', () => {
        const {getByText} = render(
            <table>
                <tbody>
                    <EventSettingsRow
                        config={{
                            type: 'user.mentioned',
                            settings: {
                                label: 'Mentioned in an internal note',
                            },
                        }}
                        onChangeChannel={jest.fn()}
                        onChangeSound={jest.fn()}
                    />
                </tbody>
            </table>
        )

        expect(getByText('Mentioned in an internal note')).toBeInTheDocument()
    })

    it('should render an icon if needed', () => {
        const {getByText} = render(
            <table>
                <tbody>
                    <EventSettingsRow
                        config={{
                            type: 'user.mentioned',
                            settings: {
                                label: 'Mentioned in an internal note',
                                icon: 'email',
                            },
                        }}
                        onChangeChannel={jest.fn()}
                        onChangeSound={jest.fn()}
                    />
                </tbody>
            </table>
        )

        expect(getByText('email')).toBeInTheDocument()
    })

    it('should render a tooltip if needed', () => {
        const {getByText} = render(
            <table>
                <tbody>
                    <EventSettingsRow
                        config={{
                            type: 'user.mentioned',
                            settings: {
                                label: 'Mentioned in an internal note',
                                tooltip: 'I am a tooltip',
                            },
                        }}
                        onChangeChannel={jest.fn()}
                        onChangeSound={jest.fn()}
                    />
                </tbody>
            </table>
        )

        const icon = getByText('info')
        expect(icon).toBeInTheDocument()

        fireEvent.focus(icon)
        expect(getByText('I am a tooltip')).toBeInTheDocument()
    })

    it('should call a function whenever the selected sound changes', () => {
        const onChangeSound = jest.fn()
        const {getAllByRole} = render(
            <table>
                <tbody>
                    <EventSettingsRow
                        config={{
                            type: 'user.mentioned',
                            settings: {
                                label: 'Mentioned in an internal note',
                            },
                        }}
                        onChangeChannel={jest.fn()}
                        onChangeSound={onChangeSound}
                    />
                </tbody>
            </table>
        )

        const select = getAllByRole('combobox')[0]
        fireEvent.change(select, {target: {value: 'sound 1'}})

        expect(onChangeSound).toHaveBeenCalledWith('sound 1')
    })

    it('should handle channel checkbox change', () => {
        const onChangeChannel = jest.fn()
        const {getAllByRole} = render(
            <table>
                <tbody>
                    <EventSettingsRow
                        config={{
                            type: 'user.mentioned',
                            settings: {
                                label: 'Mentioned in an internal note',
                            },
                        }}
                        onChangeChannel={onChangeChannel}
                        onChangeSound={jest.fn()}
                    />
                </tbody>
            </table>
        )

        const checkbox = getAllByRole('checkbox')[0]
        fireEvent.click(checkbox)

        expect(onChangeChannel).toHaveBeenCalledWith('in_app_feed', true)
    })

    it('should disable checkbox change for the legacy notification', () => {
        const onChangeChannel = jest.fn()
        const {getAllByRole} = render(
            <table>
                <tbody>
                    <EventSettingsRow
                        config={{
                            type: 'legacy-chat-and-messaging',
                            settings: {
                                label: 'Chat & messaging tickets',
                            },
                        }}
                        onChangeChannel={onChangeChannel}
                        onChangeSound={jest.fn()}
                    />
                </tbody>
            </table>
        )

        const checkbox = getAllByRole('checkbox')[0]
        fireEvent.click(checkbox)

        expect(onChangeChannel).not.toHaveBeenCalled()
    })

    it('should render tooltip for the legacy notification', () => {
        const {getAllByRole, getByText} = render(
            <table>
                <tbody>
                    <EventSettingsRow
                        config={{
                            type: 'legacy-chat-and-messaging',
                            settings: {
                                label: 'Chat & messaging tickets',
                            },
                        }}
                        onChangeChannel={jest.fn()}
                        onChangeSound={jest.fn()}
                    />
                </tbody>
            </table>
        )

        const checkbox = getAllByRole('checkbox')[0]
        fireEvent.focus(checkbox)

        expect(
            getByText('This setting cannot be deselected')
        ).toBeInTheDocument()
    })
})
