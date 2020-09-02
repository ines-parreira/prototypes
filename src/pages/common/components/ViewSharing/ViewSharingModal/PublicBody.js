// @flow

import React from 'react'

export default function PublicBody() {
    return (
        <div className="m-3">
            <p>
                <b>Everyone can access this view.</b>
                <br />
                Only lead agents and admins can edit it.
            </p>
        </div>
    )
}
