import {JobType} from '../models/job/types'

export function buildJobMessage(
    jobType: string,
    allViewItemsSelected: boolean,
    objectType: string,
    changes: Record<string, unknown>,
    changesCount = 0
): string {
    let message = ''
    if (allViewItemsSelected) {
        message += 'All the ' + objectType + ' in this view will be '
    } else {
        //eslint-disable-next-line  @typescript-eslint/restrict-plus-operands
        message += changesCount + ' ' + objectType + ' will be '
    }

    switch (jobType) {
        case JobType.UpdateTicket:
            if ('updates' in changes) {
                if (
                    Object.keys(changes.updates as Record<string, unknown>)
                        .length !== 1
                ) {
                    message += 'updated'
                    message += allViewItemsSelected ? '.' : ' in a few seconds.'
                    return message
                }
                const objectPropertyName = Object.keys(
                    changes.updates as Record<string, string>
                )[0]
                const objectPropertyValue = (
                    changes.updates as Record<string, unknown>
                )[objectPropertyName]
                switch (objectPropertyName) {
                    case 'assignee_user':
                        message += (changes.updates as Record<string, string>)[
                            objectPropertyName
                        ]
                            ? `assigned to ${
                                  (
                                      objectPropertyValue as Record<
                                          string,
                                          string
                                      >
                                  ).name
                              }`
                            : 'unassigned'
                        break
                    case 'status':
                        message += `marked as ${objectPropertyValue as string}`
                        break
                    case 'tags':
                        message +=
                            (objectPropertyValue as string[]).length === 1
                                ? `tagged with the "${
                                      (objectPropertyValue as string[])[0]
                                  }" tag`
                                : `tagged with ${
                                      (objectPropertyValue as string[]).length
                                  } tags`
                        break
                    case 'priority':
                        message += `marked as ${
                            objectPropertyValue as string
                        } priority`
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
        case JobType.ApplyMacro:
            if ('macro_id' in changes) {
                message +=
                    'updated with the macro' +
                    (changes.apply_and_close ? ' and closed' : '')
                message += allViewItemsSelected ? '.' : ' in a few seconds.'
                return message
            }
            break
        case JobType.ExportTicket:
            message +=
                'exported. You will receive the download link via email once the export is done.'
            return message
    }
    message += 'updated'
    message += allViewItemsSelected ? '.' : ' in a few seconds.'
    return message
}
