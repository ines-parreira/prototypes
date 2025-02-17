import csCz from 'assets/img/flags/cs-cz.svg'
import daDk from 'assets/img/flags/da-dk.svg'
import deDe from 'assets/img/flags/de-de.svg'
import enGb from 'assets/img/flags/en-gb.svg'
import enUs from 'assets/img/flags/en-us.svg'
import esEs from 'assets/img/flags/es-es.svg'
import fiFi from 'assets/img/flags/fi-fi.svg'
import frCa from 'assets/img/flags/fr-ca.svg'
import frFr from 'assets/img/flags/fr-fr.svg'
import itIt from 'assets/img/flags/it-it.svg'
import jaJp from 'assets/img/flags/ja-jp.svg'
import nlNl from 'assets/img/flags/nl-nl.svg'
import noNo from 'assets/img/flags/no-no.svg'
import ptBr from 'assets/img/flags/pt-br.svg'
import svSe from 'assets/img/flags/sv-se.svg'

import {Locale} from 'models/helpCenter/types'

const flagsMap: {[key: string]: string} = {
    cz: 'cs-cz',
    da: 'da-dk',
    nl: 'nl-nl',
    de: 'de-de',
    it: 'it-it',
    no: 'no-no',
    es: 'es-es',
    sv: 'sv-se',
    en: 'en-us',
    fr: 'fr-fr',
    pt: 'pt-br',
    fi: 'fi-fi',
    ja: 'ja-jp',
}

// TODO: create ENUM from FLAGS somewhere in a shared folder
const FLAGS: {[key: string]: string} = {
    'en-us': enUs,
    'en-gb': enGb,
    'fi-fi': fiFi,
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
    'pt-br': ptBr,
    'ja-jp': jaJp,
}

export function getEmojiFlag(code: string): string {
    const flag = code.toLowerCase()

    if (!!flagsMap[flag]) {
        return FLAGS[flagsMap[flag]] || ''
    }

    return FLAGS[flag] || ''
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
