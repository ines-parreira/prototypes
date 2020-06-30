//@flow
import {
    APPLY_MACRO_JOB_TYPE,
    EXPORT_TICKET_JOB_TYPE,
    UPDATE_TICKET_JOB_TYPE,
} from '../constants/job'

export function buildJobMessage(
    jobType: string,
    allViewItemsSelected: boolean,
    objectType: string,
    changes: Object,
    changesCount: number = 0
): string {
    let message = ''
    if (allViewItemsSelected) {
        message += 'All the ' + objectType + ' in this view will be '
    } else {
        message += changesCount + ' ' + objectType + ' will be '
    }

    switch (jobType) {
        case UPDATE_TICKET_JOB_TYPE:
            if ('updates' in changes) {
                if (Object.keys(changes.updates).length !== 1) {
                    message += 'updated'
                    message += allViewItemsSelected ? '.' : ' in a few seconds.'
                    return message
                }
                const objectPropertyName = Object.keys(changes.updates)[0]
                const objectPropertyValue = changes.updates[objectPropertyName]
                switch (objectPropertyName) {
                    case 'assignee_user':
                        message += changes.updates[objectPropertyName]
                            ? `assigned to ${objectPropertyValue.name}`
                            : 'unassigned'
                        break
                    case 'status':
                        message += `marked as ${objectPropertyValue}`
                        break
                    case 'tags':
                        message +=
                            objectPropertyValue.length === 1
                                ? `tagged with the "${objectPropertyValue[0]}" tag`
                                : `tagged with ${objectPropertyValue.length} tags`
                        break
                    case 'priority':
                        message += `marked as ${objectPropertyValue} priority`
                        break
                    case 'trashed_datetime':
                        message += objectPropertyValue
                            ? 'moved to the trash'
                            : 'un-trashed'
                        break
                    default:
                        message += 'updated'
                        break
                }
                message += allViewItemsSelected ? '.' : ' in a few seconds.'
                return message
            }
            break
        case APPLY_MACRO_JOB_TYPE:
            if ('macro_id' in changes) {
                message +=
                    'updated with the macro' +
                    (changes.apply_and_close ? ' and closed' : '')
                message += allViewItemsSelected ? '.' : ' in a few seconds.'
                return message
            }
            break
        case EXPORT_TICKET_JOB_TYPE:
            message +=
                'exported. You will receive the download link via email once the export is done.'
            return message
    }
    message += 'updated'
    message += allViewItemsSelected ? '.' : ' in a few seconds.'
    return message
}
