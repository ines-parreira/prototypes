import useTicketPartials from './useTicketPartials'

export default function useTickets(viewId: number) {
    const {partials} = useTicketPartials(viewId)

    return partials
}
