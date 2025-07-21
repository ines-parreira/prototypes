import { Call, Device } from '@twilio/voice-sdk'

export type VoiceDeviceActions = {
    setDevice: (device: Device | null) => void
    setCall: (call: Call | null) => void
    setIsRinging: (isRinging: boolean) => void
    setIsDialing: (isDialing: boolean) => void
    setIsConnecting: (isConnecting?: boolean) => void
    setError: (error: Error | null) => void
    setWarning: (warning: string | null) => void
    incrementReconnectAttempts: () => void
    resetReconnectAttempts: () => void
}
