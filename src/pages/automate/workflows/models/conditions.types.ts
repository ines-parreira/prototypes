export type VarSchema = {
    var: string
}

export type Interval = 'd' | 'h' | 'm' | 'w'

type BaseConditionSchema = {
    equals?: never
    notEqual?: never
    contains?: never
    doesNotContain?: never
    endsWith?: never
    startsWith?: never
    exists?: never
    doesNotExist?: never
    lessThan?: never
    lessThanInterval?: never
    greaterThanInterval?: never
    lessOrEqual?: never
    greaterThan?: never
    greaterOrEqual?: never
}

export type EqualsSchema<
    T extends string | number | boolean = string | number | boolean
> = Omit<BaseConditionSchema, 'equals'> & {
    equals: [VarSchema, T | null]
}

export type NotEqualSchema = Omit<BaseConditionSchema, 'notEqual'> & {
    notEqual: [VarSchema, string | number | boolean | null]
}

export type ContainsSchema = Omit<BaseConditionSchema, 'contains'> & {
    contains: [VarSchema, string | null]
}

export type DoesNotContainSchema = Omit<
    BaseConditionSchema,
    'doesNotContain'
> & {
    doesNotContain: [VarSchema, string | null]
}

export type EndsWithSchema = Omit<BaseConditionSchema, 'endsWith'> & {
    endsWith: [VarSchema, string | null]
}

export type StartsWithSchema = Omit<BaseConditionSchema, 'startsWith'> & {
    startsWith: [VarSchema, string | null]
}

export type ExistsSchema = Omit<BaseConditionSchema, 'exists'> & {
    exists: [VarSchema]
}

export type DoesNotExistSchema = Omit<BaseConditionSchema, 'doesNotExist'> & {
    doesNotExist: [VarSchema]
}

export type LessThanSchema<T extends number | string = number | string> = Omit<
    BaseConditionSchema,
    'lessThan'
> & {
    lessThan: [VarSchema, T | null]
}

export type LessThanInterval = Omit<BaseConditionSchema, 'lessThanInterval'> & {
    lessThanInterval: [VarSchema, `${number}${Interval}` | null]
}

export type GreaterThanInterval = Omit<
    BaseConditionSchema,
    'greaterThanInterval'
> & {
    greaterThanInterval: [VarSchema, `${number}${Interval}` | null]
}

export type LessOrEqualSchema = Omit<BaseConditionSchema, 'lessOrEqual'> & {
    lessOrEqual: [VarSchema, number]
}

export type GreaterThanSchema<T extends number | string = number | string> =
    Omit<BaseConditionSchema, 'greaterThan'> & {
        greaterThan: [VarSchema, T | null]
    }

export type GreaterOrEqualSchema = Omit<
    BaseConditionSchema,
    'greaterOrEqual'
> & {
    greaterOrEqual: [VarSchema, number | null]
}

export type BooleanSchema =
    | EqualsSchema<boolean>
    | ExistsSchema
    | DoesNotExistSchema

export type StringSchema =
    | EqualsSchema<string>
    | NotEqualSchema
    | ContainsSchema
    | DoesNotContainSchema
    | EndsWithSchema
    | StartsWithSchema
    | ExistsSchema
    | DoesNotExistSchema

export type NumberSchema =
    | EqualsSchema<number>
    | NotEqualSchema
    | ExistsSchema
    | DoesNotExistSchema
    | LessThanSchema<number>
    | LessOrEqualSchema
    | GreaterThanSchema<number>
    | GreaterOrEqualSchema

export type DateSchema =
    | ExistsSchema
    | DoesNotExistSchema
    | LessThanSchema<string>
    | GreaterThanSchema<string>
    | LessThanInterval
    | GreaterThanInterval

export type ConditionSchema =
    | EqualsSchema
    | NotEqualSchema
    | ContainsSchema
    | DoesNotContainSchema
    | EndsWithSchema
    | StartsWithSchema
    | ExistsSchema
    | DoesNotExistSchema
    | LessThanSchema
    | LessOrEqualSchema
    | GreaterThanSchema
    | GreaterOrEqualSchema
    | LessThanInterval
    | GreaterThanInterval

export type ConditionKey = keyof ConditionSchema

export type ConditionsSchema =
    | {
          or: ConditionSchema[]
          and?: never
      }
    | {
          and: ConditionSchema[]
          or?: never
      }
