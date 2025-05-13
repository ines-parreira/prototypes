export const store = {
    id: 1,
    name: 'Store Name',
    assignedChannels: {
        emails: [
            {
                id: 1234,
                name: 'Email',
                type: 'email',
                meta: {
                    address: 'mail@email.com',
                },
            },
        ],
        chats: [],
        helpCenters: [],
        contactForms: [],
        whatsApps: [],
        facebooks: [],
        tiktokShops: [],
    },
    unassignedChannels: {
        emails: [],
        chats: [],
        helpCenters: [],
        contactForms: [],
        whatsApps: [],
        facebooks: [],
        tiktokShops: [],
    },
}
