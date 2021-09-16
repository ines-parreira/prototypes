import {HelpCenterLocale} from '../../../../models/helpCenter/types'

import enUs from '../../../../../img/flags/en-us.svg'
import frFr from '../../../../../img/flags/fr-fr.svg'
import frCa from '../../../../../img/flags/fr-ca.svg'
import csCz from '../../../../../img/flags/cs-cz.svg'
import daDk from '../../../../../img/flags/da-dk.svg'
import nlNl from '../../../../../img/flags/nl-nl.svg'
import deDe from '../../../../../img/flags/de-de.svg'
import itIt from '../../../../../img/flags/it-it.svg'
import noNo from '../../../../../img/flags/no-no.svg'
import esEs from '../../../../../img/flags/es-es.svg'
import svSe from '../../../../../img/flags/sv-se.svg'

// TODO: create ENUM from FLAGS somewhere in a shared folder
const FLAGS: {[key: string]: string} = {
    'en-us': enUs,
    'fr-fr': frFr,
    'fr-ca': frCa,
    'cs-cz': csCz,
    'da-dk': daDk,
    'nl-nl': nlNl,
    'de-de': deDe,
    'it-it': itIt,
    'no-no': noNo,
    'es-es': esEs,
    'sv-se': svSe,
}

export function getEmojiFlag(code: string): string {
    return FLAGS[code.toLowerCase()] || ''
}

export function moveLocaleToFront(
    list: HelpCenterLocale[],
    defaultLocale: HelpCenterLocale
): HelpCenterLocale[] {
    return [
        defaultLocale,
        ...list.filter((locale) => locale.code !== defaultLocale.code),
    ]
}

export function moveLocaleToBack(
    list: HelpCenterLocale[],
    defaultLocale: HelpCenterLocale
): HelpCenterLocale[] {
    return [
        ...list.filter((locale) => locale.code !== defaultLocale.code),
        defaultLocale,
    ]
}
