import enUs from 'assets/img/flags/en-us.svg'
import frFr from 'assets/img/flags/fr-fr.svg'
import frCa from 'assets/img/flags/fr-ca.svg'
import csCz from 'assets/img/flags/cs-cz.svg'
import daDk from 'assets/img/flags/da-dk.svg'
import nlNl from 'assets/img/flags/nl-nl.svg'
import deDe from 'assets/img/flags/de-de.svg'
import itIt from 'assets/img/flags/it-it.svg'
import noNo from 'assets/img/flags/no-no.svg'
import esEs from 'assets/img/flags/es-es.svg'
import svSe from 'assets/img/flags/sv-se.svg'

import {Locale} from '../../../../models/helpCenter/types'

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
    list: Locale[],
    defaultLocale: Locale
): Locale[] {
    return [
        defaultLocale,
        ...list.filter((locale) => locale.code !== defaultLocale.code),
    ]
}

export function moveLocaleToBack(
    list: Locale[],
    defaultLocale: Locale
): Locale[] {
    return [
        ...list.filter((locale) => locale.code !== defaultLocale.code),
        defaultLocale,
    ]
}
