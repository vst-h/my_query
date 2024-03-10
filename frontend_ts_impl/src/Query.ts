import { EGroupsFn } from "./EGroup"
import { DInclude, EIncludeFn, newEInclude } from "./EInclude"
import { EOrdersFn } from "./EOrder"
import { ESelectFn } from "./ESelect"
import { DWhere, EWheresFn } from "./EWhere"

export interface QueryData {
    entity: string
    includes: DInclude
    // join: DJoin
    where: DWhere
}

// interface QueryData2 {
//     from: keyof EntityMap
//     where:
// }

export interface EntityMap { }
export type Query = {
    [K in keyof EntityMap]: QWhere2<EntityMap[K]>
}

interface QEntity<T> extends QWhere<T, []> {
    includes<TInclude>(_: EIncludeFn<T, TInclude>): QWhere<T, TInclude>
}

export interface QWhere2<T, TWith = []> extends QWhereAfter<T, TWith> {
    where(_: EWheresFn<T>): QWhereAfter<T, TWith>
}

export interface QWhere<T, TInclude = []> extends QWhereAfter<T, TInclude> {
    where(_: EWheresFn<T>): QWhereAfter<T, TInclude>
}

export interface QWhereAfter<T, TInclude = []> extends QOrder<T, TInclude>, QGroup<T, TInclude> {
}


interface QOrder<T, TInclude> extends QSelectBefore<T, TInclude> {
    orderBy(_: EOrdersFn<T>): QSelectBefore<T, TInclude>
}

interface QGroup<T, TInclude> extends QSelectBefore<T, TInclude> {
    groupBy(_: EGroupsFn<T>): QSelectBefore<T, TInclude>
}

interface QSelectBefore<T, TInclude> extends QSelect<T, TInclude> {
    limit(count: number): QSelect<T, TInclude>
    limit(offset: number, count: number): QSelect<T, TInclude>
}

/** 最后的查询了 */
type QSelect<T, TInclude> = {
    select<TSelect, TRes = unknown>(_?: ESelectFn<T, TSelect>): TRes[]
    /** 直接返回结果了 */
    selectFrist(): unknown
    selectDistinct<TSelect>(_: ESelectFn<T, TSelect>): unknown
}


function createQEntity<T>(entity: string): QEntity<T> {
    const data: QueryData = {
        entity,
        includes: [],
        where: ["AND", []],
        // getTableCount() {
        //     const entityCount = 1
        //     const tableCount = entityCount + data.includes.length + data.join.length
        //     return tableCount
        // }
    }

    const q: QEntity<T> = {
        includes(f: Function) {
            f(newEInclude<T>(data.includes))
            return q as any
        },

        where: f => {

            return q as any
        },

        orderBy() { throw "todo" },
        groupBy() { throw "todo" },

        limit() { throw "todo" },
        selectFrist() { throw "todo" },
        select() { throw "todo" },
        selectDistinct() { throw "todo" },
    }
    return q
}

export function createQuery(opt: unknown): Query {
    throw "todo"

    // get: (_, key: string) => createQEntity(key)
}

