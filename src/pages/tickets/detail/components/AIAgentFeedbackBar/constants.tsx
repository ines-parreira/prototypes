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
