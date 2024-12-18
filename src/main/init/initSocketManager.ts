import socketManager from 'services/socketManager'

import joinEvents from './socketEvents/joinEvents'
import receivedEvents from './socketEvents/receivedEvents'
import sendEvents from './socketEvents/sendEvents'

socketManager.registerJoinEvents(joinEvents)
socketManager.registerReceivedEvents(receivedEvents)
socketManager.registerSendEvents(sendEvents)
