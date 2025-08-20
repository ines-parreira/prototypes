export const KeyPrefixes = {
    // tickets translations (the ticket subject and excerpt) keys have the following shape:
    // ["tickets", "listTicketTranslations", { "queryParams": { "language": "en", "ticket_ids": [1, 2, 3] } }]
    ticketTranslations: ['tickets', 'listTicketTranslations'],
    // ticket message translations (actual ticket messages) keys have the following shape:
    // ["tickets", "listTicketMessageTranslations", { "queryParams": { "language": "en", "ticket_id": 1 } }]
    ticketMessageTranslations: ['tickets', 'listTicketMessageTranslations'],
}
