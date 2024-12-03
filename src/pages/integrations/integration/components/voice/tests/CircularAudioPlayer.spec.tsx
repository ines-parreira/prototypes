import {fireEvent, render, waitFor} from '@testing-library/react'
import React from 'react'

import CircularAudioPlayer from '../CircularAudioPlayer'

const audioPlayMock = jest.fn().mockResolvedValue(undefined)
const audioPauseMock = jest.fn()
HTMLMediaElement.prototype.play = audioPlayMock
HTMLMediaElement.prototype.pause = audioPauseMock

jest.mock('../CircularProgressBar', () => (props: {progress: number}) => (
    <div data-testid="circular-progress-bar">{props.progress}</div>
))

describe('CircularAudioPlayer', () => {
    const AUDIO_SRC = 'https://assets.gorgias.io/phone/ClockworkWaltz.mp3'

    it('should render correctly', () => {
        const {container, getByText, getByTestId} = render(
            <CircularAudioPlayer src={AUDIO_SRC} />
        )

        expect(container.querySelector('audio')).toBeInTheDocument()
        expect(getByText('play_arrow')).toBeInTheDocument()
        expect(getByTestId('circular-progress-bar')).toBeInTheDocument()
    })

    it('should play the audio', async () => {
        const onPlayMock = jest.fn()

        const {getByText} = render(
            <CircularAudioPlayer
                src={AUDIO_SRC}
                isActive={true}
                onPlay={onPlayMock}
            />
        )

        expect(getByText('play_arrow')).toBeInTheDocument()
        fireEvent.click(getByText('play_arrow'))

        await waitFor(() => {
            expect(audioPlayMock).toHaveBeenCalled()
            expect(onPlayMock).toHaveBeenCalled()
        })
    })

    it('should stop the audio', async () => {
        const {getByText, container} = render(
            <CircularAudioPlayer src={AUDIO_SRC} isActive={true} />
        )

        const audioElement = container.querySelector(
            'audio'
        ) as HTMLAudioElement
        fireEvent.play(audioElement)
        jest.spyOn(audioElement, 'paused', 'get').mockReturnValue(false)

        expect(getByText('pause')).toBeInTheDocument()
        fireEvent.click(getByText('pause'))

        await waitFor(() => {
            expect(audioPauseMock).toHaveBeenCalled()
        })
    })

    it('should stop the audio if becomes active', async () => {
        const onPlayMock = jest.fn()

        const {rerender, container} = render(
            <CircularAudioPlayer
                src={AUDIO_SRC}
                isActive={true}
                onPlay={onPlayMock}
            />
        )

        const audioElement = container.querySelector(
            'audio'
        ) as HTMLAudioElement
        fireEvent.play(audioElement)
        jest.spyOn(audioElement, 'paused', 'get').mockReturnValue(false)
        jest.spyOn(audioElement, 'duration', 'get').mockReturnValue(100)

        fireEvent.timeUpdate(audioElement, {target: {currentTime: 10}})

        rerender(
            <CircularAudioPlayer
                src={AUDIO_SRC}
                isActive={false}
                onPlay={onPlayMock}
            />
        )

        await waitFor(() => {
            expect(audioPauseMock).toHaveBeenCalled()
            expect(audioElement.currentTime).toBe(0)
        })
    })

    it.each([
        {currentTime: 10, audioDuration: 100, progressBarContent: '0.1'},
        {currentTime: 20, audioDuration: 80, progressBarContent: '0.25'},
    ])(
        'should update the progress of the audio',
        ({currentTime, audioDuration, progressBarContent}) => {
            const onPlayMock = jest.fn()

            const {container, getByTestId} = render(
                <CircularAudioPlayer
                    src={AUDIO_SRC}
                    isActive={true}
                    onPlay={onPlayMock}
                />
            )

            const audioElement = container.querySelector(
                'audio'
            ) as HTMLAudioElement
            fireEvent.play(audioElement)
            jest.spyOn(audioElement, 'duration', 'get').mockReturnValue(
                audioDuration
            )

            fireEvent.timeUpdate(audioElement, {
                target: {currentTime},
            })

            const progressBar = getByTestId('circular-progress-bar')
            expect(progressBar).toHaveTextContent(progressBarContent)
        }
    )
})
