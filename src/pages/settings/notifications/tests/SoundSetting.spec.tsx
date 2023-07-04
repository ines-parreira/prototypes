import {fireEvent, render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _noop from 'lodash/noop'
import React, {ChangeEvent, ComponentProps, ReactNode} from 'react'

import {notificationSounds} from 'services'
import SoundSetting from '../SoundSetting'

jest.mock(
    'pages/common/forms/ToggleInput',
    () =>
        ({
            caption,
            children,
            isToggled,
            onClick,
        }: {
            caption: string
            children: ReactNode
            isToggled: boolean
            onClick: (checked: boolean) => void
        }) => {
            const handleClick = (ev: ChangeEvent<HTMLInputElement>) => {
                onClick(ev.target.checked)
            }

            return (
                <div>
                    <label htmlFor="toggle">{children}</label>
                    <p>{caption}</p>
                    <input
                        checked={isToggled}
                        id="toggle"
                        type="checkbox"
                        onChange={handleClick}
                    />
                </div>
            )
        }
)

jest.mock('services', () => ({
    notificationSounds: {
        play: jest.fn(),
    },
}))

jest.mock('services/NotificationSounds', () => ({
    sounds: [
        {label: 'Classic', value: 'classic'},
        {label: 'Beep-boop', value: 'beepboop'},
    ],
}))

describe('<SoundSetting />', () => {
    const defaultProps: ComponentProps<typeof SoundSetting> = {
        description: 'Test description',
        enabled: true,
        sound: 'default',
        title: 'Beep boop',
        volume: 5,
        onChangeEnabled: _noop,
        onChangeSound: _noop,
        onChangeVolume: _noop,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render out the setting', () => {
        const {getByText} = render(<SoundSetting {...defaultProps} />)

        expect(getByText('Beep boop')).toBeInTheDocument()
        expect(getByText('Test description')).toBeInTheDocument()
        expect(getByText('Test Sound')).toBeInTheDocument()
    })

    it('should call `onChangeEnabled` when the toggle is used', () => {
        const onChangeEnabled = jest.fn()
        const {getByText} = render(
            <SoundSetting
                {...defaultProps}
                onChangeEnabled={onChangeEnabled as (enabled: boolean) => void}
            />
        )

        const el = getByText('Beep boop')
        userEvent.click(el)

        expect(onChangeEnabled).toHaveBeenCalledWith(false)
    })

    it('should play the sound and call `onChangeSound` when the sound is changed', () => {
        const onChangeSound = jest.fn()
        const {getByRole, getByText} = render(
            <SoundSetting {...defaultProps} onChangeSound={onChangeSound} />
        )

        const select = getByRole('listbox')
        userEvent.click(select)

        const option = getByText('Beep-boop')
        userEvent.click(option)

        expect(notificationSounds.play).toHaveBeenCalledWith('beepboop', 5)
        expect(onChangeSound).toHaveBeenCalledWith('beepboop')
    })

    it('should play the sound at the selected volume and call `onChangeVolume` when the volume is changed', () => {
        const onChangeVolume = jest.fn()
        const {getByRole} = render(
            <SoundSetting {...defaultProps} onChangeVolume={onChangeVolume} />
        )

        const el = getByRole('slider')
        fireEvent.mouseDown(el)
        fireEvent.change(el, {target: {value: '8'}})
        fireEvent.mouseUp(document.body)

        expect(notificationSounds.play).toHaveBeenCalledWith('default', 8)
        expect(onChangeVolume).toHaveBeenCalledWith(8)
    })

    it('should play a test sounds when the test button is clicked', () => {
        const {getByText} = render(<SoundSetting {...defaultProps} />)

        const el = getByText('Test Sound')
        userEvent.click(el)

        expect(notificationSounds.play).toHaveBeenCalledWith('default', 5)
    })
})
