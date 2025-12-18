import noop from 'lodash/noop'

import { useChannel } from '@gorgias/realtime-ably'

import { isRealtimeEnabledOnCluster } from '../utils/isRealtimeEnabledOnCluster'

export const useAblyChannel = isRealtimeEnabledOnCluster ? useChannel : noop
