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
    let resume: jest.Mock
    let audioCtxObj: {
        createBufferSource: jest.Mock
        createGain: jest.Mock
        decodeAudioData: jest.Mock
        destination: string
        resume: jest.Mock
        state: string
    }

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
        resume = jest.fn(() => Promise.resolve())
        audioCtxObj = {
            createBufferSource,
            createGain,
            decodeAudioData,
            destination: 'destination',
            resume,
            state: 'running',
        }

        audioContext = jest.fn(() => audioCtxObj)
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

    it('should queue sound when context is suspended and play it on first user interaction', async () => {
        sounds.forEach((sound) => {
            decodeAudioData.mockResolvedValueOnce(sound.value)
        })

        audioCtxObj.state = 'suspended'
        const ns = new NotificationSounds()
        await flushPromises()

        ns.play('intuition', 10)
        expect(sourceStart).not.toHaveBeenCalled()

        document.dispatchEvent(new MouseEvent('click'))
        await flushPromises()

        expect(resume).toHaveBeenCalled()
        expect(source.buffer).toBe('intuition')
        expect(sourceStart).toHaveBeenCalledWith(0)
    })

    it('should not play queued sound if toast has already expired when user interacts', async () => {
        sounds.forEach((sound) => {
            decodeAudioData.mockResolvedValueOnce(sound.value)
        })

        jest.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(6000)

        audioCtxObj.state = 'suspended'
        const ns = new NotificationSounds()
        await flushPromises()

        ns.play('intuition', 10)
        expect(sourceStart).not.toHaveBeenCalled()

        document.dispatchEvent(new MouseEvent('click'))
        await flushPromises()

        expect(resume).toHaveBeenCalled()
        expect(sourceStart).not.toHaveBeenCalled()
    })
})
