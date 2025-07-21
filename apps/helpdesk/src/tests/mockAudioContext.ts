const audioContext = jest.fn(() => ({
    createBufferSource: jest.fn(() => ({
        buffer: '',
        connect: jest.fn(),
        start: jest.fn(),
    })),
    createGain: jest.fn(() => ({
        connect: jest.fn(),
        gain: { value: 1 },
    })),
    decodeAudioData: jest.fn(),
    destination: 'destination',
}))

global.AudioContext = audioContext as unknown as typeof AudioContext
