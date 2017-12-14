export const billingState = {
    paymentMethod: 'stripe',
    plans: {
        free: {
            amount: 0,
            cost_per_ticket: 0,
            currency: 'usd',
            free_tickets: 9999999999,
            integrations: 15,
            interval: 'month',
            limits: {
                'default': 9999999999,
                max: 9999999999,
                min: 9999999999
            },
            name: 'Free Plan'
        },
        'growth-usd-1': {
            cost_per_ticket: 0.045,
            interval: 'month',
            'public': true,
            name: 'Growth Plan',
            trial_period_days: 14,
            order: 3,
            currency: 'usd',
            free_tickets: 10000,
            limits: {
                'default': 300,
                max: 400,
                min: 200
            },
            amount: 50000,
            integrations: 15
        },
        'helpdesk-monthly-beta': {
            amount: 0,
            cost_per_ticket: 0,
            currency: 'usd',
            free_tickets: 9999999999,
            integrations: 15,
            interval: 'month',
            limits: {
                'default': 9999999999,
                max: 9999999999,
                min: 9999999999
            },
            name: 'Helpdesk Monthly'
        },
        'standard-1': {
            amount: 0,
            cost_per_ticket: 0.05,
            currency: 'usd',
            free_tickets: 300,
            integrations: 15,
            interval: 'month',
            limits: {
                'default': 300,
                max: 400,
                min: 200
            },
            name: 'Pay as you go Plan'
        },
        'standard-usd-1': {
            cost_per_ticket: 0.06,
            interval: 'month',
            'public': true,
            name: 'Standard Plan',
            trial_period_days: 14,
            order: 1,
            currency: 'usd',
            free_tickets: 600,
            limits: {
                'default': 300,
                max: 400,
                min: 200
            },
            amount: 3000,
            integrations: 5
        },
        'team-usd-1': {
            cost_per_ticket: 0.05,
            interval: 'month',
            'public': true,
            name: 'Team Plan',
            trial_period_days: 14,
            order: 2,
            currency: 'usd',
            free_tickets: 2000,
            limits: {
                'default': 300,
                max: 400,
                min: 200
            },
            amount: 10000,
            integrations: 10
        }
    },
    currentUsage: {
        data: {
            cost: 0,
            tickets: 2,
            extra_tickets: 0
        },
        meta: {
            start_datetime: '2017-08-22T00:46:32+00:00',
            end_datetime: '2017-09-05T00:46:32+00:00'
        }
    },
    invoices: [{
        metadata: {},
        paid: true,
        attempted: true,
        date: '2016-11-13T18:30:19+00:00',
        amount_due: 1234
    }, {
        metadata: {},
        paid: true,
        date: '2016-11-14T18:30:19+00:00',
        amount_due: 1234
    }, {
        metadata: {},
        paid: false,
        attempted: true,
        date: '2016-11-15T18:30:19+00:00',
        amount_due: 0
    }],
    creditCard: {
        name: 'Alex',
        number: '545454545454',
        expDate: '10/23',
        cvc: '123',
    }
}
