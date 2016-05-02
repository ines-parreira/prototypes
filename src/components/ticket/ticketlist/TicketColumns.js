import { CELL_WIDTH } from '../../../constants'
import Immutable from 'immutable'

export default Immutable.fromJS([
    /* {
        name: 'priority',
        width: 1 * CELL_WIDTH,
        header: 'Priority',
        sortable: true
    },*/
    {
        name: 'status',
        width: 2 * CELL_WIDTH,
        header: 'Status',
        sortable: false
    },
    {
        name: 'details',
        width: 6 * CELL_WIDTH,
        header: 'Ticket Details',
        sortable: false
    },
    {
        name: 'requester',
        width: 3 * CELL_WIDTH,
        header: 'Requester',
        sortable: false
    },
    {
        name: 'created',
        width: 2 * CELL_WIDTH,
        header: 'Created',
        sortable: true
    },
    {
        name: 'updated',
        width: 2 * CELL_WIDTH,
        header: 'Updated',
        sortable: true
    },
    {
        name: 'assignee',
        width: 3 * CELL_WIDTH,
        header: 'Assignee',
        sortable: false
    },
    {
        name: 'tags',
        width: 3 * CELL_WIDTH,
        header: 'Tags',
        sortable: false
    },
    {
        name: 'channel',
        width: 2 * CELL_WIDTH,
        header: 'Channel',
        sortable: true
    },
])
