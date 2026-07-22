import { useEffect, useRef, useState } from 'react'
import { Button } from '@gorgias/axiom'

import css from './GaiaVoiceCapture.less'

// Number of bars in the scrolling waveform. Newest sample enters on the right
// and scrolls left, so this is roughly the seconds of history shown.
const BAR_COUNT = 48
// How often we push a new amplitude sample into the waveform history.
const SAMPLE_INTERVAL_MS = 55

type Props = {
    // Discard the recording and return to the normal composer.
    onCancel: () => void
    // Stop listening and hand the transcript to Gaia.
    onSubmit: (transcript: string) => void
}

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/**
 * Voice capture styled after Claude's dictation: a scrolling waveform whose
 * bars are a live history of microphone amplitude (newest on the right,
 * scrolling left), an elapsed timer, the transcript as it streams in (Web
 * Speech API), and cancel / done controls. When the mic can't be read, a
 * lightweight synthetic wave keeps the same scrolling motion.
 */
export function GaiaVoiceCapture({ onCancel, onSubmit }: Props) {
    const [transcript, setTranscript] = useState('')
    const [interim, setInterim] = useState('')
    const [elapsed, setElapsed] = useState(0)

    const barsRef = useRef<Array<HTMLSpanElement | null>>([])
    const historyRef = useRef<number[]>(new Array(BAR_COUNT).fill(0))
    const rafRef = useRef<number>()
    const streamRef = useRef<MediaStream | null>(null)
    const audioCtxRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    // Latest text kept in a ref so "done" submits without a stale closure.
    const latestRef = useRef('')

    useEffect(() => {
        latestRef.current = [transcript, interim].filter(Boolean).join(' ')
    }, [transcript, interim])

    // Elapsed recording timer.
    useEffect(() => {
        const id = window.setInterval(
            () => setElapsed((value) => value + 1),
            1000,
        )
        return () => window.clearInterval(id)
    }, [])

    // Single animation loop that drives the scrolling waveform. It starts
    // immediately with a synthetic wave and switches to real microphone
    // amplitude as soon as the audio graph is ready.
    useEffect(() => {
        let lastSample = 0
        let phase = 0
        const timeData = new Uint8Array(1024)

        const loop = (now: number) => {
            rafRef.current = requestAnimationFrame(loop)
            if (now - lastSample < SAMPLE_INTERVAL_MS) return
            lastSample = now

            let sample: number
            const analyser = analyserRef.current
            if (analyser) {
                // RMS of the time-domain signal → perceived loudness (0..1).
                analyser.getByteTimeDomainData(timeData)
                let sum = 0
                for (let i = 0; i < timeData.length; i++) {
                    const centered = (timeData[i] - 128) / 128
                    sum += centered * centered
                }
                sample = Math.min(1, Math.sqrt(sum / timeData.length) * 2.4)
            } else {
                // Calm synthetic wave for the no-microphone fallback.
                phase += 0.32
                sample =
                    0.24 + 0.16 * Math.sin(phase) + 0.06 * Math.sin(phase * 2.3)
            }

            const history = historyRef.current
            history.push(sample)
            history.shift()

            const bars = barsRef.current
            for (let i = 0; i < bars.length; i++) {
                const el = bars[i]
                if (el) el.style.height = `${4 + history[i] * 26}px`
            }
        }

        rafRef.current = requestAnimationFrame(loop)

        const startMic = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                })
                streamRef.current = stream
                const AudioCtx =
                    window.AudioContext ||
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (window as any).webkitAudioContext
                const ctx = new AudioCtx()
                audioCtxRef.current = ctx
                const analyser = ctx.createAnalyser()
                analyser.fftSize = 2048
                analyser.smoothingTimeConstant = 0.75
                ctx.createMediaStreamSource(stream).connect(analyser)
                analyserRef.current = analyser
            } catch {
                // Mic blocked/unavailable — synthetic wave keeps scrolling.
            }
        }

        startMic()

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            streamRef.current?.getTracks().forEach((track) => track.stop())
            audioCtxRef.current?.close?.()
            analyserRef.current = null
        }
    }, [])

    // Live transcription (Web Speech API, when supported).
    useEffect(() => {
        const SpeechRecognition =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).SpeechRecognition ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) return

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let finalText = ''
            let interimText = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i]
                if (result.isFinal) finalText += result[0].transcript
                else interimText += result[0].transcript
            }
            if (finalText) {
                setTranscript((prev) =>
                    `${prev} ${finalText}`.replace(/\s+/g, ' ').trim(),
                )
            }
            setInterim(interimText)
        }
        recognition.onerror = () => {}
        try {
            recognition.start()
        } catch {
            // Some browsers throw if start() is called twice quickly.
        }

        return () => recognition.stop?.()
    }, [])

    const liveText = [transcript, interim].filter(Boolean).join(' ')

    return (
        <div className={css.listening}>
            <div className={css.meta}>
                <span className={css.dot} aria-hidden />
                <span className={css.time}>{formatTime(elapsed)}</span>
            </div>

            <div className={css.body}>
                <div className={css.waveRow}>
                    <span className={css.wave} aria-hidden>
                        {Array.from({ length: BAR_COUNT }).map((_, i) => (
                            <span
                                key={i}
                                ref={(el) => {
                                    barsRef.current[i] = el
                                }}
                                className={css.bar}
                            />
                        ))}
                    </span>
                </div>
                <div className={css.transcript}>{liveText || 'Listening…'}</div>
            </div>

            <div className={css.actions}>
                <Button
                    variant="tertiary"
                    size="sm"
                    icon="close"
                    aria-label="Cancel"
                    onClick={onCancel}
                />
                <Button
                    variant="primary"
                    size="sm"
                    icon="send"
                    aria-label="Stop and send"
                    isDisabled={!liveText}
                    onClick={() => onSubmit(latestRef.current.trim())}
                />
            </div>
        </div>
    )
}
