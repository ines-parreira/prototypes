export enum GorgiasUIEnv {
    Production = 'production',
    Staging = 'staging',
    Development = 'development',
}

const HELPCENTER_PRIVATE_BETA_LIST = [
    'self-serve.gorgias.com',
    'test-martin.gorgias.com',
    'internal-help-center-api.gorgias.com',
    'acme.gorgias.docker',
    'acme.gorgias.xyz',
    'acme.gorgias.help',
    'artemisathletix.gorgias.com',
    'sfbicycles.gorgias.com',
    'gorgias.gorgias.com',
    '47brandcanada.gorgias.com',
    'petzyo.gorgias.com',
    'sateam.gorgias.com',
    'shefit.gorgias.com',
    'criquetshirts.gorgias.com',
    'oneblade.gorgias.com',
    'lesminimondes.gorgias.com',
    'truebotanicals.gorgias.com',
    'loopearplugs.gorgias.com',
    're4m.gorgias.com',
    'wave.gorgias.com',
    'yoto.gorgias.com',
    'jamiesonvitamins.gorgias.com',
    'brandbuildr.gorgias.com',
    'bagallerydeals.gorgias.com',
    'apolloscooters.gorgias.com',
    'asphalte.gorgias.com',
    'franklinpetfood.gorgias.com',
    'esprovisions.gorgias.com',
    'cozyearth.gorgias.com',
    'season.gorgias.com',
    '4patriots.gorgias.com',
    'badbirdie.gorgias.com',
    'decathlon-usa.gorgias.com',
    'bravafabrics-dev.gorgias.com',
    'daysoft.gorgias.com',
    'getkion.gorgias.com',
    'balanceathletica.gorgias.com',
    'kitsch.gorgias.com',
    'oryzalab.gorgias.com',
    'pepperhome.gorgias.com',
    '28culture.gorgias.com',
    'branchfurniture.gorgias.com',
    'silkandsonder.gorgias.com',
    'abstractocean.gorgias.com',
    'glorious.gorgias.com',
    'breadsrsly.gorgias.com',
    'revivalcycles.gorgias.com',
    'elatecosmetics.gorgias.com',
    'rokform.gorgias.com',
    'equilife.gorgias.com',
    'battlbox.gorgias.com',
    'realketones.gorgias.com',
    'thecozyhomeco.gorgias.com',
    'corneliajames.gorgias.com',
    'levelusa.gorgias.com',
    'tenthousandcx.gorgias.com',
    'b2cresponse.gorgias.com',
    'supergoop.gorgias.com',
    'ketokrate.gorgias.com',
    'luminaid.gorgias.com',
    'franklinpetfood.gorgias.com',
    'chameleonbrands.gorgias.com',
    'pier1.gorgias.com',
    'truebrands.gorgias.com',
    'iliabeauty.gorgias.com',
    'trueclassictees.gorgias.com',
    'fountleather.gorgias.com',
    'eeboo.gorgias.com',
    'dremil.gorgias.com',
    'jamiesonvitamins.gorgias.com',
    'enjoyflowers.gorgias.com',
    'protalus.gorgias.com',
    'thegroomsmansuit.gorgias.com',
    'lumedeodorant.gorgias.com',
    'tinshack.gorgias.com',
    '4x400.gorgias.com',
    'reshoevn8r.gorgias.com',
    're4m.gorgias.com',
    'thegroomsmansuit.gorgias.com',
    'joellecollection.gorgias.com',
    'silkandsonder.gorgias.com',
    'bartesianhelpdesk.gorgias.com',
    'makemybellyfit.gorgias.com',
    'cyclop.gorgias.com',
    'pilgrim.gorgias.com',
    'hofstrawagner.gorgias.com',
    'rumpl.gorgias.com',
    'tufttheworldsupport.gorgias.com',
    'thecookingguild.gorgias.com',
    '900personalcare.gorgias.com',
    'wearejetson.gorgias.com',
    'ursamajorvt.gorgias.com',
    'facetheory.gorgias.com',
    'smilodox.gorgias.com',
    'tesbros.gorgias.com',
    'sfbicycle.gorgias.com',
    'getkion.gorgias.com',
    'battlbox.gorgias.com',
    'nanoleaf.gorgias.com',
    'test-martin-3.gorgias.com',
    'testmartin.gorgias.com',
    'test-martin.gorgias.com',
    'getmr.gorgias.com',
    'hello-nomad.gorgias.com',
    'abstractocean.gorgias.com',
]

export function getEnvironment(): GorgiasUIEnv {
    if (window.STAGING) {
        return GorgiasUIEnv.Staging
    }
    if (window.PRODUCTION) {
        return GorgiasUIEnv.Production
    }
    return GorgiasUIEnv.Development
}

export function isProduction(): boolean {
    return getEnvironment() === GorgiasUIEnv.Production
}

export function isStaging(): boolean {
    return getEnvironment() === GorgiasUIEnv.Staging
}

export function isDevelopment(): boolean {
    return getEnvironment() === GorgiasUIEnv.Development
}

export function isHelpCenterEnabled(): boolean {
    return HELPCENTER_PRIVATE_BETA_LIST.includes(location.host)
}
