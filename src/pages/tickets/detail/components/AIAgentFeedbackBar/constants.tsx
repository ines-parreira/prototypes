import React from 'react'

export const RESOURCE_ICONS: Record<string, JSX.Element> = {
    Actions: <i className="material-icons">play_circle</i>,
    'Help Center articles': <i className="material-icons">article</i>,
    Macros: <i className="material-icons">article</i>,
    'External websites': <i className="material-icons">article</i>,
    Guidance: <i className="material-icons">map</i>,
}

export const RESOURCE_LABELS: Record<string, string> = {
    action: 'Actions::',
    guidance: 'Guidance::',
    article: 'Knowledge::Help Center articles::',
    external_snippet: 'Knowledge::External websites::',
    macro: 'Knowledge::Macros::',
}

export const QA_FAILED_MESSAGE =
    "didn't respond to this message because it wasn't confident in the response it generated"

export const DATE_FEATURE_AVAILABLE = new Date(
    '2024-06-12 13:51:15.357000+00:00'
)
