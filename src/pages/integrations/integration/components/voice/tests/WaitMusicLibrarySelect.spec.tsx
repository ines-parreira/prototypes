import {UpdateWaitMusicLibrary} from '@gorgias/api-queries'
import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import {PhoneCountry} from 'models/phoneNumber/types'

import {STATIC_WAIT_MUSIC_LIBRARY} from '../waitMusicLibraryConstants'
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
        integrationCountry: PhoneCountry = PhoneCountry.US
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

        expect(getByText('Ringtone')).toBeInTheDocument()

        fireEvent.click(getByText('arrow_drop_down'))
        expect(getByText('Clockwork Waltz')).toBeInTheDocument()
        expect(getByText('New Frontier')).toBeInTheDocument()
        expect(getByText('The Elevator Bossanova')).toBeInTheDocument()
        expect(getByText('Moonlight Coffee')).toBeInTheDocument()

        const circularAudioPlayers = getAllByTestId('circular-audio-player')
        expect(circularAudioPlayers.length).toBe(5)
        expect(circularAudioPlayers[0]).toHaveTextContent(
            'https://assets.gorgias.io/phone/UsRingTone.mp3'
        )
        expect(circularAudioPlayers[1]).toHaveTextContent(
            'https://assets.gorgias.io/phone/ClockworkWaltz.mp3'
        )
        expect(circularAudioPlayers[2]).toHaveTextContent(
            'https://assets.gorgias.io/phone/newfrontier.mp3'
        )
        expect(circularAudioPlayers[3]).toHaveTextContent(
            'https://assets.gorgias.io/phone/theelevatorbossanova.mp3'
        )
        expect(circularAudioPlayers[4]).toHaveTextContent(
            'https://assets.gorgias.io/phone/moonlightcoffee.mp3'
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
            const {getByText} = renderComponent()

            fireEvent.click(getByText('arrow_drop_down'))
            fireEvent.click(getByText(libraryName))
            expect(onChangeMock).toHaveBeenCalledWith(expectedLibrary)
        }
    )

    it.each([
        {
            integrationCountry: PhoneCountry.US,
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/UsRingTone.mp3',
        },
        {
            integrationCountry: PhoneCountry.AU,
            expectedAudioFilePath:
                'https://github.com/msilvestro/custom-wait-music/raw/refs/heads/main/Australia_ringing_tone.mp3',
        },
        {
            integrationCountry: PhoneCountry.GB,
            expectedAudioFilePath:
                'https://github.com/msilvestro/custom-wait-music/raw/refs/heads/main/UK_ringback_tone.mp3',
        },
        {
            integrationCountry: PhoneCountry.CA,
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/UsRingTone.mp3',
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
