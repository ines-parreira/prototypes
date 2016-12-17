import {NOTIFICATION_UIDS as UIDS} from '../config'

export const usageMaxLimitReachedModal = (freeTickets) => ({
    style: 'modal',
    dismissible: true,
    title: 'Free limit reached',
    message: `You've used your ${freeTickets} free tickets this month. To keep responding to customers,
                    you need a add a credit card.`,
    buttons: [{
        name: 'ADD CREDIT CARD',
        color: 'green'
    }]
})

export const accountDeactivatedModal = {
    style: 'modal',
    title: 'Account deactivated',
    message: `Your account has been deactivated due to multiple payment failures. 
                    To re-activate your account, please update your credit card.`,
    buttons: [{
        name: 'UPDATE CREDIT CARD',
        color: 'green'
    }]
}

export const accountDeactivatedBanner = {
    uid: UIDS.accountDeactivated,
    style: 'banner',
    type: 'error',
    dismissible: false,
    message: `Your account has been deactivated due to multiple payment failures. 
                    To re-activate your account, please update your credit card <a>here</a>.`
}

export const accountDeactivatedCardUpdatedBanner = {
    uid: UIDS.accountDeactivatedCardUpdated,
    style: 'banner',
    type: 'info',
    dismissible: true,
    message: 'We are attempting to pay invoices with your new card. Your account is now active.'
}


export const usageMinLimitReachedBanner = (freeTickets) => ({
    uid: UIDS.freeMinLimitReached,
    style: 'banner',
    level: 'warning',
    dismissible: false,
    message: `You're getting close to the ${freeTickets} free tickets limit. Add a credit card <a>here</a> to keep responding to customers.`
})

export const usageDefaultLimitReachedBanner = (freeTickets) => ({
    uid: UIDS.freeDefaultLimitReached,
    style: 'banner',
    level: 'error',
    dismissible: false,
    message: `You've reached the ${freeTickets} free tickets limit. Add a credit card <a>here</a> to keep responding to customers.`
})
