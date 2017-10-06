// @flow
import elasticlunr from 'elasticlunr'

import type {Map} from 'immutable'
type searchConfigType = {
    fields: {
        name: {boost: number},
        tags: {boost: number},
        body: {boost: number}
    },
    expand: boolean
}
type macroType = {
    id: string,
    name: string,
    actions: Array<{
        name: string,
        arguments: {
            tags: string,
            body_text: string
        }
    }>
}
type macro2docType = {
    id: string,
    name: string,
    tags: string,
    body: string
}

// We're clearing the stop words because there are many with stopwords in them
elasticlunr.clearStopWords()

const _initIndex = () => elasticlunr(function () {
    this.setRef('id')
    this.addField('name')
    this.addField('tags')
    this.addField('body')

    // We remove the stemmer because we want any substring of a word to match the word
    // ex: we want `dyi` to match `dying`, which is stemmed to `dy` when using the stemmer
    this.pipeline.remove(elasticlunr.stemmer)
})

export let index = _initIndex()

const defaultSearchConfig = {
    fields: {
        name: {boost: 4},
        tags: {boost: 2},
        body: {boost: 1}
    },
    expand: true
}

/**
 * Given a macro transform it into a searchable document
 *
 * @param macro
 * @returns {{id, name, tags: Array, body: string}}
 * @private
 */
const _macro2doc = (macro: macroType): macro2docType => {
    const tags = []
    const doc = {
        id: macro.id,
        name: macro.name,
        tags: '',
        body: ''
    }

    if (macro.actions) {
        macro.actions.forEach((action) => {
            switch (action.name) {
                case 'addTags':
                    tags.push(action.arguments.tags)
                    break
                case 'setResponseText':
                    doc.body = action.arguments.body_text
                    break
            }
        })
    }

    doc.tags = tags.join(', ')
    return doc
}

/**
 * A simple search wrapper with a default config for searching macros
 *
 * @param query - search query
 * @param config - query time config
 * @returns {*} - an array of macro ids ordered by rank (TF-IDF)
 */
export const search = (query: string, config: searchConfigType = defaultSearchConfig)  => {
    const hits = index.search(query, config).map((hit) => hit.ref)
    // TODO(@xarg): remove this condition below when this bug on Safari is fixed:
    // https://github.com/weixsong/elasticlunr.js/issues/58
    // On safari (for some queries, ex: `a`) the search returns an array like ["0", "1", ...]
    // since we can't have "0" ids we're just checking if it's present in the array and return an empty array instead
    if (hits.includes('0')) {
        return []
    }
    return hits
}

/**
 * Populate the index with macro documents
 *
 * @param macros - macros that we need to populate the index with
 * @param reset - reset the index and populate again
 */
export const populate = (macros: Map<*,*>, reset: boolean = false) => {
    if (reset) {
        index = _initIndex()
    } else if (index.documentStore.length > 0) {
        // only populate if empty
        return
    }

    macros.toJS().forEach((macro) => {
        index.addDoc(_macro2doc(macro))
    })
}

/**
 * Add a macro from the index
 *
 * @param macro
 */
export const add = (macro: macroType) => index.addDoc(_macro2doc(macro))

/**
 * Update a macro from the index
 *
 * @param macro
 */
export const update = (macro: macroType) => index.updateDoc(_macro2doc(macro))

/**
 * Remove a macro from the index
 *
 * @param macro
 */
export const remove = (macro: macroType) => index.removeDoc(_macro2doc(macro))
