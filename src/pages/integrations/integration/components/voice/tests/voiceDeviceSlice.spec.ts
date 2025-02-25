import voiceDeviceSlice from '../voiceDeviceSlice'

const reducer = voiceDeviceSlice.reducer
const {
    setDevice,
    setCall,
    setIsRinging,
    setIsDialing,
    setIsConnecting,
    setError,
    setWarning,
    setReconnectAttempts,
    incrementReconnectAttempts,
    resetReconnectAttempts,
} = voiceDeviceSlice.actions

describe('voiceDeviceSlice', () => {
    const initialState = {
        device: null,
        call: null,
        isRinging: false,
        isDialing: false,
        isConnecting: undefined,
        error: null,
        warning: null,
        reconnectAttempts: 0,
    }

    it('should handle setDevice', () => {
        const device = { id: 'device-1' } as any
        const action = setDevice(device)
        const newState = reducer(initialState, action)
        expect(newState.device).toEqual(device)
    })

    it('should handle setCall', () => {
        const call = { id: 'call-1' } as any
        const action = setCall(call)
        const newState = reducer(initialState, action)
        expect(newState.call).toEqual(call)
    })

    it('should handle setIsRinging', () => {
        const isRinging = true
        const action = setIsRinging(isRinging)
        const newState = reducer(initialState, action)
        expect(newState.isRinging).toEqual(isRinging)
    })

    it('should handle setIsDialing', () => {
        const isDialing = true
        const action = setIsDialing(isDialing)
        const newState = reducer(initialState, action)
        expect(newState.isDialing).toEqual(isDialing)
    })

    it('should handle setIsConnecting', () => {
        const isConnecting = true
        const action = setIsConnecting(isConnecting)
        const newState = reducer(initialState, action)
        expect(newState.isConnecting).toEqual(isConnecting)
    })

    it('should handle setError', () => {
        const error = new Error('Something went wrong')
        const action = setError(error)
        const newState = reducer(initialState, action)
        expect(newState.error).toEqual(error)
    })

    it('should handle setWarning', () => {
        const warning = 'Warning message'
        const action = setWarning(warning)
        const newState = reducer(initialState, action)
        expect(newState.warning).toEqual(warning)
    })

    it('should handle setReconnectAttempts', () => {
        const reconnectAttempts = 3
        const action = setReconnectAttempts(reconnectAttempts)
        const newState = reducer(initialState, action)
        expect(newState.reconnectAttempts).toEqual(reconnectAttempts)
    })

    it('should handle incrementReconnectAttempts', () => {
        const action = incrementReconnectAttempts()
        const newState = reducer(initialState, action)
        expect(newState.reconnectAttempts).toEqual(
            initialState.reconnectAttempts + 1,
        )
    })

    it('should handle resetReconnectAttempts', () => {
        const action = resetReconnectAttempts()
        const newState = reducer(initialState, action)
        expect(newState.reconnectAttempts).toEqual(0)
    })
})
