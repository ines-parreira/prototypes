import {
    archiveCustomField,
    unArchiveCustomField,
} from 'models/customField/resources'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {StoreDispatch} from 'state/types'

export async function handleArchivingCustomField(
    id: number,
    archive: boolean,
    dispatch: StoreDispatch
) {
    try {
        if (archive) {
            await archiveCustomField(id)
        } else {
            await unArchiveCustomField(id)
        }
        void dispatch(
            notify({
                message: `Ticket field successfully ${
                    archive ? 'archived' : 'unarchived'
                }.`,
                status: NotificationStatus.Success,
            })
        )
    } catch (error) {
        void dispatch(
            notify({
                message: `Failed to ${
                    archive ? 'archive' : 'unarchive'
                } ticket field.`,
                status: NotificationStatus.Error,
            })
        )
    }
}
