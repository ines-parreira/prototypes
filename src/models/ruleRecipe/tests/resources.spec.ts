import MockAdapter from 'axios-mock-adapter'

import {emptyRuleRecipeFixture} from '../../../fixtures/ruleRecipe'
import client from '../../api/resources'
import {fetchRuleRecipes} from '../resources'

const mockedServer = new MockAdapter(client)
describe('rule recipes resources', () => {
    describe('fetchRecipes', () => {
        it('should resolve with a recipe list on success', async () => {
            mockedServer
                .onGet('/api/rule-recipes/')
                .reply(200, [emptyRuleRecipeFixture])

            const res = await fetchRuleRecipes()
            expect(res).toStrictEqual([emptyRuleRecipeFixture])
        })

        it('should reject an error on fail', async () => {
            mockedServer
                .onGet('/api/rule-recipes/')
                .reply(503, {message: 'error'})

            return expect(fetchRuleRecipes()).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
