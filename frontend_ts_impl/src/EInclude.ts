
/** t => [t.A.B.C, t.C] // data --> [[A, B, C], [C]] */
export type DInclude = (string | DInclude)[]

export function newEInclude<T>(includesKey: DInclude) {}


export interface HasInclude<T = {}> {
    "~include": T
}
export type EntityKey<T> = Exclude<keyof T, keyof HasInclude>

export type EIncludeFn<T, TInclude>
    = T extends infer T extends HasInclude
    ? (e: EInclude<T>) => EInclude<T, TInclude>
    : (e: {}) => never

export type EInclude<TEntity extends HasInclude, TKeys = [], TWith = {}> = {
    [K in EIncludeObjKey<TEntity["~include"], TKeys>]-?:
    EInclude<TEntity, Tup.Add<TKeys, K>, Arr.Element<TEntity["~include"][K]>>
} & {
    with$<TInc2>(_: EIncludeFn<TWith, TInc2>): EInclude<TEntity, SetWithKey<TKeys, TInc2>>
}

type EIncludeObjKey<T, TKeys> = Exclude<keyof T, WithObjKey<Arr.Element<TKeys>>>

type WithObjKey<TKey> = TKey extends object ? keyof TKey : TKey

// 把最后一个 key 修改为 { [key]: EIncludeNext3 }
// TInclude:    ["A", "B"]
// TInc2:       ["B1", "B2"]
// SetWithKey:  ["A", { "B": ["B1", "B2"] } ]
type SetWithKey<TKeys, TInclude> =
    Tup.SetLast<TKeys, { [_ in Tup.Last<TKeys> & string]: TInclude }>



{
    type WithKeys<S extends string, Keys>
        = S extends `${infer S1}.${infer Rest}`
        ? [S1, ...WithKeys<Rest, Keys>]
        : [{ [_ in S]: ParseInclude<Keys> }]

    type ParseInc1 = ParseInclude<"user.post(comment.tag).tag">

    type ParseInclude<S>
        = S extends `${infer S1}(${infer Inc2})${infer Rest}`
        ? [...WithKeys<S1, Inc2>, ...ParseInclude<Str.Trim<Rest, ".">>]
        : S extends `${infer S1}.${infer Rest}`
        ? [S1, ...ParseInclude<Rest>]
        : [S]

}



