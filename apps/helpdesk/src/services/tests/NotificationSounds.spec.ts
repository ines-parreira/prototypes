import { flushPromises } from '@repo/testing'

import NotificationSounds, { sounds } from '../NotificationSounds'

describe('NotificationSounds', () => {
    let audioContext: jest.Mock
    let createBufferSource: jest.Mock
    let createGain: jest.Mock
    let decodeAudioData: jest.Mock
    let gainConnect: jest.Mock
    let gainNode: { connect: jest.Mock; gain: { value: number } }
    let sourceConnect: jest.Mock
    let sourceStart: jest.Mock
    let source: { buffer: string; connect: jest.Mock; start: jest.Mock }

    let arrayBuffer: jest.Mock
    let fetchMock: jest.Mock

    beforeEach(() => {
        gainConnect = jest.fn()
        const gain = { value: 0 }
        gainNode = { connect: gainConnect, gain }

        sourceConnect = jest.fn()
        sourceStart = jest.fn()
        source = {
            buffer: '',
            connect: sourceConnect,
            start: sourceStart,
        }
        createBufferSource = jest.fn(() => source)

        createGain = jest.fn(() => gainNode)
        decodeAudioData = jest.fn()
        const destination = 'destination'
        const audioCtx = {
            createBufferSource,
            createGain,
            decodeAudioData,
            destination,
        }

        audioContext = jest.fn(() => audioCtx)
        global.AudioContext = audioContext

        arrayBuffer = jest.fn()
        const res = { arrayBuffer }

        fetchMock = jest.fn(() => Promise.resolve(res))
        global.fetch = fetchMock as typeof fetch
    })

    it('should create an audio context and load sounds when initialised', () => {
        new NotificationSounds()

        expect(audioContext).toHaveBeenCalledWith()
        expect(createGain).toHaveBeenCalledWith()
        expect(gainConnect).toHaveBeenCalledWith('destination')
    })

    it('should play the given sound when called', async () => {
        sounds.forEach((sound) => {
            decodeAudioData.mockResolvedValueOnce(sound.value)
        })

        const ns = new NotificationSounds()
        await flushPromises()

        ns.play('intuition', 10)
        expect(createBufferSource).toHaveBeenCalledWith()
        expect(source.buffer).toBe('intuition')

        expect(sourceConnect).toHaveBeenCalledWith(gainNode)
        expect(sourceStart).toHaveBeenCalledWith(0)
    })
})
