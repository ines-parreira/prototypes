import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import useNotificationSettings from 'pages/settings/notifications/hooks/useNotificationSettings'
import useSoundSetting from 'pages/settings/notifications/hooks/useSoundSetting'

import NotificationSettings from '../NotificationSettings'

jest.mock('pages/settings/notifications/hooks/useNotificationSettings', () =>
    jest.fn()
)

jest.mock('pages/settings/notifications/hooks/useSoundSetting', () => jest.fn())

jest.mock(
    '../SoundSetting',
    () =>
        ({description, title}: {description: string; title: string}) => {
            return (
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
            )
        }
)

const useNotificationSettingsMock = useNotificationSettings as jest.Mock
const useSoundSettingMock = useSoundSetting as jest.Mock

describe('<NotificationSettings />', () => {
    let save: ReturnType<typeof useNotificationSettings>['save']

    beforeEach(() => {
        jest.resetAllMocks()

        save = jest.fn()
        useNotificationSettingsMock.mockReturnValue({save})

        useSoundSettingMock.mockReturnValue({
            enabled: true,
            sound: 'default',
            volume: 5,
        })
    })

    it('should render out a SoundSetting for messages', () => {
        const {getByText} = render(<NotificationSettings />)

        expect(getByText('Message notifications')).toBeInTheDocument()
        expect(
            getByText(/Customize your notification sound/)
        ).toBeInTheDocument()
    })

    it('should call the save function when the form is submitted', () => {
        const {getByText} = render(<NotificationSettings />)

        const el = getByText('Save settings')

        userEvent.click(el)

        expect(save).toHaveBeenCalledWith({
            notificationSound: {
                enabled: true,
                sound: 'default',
                volume: 5,
            },
        })
    })

    it('should render credits', () => {
        const {getByText} = render(<NotificationSettings />)

        const el = getByText(/Notification sounds in Gorgias are sourced from/)
        expect(el).toBeInTheDocument()
    })
})
