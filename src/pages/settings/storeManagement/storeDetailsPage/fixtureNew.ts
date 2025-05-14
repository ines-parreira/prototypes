export const store = {
    id: 1,
    name: 'Store Name',
    emails: {
        assigned: [
            {
                id: 1234,
                name: 'Email',
                type: 'email',
                meta: {
                    address: 'mail@email.com',
                },
            },
            {
                id: 5,
                name: 'Gmail',
                type: 'email',
                meta: {
                    address: 'mail@gmail.com',
                },
            },
            {
                id: 6,
                name: 'Outlook',
                type: 'email',
                meta: {
                    address: 'mail@outlook.com',
                },
            },
        ],
        unassigned: [
            {
                id: 7,
                name: 'Example Email',
                type: 'email',
                meta: {
                    address: 'mail@email.com',
                },
            },
        ],
    },
    chats: {
        assigned: [],
        unassigned: [],
    },
    helpCenters: {
        assigned: [],
        unassigned: [],
    },
    contactForms: {
        assigned: [],
        unassigned: [],
    },
    whatsApps: {
        assigned: [],
        unassigned: [],
    },
    facebooks: {
        assigned: [],
        unassigned: [],
    },
    tiktokShops: {
        assigned: [],
        unassigned: [],
    },
}
