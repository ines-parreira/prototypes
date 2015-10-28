const ticketReducer = (state, action) => {
    let tickets = state.tickets
    switch (action.type) {
        case 'add':
            return {tickets: tickets}
        default:
            return state
    }
}

export default ticketReducer