import { IsIId } from "./Id"

export type ESelectFn<T, TSelect>
    = (e: ESelect<T>) => ESelect<T, TSelect>

export type ESelect<T, Key = never> = {
    /** vscode go to definition not work */
    // [K in Exclude<keyof T, Key>]-?:
    [K in keyof T]-?: T[K] extends infer V

    ? IsIId<V> extends true ? ESelect<T, Key | K>
    : V extends Date ? ESelect<T, Key | K>
    : V extends (infer V extends object) | ArrayLike<infer V>
    ? (<WithKey>(s?: ESelectFn<V, WithKey>) => ESelect<T, Key | [K, WithKey]>) & NoFnProp
    : ESelect<T, Key | K> : never
}

export const getSelectData = (pxy: ESelect<_>): DSelect2 => pxy[sym_data as never]

const sym_data = Symbol("DSelect")
export function newESelect<T = _>(i = 1): ESelect<T> {
    const data: DSelect2 = { i, columns: [], with: [] }
    let with_i = 0;
    throw "todo"
}

// [ post: [id, titel, content,
//     [ tags: [] ],
//     [ comment: [id, user_id, content ] ]
//   ]
// ]
type DSelect = [string, Array<string | DSelect>]
type DSelect2 = {
    i: number
    columns: string[]
    with: [string, DSelect2][]
}