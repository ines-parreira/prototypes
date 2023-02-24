import moment from 'moment'

import graphicTShirt from 'assets/img/self-service/graphic-t-shirt.png'
import chainBracelet from 'assets/img/self-service/chain-bracelet.png'

export const SELF_SERVICE_PREVIEW_ROUTES = {
    HOME: '/',
    QUICK_RESPONSE: '/quick-response',
    ORDERS: '/orders',
    TRACK: '/track',
    CANCEL: '/cancel',
}

export const ETA_DATE = moment([2022, 11, 18, 9])
export const ORDER_PLACED_DATE = moment([2022, 11, 15, 22, 2])
export const INFO_RECEIVED_DATE = moment([2022, 11, 16, 8, 36])
export const IN_TRANSIT_DATE = moment([2022, 11, 17, 16, 55])

export const LINE_ITEMS = [
    {src: graphicTShirt, name: 'Graphic T-Shirt'},
    {src: chainBracelet, name: 'Chain Bracelet'},
]
