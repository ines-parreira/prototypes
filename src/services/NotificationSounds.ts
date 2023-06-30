import audioBeyondDoubt from 'assets/audio/beyond-doubt.mp3'
import audioClassic from 'assets/audio/classic.mp3'
import audioDefinite from 'assets/audio/definite.mp3'
import audioIntuition from 'assets/audio/intuition.mp3'
import audioJuntos from 'assets/audio/juntos.mp3'
import audioOpenEnded from 'assets/audio/open-ended.mp3'
import audioPrettyGood from 'assets/audio/pretty-good.mp3'
import audioSelfAssured from 'assets/audio/self-assured.mp3'
import audioThatWasQuick from 'assets/audio/that-was-quick.mp3'

export const sounds = [
    {label: 'Beyond Doubt', url: audioBeyondDoubt, value: 'beyond-doubt'},
    {label: 'Classic', url: audioClassic, value: 'default'},
    {label: 'Definite', url: audioDefinite, value: 'definite'},
    {label: 'Intuition', url: audioIntuition, value: 'intuition'},
    {label: 'Juntos', url: audioJuntos, value: 'juntos'},
    {label: 'Open Ended', url: audioOpenEnded, value: 'open-ended'},
    {label: 'Pretty Good', url: audioPrettyGood, value: 'pretty-good'},
    {label: 'Self Assured', url: audioSelfAssured, value: 'self-assured'},
    {label: 'That Was Quick', url: audioThatWasQuick, value: 'that-was-quick'},
] as const

export type SoundValue = typeof sounds[number]['value']

export const defaultSound = {
    enabled: true,
    sound: 'default',
    volume: 5,
} as const

export default class NotificationSounds {
    private audioCtx: AudioContext
    private gainNode: GainNode

    private buffers: Record<SoundValue, AudioBuffer>

    constructor() {
        const audioCtx = new AudioContext()
        const gainNode = audioCtx.createGain()
        gainNode.connect(audioCtx.destination)

        this.audioCtx = audioCtx
        this.gainNode = gainNode

        this.buffers = {} as Record<SoundValue, AudioBuffer>
        void this.loadSounds()
    }

    private async loadSound(url: string) {
        const res = await fetch(url)
        const arrBuff = await res.arrayBuffer()
        return await this.audioCtx.decodeAudioData(arrBuff)
    }

    private async loadSounds() {
        try {
            const promises = sounds.map((sound) => this.loadSound(sound.url))
            const buffers = await Promise.all(promises)
            sounds.forEach((sound, i) => {
                this.buffers[sound.value] = buffers[i]
            })
        } catch (err: unknown) {
            console.error('failed to load sound', err)
        }
    }

    public play(soundValue: SoundValue, volume: number) {
        const buffer = this.buffers[soundValue]

        const source = this.audioCtx.createBufferSource()
        source.buffer = buffer
        this.gainNode.gain.value = volume / 10
        source.connect(this.gainNode)
        source.start(0)
    }
}
