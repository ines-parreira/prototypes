/* new version notification.
 * shows a notification when a new version is deployed.
 */

import React from 'react'

const NewVersionNotification = () => {
    function reload() {
        window.location.reload()
    }

    return (
        <div className="new-version-notification">
            <a onClick={reload}>
                An update is available for Gorgias. Click here to reload the page and get the latest improvements.
            </a>
        </div>
    )
}

export default NewVersionNotification
