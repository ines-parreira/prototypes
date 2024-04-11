import React from 'react'

export default function SLAFormView({isNew}: {isNew: boolean}) {
    return (
        <div>
            <div>SLA Form</div>
            {isNew && <div>New SLA</div>}
        </div>
    )
}
