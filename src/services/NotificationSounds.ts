import defaultSound from 'assets/audio/notification.mp3'

export const sounds = [
    {
        label: 'Classic',
        url: defaultSound,
        value: 'classic',
    },
    {
        label: 'Swoosh',
        url: defaultSound,
        value: 'swoosh',
    },
] as const

export type SoundValue = typeof sounds[number]['value']

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
