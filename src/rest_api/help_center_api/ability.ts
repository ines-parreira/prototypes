import {Ability, AbilityClass, RawRuleOf} from '@casl/ability'

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'
type Subjects = 'HelpCenterEntity' | 'CategoryEntity' | 'ArticleEntity' | 'all' // FIXME: use the help center types

export type AppAbility = Ability<[Actions, Subjects]>
export const AppAbility = Ability as AbilityClass<AppAbility>
export type AbilityRules = RawRuleOf<AppAbility>[]

export function createAbility(rules: AbilityRules = []) {
    const ability = new AppAbility()
    ability.can = ability.can.bind(ability)

    /**
     * Explicitly forbid the usage of "cannot" as this would be a nightmare to properly mock a mix of can and cannot use in the tests
     */
    ability.cannot = () => {
        throw new Error('Do not use the "cannot" helper, use "can" instead')
    }

    ability.update(rules)
    return ability
}
