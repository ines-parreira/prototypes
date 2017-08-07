import elasticlunr from 'elasticlunr'

// We're clearing the stop words because there are many with stopwords in them
elasticlunr.clearStopWords()

const _initIndex = () => elasticlunr(function () {
    this.setRef('id')
    this.addField('name')
    this.addField('tags')
    this.addField('body')
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
const _macro2doc = (macro) => {
    const doc = {
        id: macro.id,
        name: macro.name,
        tags: [],
        body: ''
    }

    if (macro.actions) {
        macro.actions.forEach((action) => {
            switch (action.name) {
                case 'addTags':
                    doc.tags.push(action.arguments.tags)
                    break
                case 'setResponseText':
                    doc.body = action.arguments.body_text
                    break
            }
        })
    }

    doc.tags = doc.tags.join(', ')
    return doc
}

/**
 * A simple search wrapper with a default config for searching macros
 *
 * @param query - search query
 * @param config - query time config
 * @returns {*} - an array of macro ids ordered by rank (TF-IDF)
 */
export const search = (query, config = defaultSearchConfig) => {
    const hits = index.search(query, config)
    return hits.map((hit) => hit.ref)
}

/**
 * Populate the index with macro documents
 *
 * @param macros - macros that we need to populate the index with
 * @param reset - reset the index and populate again
 */
export const populate = (macros, reset = false) => {
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
export const add = (macro) => index.addDoc(_macro2doc(macro))

/**
 * Update a macro from the index
 *
 * @param macro
 */
export const update = (macro) => index.updateDoc(_macro2doc(macro))

/**
 * Remove a macro from the index
 *
 * @param macro
 */
export const remove = (macro) => index.removeDoc(_macro2doc(macro))
