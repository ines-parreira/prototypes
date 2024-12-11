import {UpdateWaitMusicLibrary} from '@gorgias/api-queries'
import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import {
    DEFAULT_RINGTONE_AUDIO_FILE_PATHS_INDEX,
    RINGTONE_AUDIO_FILE_PATHS,
    STATIC_WAIT_MUSIC_LIBRARY,
} from '../waitMusicLibraryConstants'
import WaitMusicLibrarySelect from '../WaitMusicLibrarySelect'

jest.mock(
    '../CircularAudioPlayer',
    () => (props: {src: string; isActive: boolean; onPlay: () => null}) => {
        return (
            <div data-testid="circular-audio-player">
                <span>{props.src}</span>
                <button onClick={props.onPlay} />
                <span>{props.isActive ? 'Active' : 'Inactive'}</span>
            </div>
        )
    }
)

describe('<WaitMusicLibrarySelect />', () => {
    const onChangeMock = jest.fn()
    const renderComponent = (
        selectedLibrary?: UpdateWaitMusicLibrary,
        integrationCountry: string = 'US'
    ) => {
        return render(
            <WaitMusicLibrarySelect
                library={selectedLibrary}
                onChange={onChangeMock}
                integrationCountry={integrationCountry}
            />
        )
    }

    it('should render', () => {
        const {getByText, getAllByTestId} = renderComponent()

        expect(getByText('Clockwork Waltz')).toBeInTheDocument()

        fireEvent.click(getByText('arrow_drop_down'))
        expect(getByText('Ringtone')).toBeInTheDocument()
        expect(getByText('Chill While Waiting')).toBeInTheDocument()
        expect(getByText('Soothe')).toBeInTheDocument()
        expect(getByText('Bright Lights')).toBeInTheDocument()

        const circularAudioPlayers = getAllByTestId('circular-audio-player')
        expect(circularAudioPlayers.length).toBe(5)
        expect(circularAudioPlayers[0]).toHaveTextContent(
            'https://assets.gorgias.io/phone/US_ringing_tone.wav'
        )
        expect(circularAudioPlayers[1]).toHaveTextContent(
            'https://assets.gorgias.io/phone/waiting_music_chill.mp3'
        )
        expect(circularAudioPlayers[2]).toHaveTextContent(
            'https://assets.gorgias.io/phone/waiting_music_soothe.mp3'
        )
        expect(circularAudioPlayers[3]).toHaveTextContent(
            'https://assets.gorgias.io/phone/waiting_music_bright_lights.mp3'
        )
        expect(circularAudioPlayers[4]).toHaveTextContent(
            'https://assets.gorgias.io/phone/ClockworkWaltz.mp3'
        )
    })

    it.each(
        STATIC_WAIT_MUSIC_LIBRARY.map((libraryItem) => ({
            libraryName: libraryItem.name,
            expectedLibrary: libraryItem,
        }))
    )(
        'should select correct library audio for $libraryName',
        ({libraryName, expectedLibrary}) => {
            const {getByText} = renderComponent({
                key: 'ringtone',
                name: 'Ringtone',
                audio_file_path:
                    RINGTONE_AUDIO_FILE_PATHS[
                        DEFAULT_RINGTONE_AUDIO_FILE_PATHS_INDEX
                    ].audioFilePath,
            })

            fireEvent.click(getByText('arrow_drop_down'))
            fireEvent.click(getByText(libraryName))
            expect(onChangeMock).toHaveBeenCalledWith(expectedLibrary)
        }
    )

    it.each([
        {
            integrationCountry: 'US',
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/US_ringing_tone.wav',
        },
        {
            integrationCountry: 'CA',
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/US_ringing_tone.wav',
        },
        {
            integrationCountry: 'AU',
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/AU_ringing_tone.wav',
        },
        {
            integrationCountry: 'IT',
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/EU_ringing_tone.wav',
        },
        {
            integrationCountry: 'RO',
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/EU_ringing_tone.wav',
        },
        {
            integrationCountry: 'FR',
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/FR_ringing_tone.wav',
        },
        {
            integrationCountry: 'GB',
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/UK_ringing_tone.wav',
        },
        {
            integrationCountry: 'NZ',
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/UK_ringing_tone.wav',
        },
        {
            integrationCountry: 'JP',
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/US_ringing_tone.wav',
        },
    ])(
        'should select correct ringtone for country $integrationCountry',
        ({integrationCountry, expectedAudioFilePath}) => {
            const {getByText} = renderComponent(
                STATIC_WAIT_MUSIC_LIBRARY[0],
                integrationCountry
            )

            fireEvent.click(getByText('arrow_drop_down'))
            fireEvent.click(getByText('Ringtone'))
            expect(onChangeMock).toHaveBeenCalledWith({
                key: 'ringtone',
                name: 'Ringtone',
                audio_file_path: expectedAudioFilePath,
            })
        }
    )

    it('should correctly set the active circular audio player', () => {
        const {getByText, getAllByTestId} = renderComponent()

        fireEvent.click(getByText('arrow_drop_down'))
        const circularAudioPlayers = getAllByTestId('circular-audio-player')
        expect(circularAudioPlayers.length).toBe(5)

        fireEvent.click(
            circularAudioPlayers[2].querySelector('button') as Element
        )

        expect(circularAudioPlayers[0]).toHaveTextContent('Inactive')
        expect(circularAudioPlayers[1]).toHaveTextContent('Inactive')
        expect(circularAudioPlayers[2]).toHaveTextContent('Active')
        expect(circularAudioPlayers[3]).toHaveTextContent('Inactive')
        expect(circularAudioPlayers[4]).toHaveTextContent('Inactive')
    })
})
