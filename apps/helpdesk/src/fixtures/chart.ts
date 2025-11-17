import moment from 'moment-timezone'

import type {
    OneDimensionalDataItem,
    TwoDimensionalDataItem,
} from 'domains/reporting/pages/types'

export const ticketsCreatedDataItem: TwoDimensionalDataItem = {
    label: 'Tickets created',
    values: [
        { x: moment('12/31/2022', 'MM/DD/YYYY').format('MMM DD'), y: 51000000 },
        { x: moment('01/01/2023', 'MM/DD/YYYY').format('MMM DD'), y: 51000000 },
        { x: moment('01/02/2023', 'MM/DD/YYYY').format('MMM DD'), y: 45000000 },
        { x: moment('01/03/2023', 'MM/DD/YYYY').format('MMM DD'), y: 51000000 },
        { x: moment('01/04/2023', 'MM/DD/YYYY').format('MMM DD'), y: 45000000 },
        { x: moment('01/05/2023', 'MM/DD/YYYY').format('MMM DD'), y: 35000000 },
        { x: moment('01/06/2023', 'MM/DD/YYYY').format('MMM DD'), y: 35000000 },
        { x: moment('01/07/2023', 'MM/DD/YYYY').format('MMM DD'), y: 30000000 },
        { x: moment('01/08/2023', 'MM/DD/YYYY').format('MMM DD'), y: 30000000 },
        { x: moment('01/09/2023', 'MM/DD/YYYY').format('MMM DD'), y: 30000000 },
        { x: moment('01/10/2023', 'MM/DD/YYYY').format('MMM DD'), y: 30000000 },
        { x: moment('01/11/2023', 'MM/DD/YYYY').format('MMM DD'), y: 35000000 },
        { x: moment('01/12/2023', 'MM/DD/YYYY').format('MMM DD'), y: 35000000 },
        { x: moment('01/13/2023', 'MM/DD/YYYY').format('MMM DD'), y: 40000000 },
        { x: moment('01/14/2023', 'MM/DD/YYYY').format('MMM DD'), y: 35000000 },
        { x: moment('01/15/2023', 'MM/DD/YYYY').format('MMM DD'), y: 35000000 },
        { x: moment('01/16/2023', 'MM/DD/YYYY').format('MMM DD'), y: 35000000 },
        { x: moment('01/17/2023', 'MM/DD/YYYY').format('MMM DD'), y: 40000000 },
        { x: moment('01/18/2023', 'MM/DD/YYYY').format('MMM DD'), y: 30000000 },
        { x: moment('01/19/2023', 'MM/DD/YYYY').format('MMM DD'), y: 35000000 },
        { x: moment('01/20/2023', 'MM/DD/YYYY').format('MMM DD'), y: 35000000 },
        { x: moment('01/21/2023', 'MM/DD/YYYY').format('MMM DD'), y: 35000000 },
        { x: moment('01/22/2023', 'MM/DD/YYYY').format('MMM DD'), y: 25000000 },
        { x: moment('01/23/2023', 'MM/DD/YYYY').format('MMM DD'), y: 30000000 },
        { x: moment('01/24/2023', 'MM/DD/YYYY').format('MMM DD'), y: 25000000 },
        { x: moment('01/25/2023', 'MM/DD/YYYY').format('MMM DD'), y: 30000000 },
        { x: moment('01/26/2023', 'MM/DD/YYYY').format('MMM DD'), y: 30000000 },
        { x: moment('01/27/2023', 'MM/DD/YYYY').format('MMM DD'), y: 25000000 },
        { x: moment('01/28/2023', 'MM/DD/YYYY').format('MMM DD'), y: 23000000 },
        { x: moment('01/29/2023', 'MM/DD/YYYY').format('MMM DD'), y: 20000000 },
        { x: moment('01/30/2023', 'MM/DD/YYYY').format('MMM DD'), y: 25000000 },
        { x: moment('01/31/2023', 'MM/DD/YYYY').format('MMM DD'), y: 20000000 },
    ],
}

export const ticketsClosedDataItem: TwoDimensionalDataItem = {
    label: 'Tickets closed',
    values: ticketsCreatedDataItem.values.map((item) => ({
        ...item,
        y: item.y - 10000000,
    })),
}

export const ChatWorkload: OneDimensionalDataItem = {
    label: 'Chat',
    value: 10000,
}

export const EmailWorkload: OneDimensionalDataItem = {
    label: 'Email',
    value: 4000,
}

export const InstagramWorkload: OneDimensionalDataItem = {
    label: 'Instagram DM',
    value: 2000,
}

export const PhoneWorkload: OneDimensionalDataItem = {
    label: 'Phone',
    value: 6000,
}

export const OthersWorkload: OneDimensionalDataItem = {
    label: 'Others',
    value: 8000,
}
