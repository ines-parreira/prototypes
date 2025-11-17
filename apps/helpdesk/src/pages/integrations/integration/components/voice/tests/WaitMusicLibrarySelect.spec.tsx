import { fireEvent, render } from '@testing-library/react'

import type { VoiceQueueWaitMusicLibrary } from '@gorgias/helpdesk-queries'

import { STATIC_WAIT_MUSIC_LIBRARY } from '../waitMusicLibraryConstants'
import WaitMusicLibrarySelect from '../WaitMusicLibrarySelect'

jest.mock(
    '../CircularAudioPlayer',
    () => (props: { src: string; isActive: boolean; onPlay: () => null }) => {
        return (
            <div data-testid="circular-audio-player">
                <span>{props.src}</span>
                <button onClick={props.onPlay} />
                <span>{props.isActive ? 'Active' : 'Inactive'}</span>
            </div>
        )
    },
)

describe('<WaitMusicLibrarySelect />', () => {
    const onChangeMock = jest.fn()
    const renderComponent = (selectedLibrary?: VoiceQueueWaitMusicLibrary) => {
        return render(
            <WaitMusicLibrarySelect
                library={selectedLibrary}
                onChange={onChangeMock}
            />,
        )
    }

    it('should render', () => {
        const { getByText, getAllByTestId, getAllByText } = renderComponent()

        fireEvent.click(getByText('arrow_drop_down'))
        expect(getAllByText('Ringing Tone - US')).toHaveLength(2)
        expect(getByText('Ringing Tone - UK')).toBeInTheDocument()
        expect(getByText('Ringing Tone - AU')).toBeInTheDocument()
        expect(getByText('Ringing Tone - EU')).toBeInTheDocument()
        expect(getByText('Ringing Tone - FR')).toBeInTheDocument()
        expect(getByText('Chill While Waiting')).toBeInTheDocument()
        expect(getByText('Soothe')).toBeInTheDocument()
        expect(getByText('Bright Lights')).toBeInTheDocument()

        const circularAudioPlayers = getAllByTestId('circular-audio-player')
        expect(circularAudioPlayers.length).toBe(9)
        expect(circularAudioPlayers[0]).toHaveTextContent(
            'https://assets.gorgias.io/phone/US_ringing_tone.wav',
        )
        expect(circularAudioPlayers[1]).toHaveTextContent(
            'https://assets.gorgias.io/phone/AU_ringing_tone.wav',
        )
        expect(circularAudioPlayers[2]).toHaveTextContent(
            'https://assets.gorgias.io/phone/EU_ringing_tone.wav',
        )
        expect(circularAudioPlayers[3]).toHaveTextContent(
            'https://assets.gorgias.io/phone/FR_ringing_tone.wav',
        )
        expect(circularAudioPlayers[4]).toHaveTextContent(
            'https://assets.gorgias.io/phone/UK_ringing_tone.wav',
        )
        expect(circularAudioPlayers[5]).toHaveTextContent(
            'https://assets.gorgias.io/phone/waiting_music_chill.mp3',
        )
        expect(circularAudioPlayers[6]).toHaveTextContent(
            'https://assets.gorgias.io/phone/waiting_music_soothe.mp3',
        )
        expect(circularAudioPlayers[7]).toHaveTextContent(
            'https://assets.gorgias.io/phone/waiting_music_bright_lights.mp3',
        )
        expect(circularAudioPlayers[8]).toHaveTextContent(
            'https://assets.gorgias.io/phone/ClockworkWaltz.mp3',
        )
    })

    it.each([
        {
            fileLabel: 'Ringing Tone - US',
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/US_ringing_tone.wav',
        },
        {
            fileLabel: 'Ringing Tone - AU',
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/AU_ringing_tone.wav',
        },
        {
            fileLabel: 'Ringing Tone - EU',
            expectedAudioFilePath:
                'https://assets.gorgias.io/phone/EU_ringing_tone.wav',
        },
    ])(
        'should select correct ringtone',
        ({ fileLabel, expectedAudioFilePath }) => {
            const { getByText } = renderComponent(STATIC_WAIT_MUSIC_LIBRARY[0])

            fireEvent.click(getByText('arrow_drop_down'))
            fireEvent.click(getByText(fileLabel))
            expect(onChangeMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    audio_file_path: expectedAudioFilePath,
                }),
            )
        },
    )

    it('should correctly set the active circular audio player', () => {
        const { getByText, getAllByTestId } = renderComponent()

        fireEvent.click(getByText('arrow_drop_down'))
        const circularAudioPlayers = getAllByTestId('circular-audio-player')
        expect(circularAudioPlayers.length).toBe(9)

        fireEvent.click(
            circularAudioPlayers[2].querySelector('button') as Element,
        )

        expect(circularAudioPlayers[0]).toHaveTextContent('Inactive')
        expect(circularAudioPlayers[1]).toHaveTextContent('Inactive')
        expect(circularAudioPlayers[2]).toHaveTextContent('Active')
        expect(circularAudioPlayers[3]).toHaveTextContent('Inactive')
        expect(circularAudioPlayers[4]).toHaveTextContent('Inactive')
    })
})
