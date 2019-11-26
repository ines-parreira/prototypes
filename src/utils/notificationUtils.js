

export function buildChangesMessage(allViewItemsSelected: boolean, objectType: string, changes: Object,
    changesCount: number = 0): string {

    let message = ''
    if (allViewItemsSelected) {
        message += 'All the ' + objectType + ' in this view will be '
    } else {
        message += changesCount + ' ' + objectType + ' will be '
    }

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
                message += objectPropertyValue.length === 1
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
    } else if ('macro_id' in changes) {
        message += 'updated with the macro' + (changes.apply_and_close ? ' and closed' : '')
    } else {
        message += 'updated'
    }
    message += allViewItemsSelected ? '.' : ' in a few seconds.'
    return message
}