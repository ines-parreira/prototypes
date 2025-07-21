import { createContext } from 'react'

import { State } from 'state/twilio/voiceDevice'

import { VoiceDeviceActions } from './types'

export type VoiceDeviceContextState = State & { actions: VoiceDeviceActions }

export const Context = createContext<VoiceDeviceContextState | null>(null)
