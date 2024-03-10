import { describe, expect, expectTypeOf, test } from 'vitest'
import { getWhereData, newEWhere } from '../src/EWhere'
import { Post, User } from "./EntityMap"

describe("EWhere", () => {
  describe("basic operation", () => {

    test("binary op", () => {
      const e = newEWhere<Post>([])
      const where = e
        .click_count.eq(1)
        .click_count.gt(2)
        .click_count.lt(3)
        .click_count.nEq(4)
        .click_count.gte(5)
        .click_count.lte(6)

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "click_count"], 1],
        ["gt", [[], "click_count"], 2],
        ["lt", [[], "click_count"], 3],
        ["nEq", [[], "click_count"], 4],
        ["gte", [[], "click_count"], 5],
        ["lte", [[], "click_count"], 6],
      ])
    })

    test("in op", () => {
      const e = newEWhere<Post>([])
      const where = e
        .id.in(3)
        .id.in(3, 4)
        .id.notIn(3)
        .id.notIn(3, 4)

      const data = getWhereData(where)
      expect(data).toEqual([
        ["in", [[], "id"], [3]],
        ["in", [[], "id"], [3, 4]],
        ["notIn", [[], "id"], [3]],
        ["notIn", [[], "id"], [3, 4]],
      ])
    })

    test("between op", () => {
      const e = newEWhere<Post>([])
      const where = e
        .click_count.between(3, 4)
        .click_count.notBetween(3, 4)

      const data = getWhereData(where)
      expect(data).toEqual([
        ["between", [[], "click_count"], 3, 4],
        ["notBetween", [[], "click_count"], 3, 4],
      ])
    })

    test("AND op", () => {
      const e = newEWhere<Post>([])
      const where = e.AND$(e
        .id.eq(3)
        .id.eq(4))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["AND", [
          ["eq", [[], "id"], 3],
          ["eq", [[], "id"], 4],
        ]]
      ])
    })

    test("AND op, multiple parameters", () => {
      const e = newEWhere<Post>([])
      const u = newEWhere<User>(["author"])
      const where = e.AND$(e
        .id.eq(3)
        .id.eq(4), u
          .name.eq("author_name")
          .id.eq(5))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["AND", [
          ["eq", [[], "id"], 3],
          ["eq", [[], "id"], 4],
          ["eq", [["author"], "name"], "author_name"],
          ["eq", [["author"], "id"], 5],
        ]]
      ])
      const u_data = getWhereData(u)
      expect(u_data.length).equal(0)
    })

    test("OR op", () => {
      const e = newEWhere<Post>([])
      const where = e.OR$(e
        .id.eq(3)
        .id.eq(4))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["OR", [
          ["eq", [[], "id"], 3],
          ["eq", [[], "id"], 4],
        ]]
      ])
    })

    test("OR op, multiple parameters", () => {
      const e = newEWhere<Post>([])
      const u = newEWhere<User>(["author"])
      const where = e.OR$(e
        .id.eq(3)
        .id.eq(4), u
          .name.eq("author_name")
          .id.eq(5))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["OR", [
          ["eq", [[], "id"], 3],
          ["eq", [[], "id"], 4],
          ["eq", [["author"], "name"], "author_name"],
          ["eq", [["author"], "id"], 5],
        ]]
      ])
      const u_data = getWhereData(u)
      expect(u_data.length).equal(0)
    })

    test("nested logic", () => {
      const e = newEWhere<Post>([])
      const where = e.AND$(e
        .id.eq(1)
        .id.eq(2).AND$(e
          .id.eq(3)
          .id.eq(4).OR$(e
            .id.eq(5)
            .id.eq(6).AND$(e
              .id.eq(7)
              .id.eq(8)
            )
          )
        ))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["AND", [
          ["eq", [[], "id"], 1],
          ["eq", [[], "id"], 2],
          ["AND", [
            ["eq", [[], "id"], 3],
            ["eq", [[], "id"], 4],
            ["OR", [
              ["eq", [[], "id"], 5],
              ["eq", [[], "id"], 6],
              ["AND", [
                ["eq", [[], "id"], 7],
                ["eq", [[], "id"], 8],
              ]]
            ]]
          ]],
        ]]
      ])
    })

  })

  describe("condition logic", () => {

    test("AND$IF, true true", () => {
      const e = newEWhere<Post>([])
      const where = e
        .id.eq(1).AND$IF(true, e
          .id.eq(2)
          .id.eq(3).AND$IF(true, e
            .id.eq(4)
            .id.eq(5)))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "id"], 1],
        ["AND", [
          ["eq", [[], "id"], 2],
          ["eq", [[], "id"], 3],
          ["AND", [
            ["eq", [[], "id"], 4],
            ["eq", [[], "id"], 5],
          ]],
        ]],
      ])
    })

    test("AND$IF, true false", () => {
      const e = newEWhere<Post>([])
      const where = e
        .id.eq(1).AND$IF(true, e
          .id.eq(2)
          .id.eq(3).AND$IF(false, e
            .id.eq(4)
            .id.eq(5)))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "id"], 1],
        ["AND", [
          ["eq", [[], "id"], 2],
          ["eq", [[], "id"], 3],
        ]],
      ])
    })

    test("AND$IF, false true", () => {
      const e = newEWhere<Post>([])
      const where = e
        .id.eq(1).AND$IF(false, e
          .id.eq(2)
          .id.eq(3).AND$IF(true, e
            .id.eq(4)
            .id.eq(5)))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "id"], 1],
      ])
    })

    test("OR$IF, true true", () => {
      const e = newEWhere<Post>([])
      const where = e
        .id.eq(1).OR$IF(true, e
          .id.eq(2)
          .id.eq(3).OR$IF(true, e
            .id.eq(4)
            .id.eq(5)))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "id"], 1],
        ["OR", [
          ["eq", [[], "id"], 2],
          ["eq", [[], "id"], 3],
          ["OR", [
            ["eq", [[], "id"], 4],
            ["eq", [[], "id"], 5],
          ]],
        ]],
      ])
    })

    test("OR$IF, true false", () => {
      const e = newEWhere<Post>([])
      const where = e
        .id.eq(1).OR$IF(true, e
          .id.eq(2)
          .id.eq(3).OR$IF(false, e
            .id.eq(4)
            .id.eq(5)))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "id"], 1],
        ["OR", [
          ["eq", [[], "id"], 2],
          ["eq", [[], "id"], 3],
        ]],
      ])
    })

    test("OR$IF, false true", () => {
      const e = newEWhere<Post>([])
      const where = e
        .id.eq(1).OR$IF(false, e
          .id.eq(2)
          .id.eq(3).OR$IF(true, e
            .id.eq(4)
            .id.eq(5)))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "id"], 1],
      ])
    })

    test("IF$, true true", () => {
      const e = newEWhere<Post>([])
      const where = e
        .id.eq(1).IF$(true, e
          .id.eq(2)
          .id.eq(3).IF$(true, e
            .id.eq(4)
            .id.eq(5)))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "id"], 1],
        ["eq", [[], "id"], 2],
        ["eq", [[], "id"], 3],
        ["eq", [[], "id"], 4],
        ["eq", [[], "id"], 5],
      ])
    })

    test("IF$, true false", () => {
      const e = newEWhere<Post>([])
      const where = e
        .id.eq(1).IF$(true, e
          .id.eq(2)
          .id.eq(3).IF$(false, e
            .id.eq(4)
            .id.eq(5)))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "id"], 1],
        ["eq", [[], "id"], 2],
        ["eq", [[], "id"], 3],
      ])
    })

    test("IF$, false true", () => {
      const e = newEWhere<Post>([])
      const where = e
        .id.eq(1).IF$(false, e
          .id.eq(2)
          .id.eq(3).IF$(true, e
            .id.eq(4)
            .id.eq(5)))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "id"], 1],
      ])
    })

  })

  describe("with entity property", () => {

    test("with single entity", () => {
      const e = newEWhere<Post>([])
      const where = e
        .id.eq(1)
        .author(a => a.id.eq(2).id.eq(3))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "id"], 1],
        ["eq", [["author"], "id"], 2],
        ["eq", [["author"], "id"], 3],
      ])
    })

    test("with multiple entity", () => {
      const e = newEWhere<Post>([])
      const where = e
        .id.eq(1)
        .author(a => a.id.eq(2).id.eq(3))
        .comment(c => c.id.eq(4).id.eq(5))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "id"], 1],
        ["eq", [["author"], "id"], 2],
        ["eq", [["author"], "id"], 3],
        ["eq", [["comment"], "id"], 4],
        ["eq", [["comment"], "id"], 5],
      ])
    })

    test("with entity, other entity field", () => {
      const p = newEWhere<Post>([])
      const where = p
        .id.eq(1)
        .author(a => a.id.eq(2).id.eq(p.id))

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "id"], 1],
        ["eq", [["author"], "id"], 2],
        ["eq", [["author"], "id"], [[], "id"]],
      ])
    })

    test("multi-level entity", () => {
      const p = newEWhere<Post>([])
      const where = p
        .id.eq(1)
        .comment(c => c
          .id.eq(p.id)
          .user(u => u
            .id.eq(c.id)
            .badge(b => b.id.eq(u.id))
          )
        )

      const data = getWhereData(where)
      expect(data).toEqual([
        ["eq", [[], "id"], 1],
        ["eq", [["comment"], "id"], [[], "id"]],
        ["eq", [["comment", "user"], "id"], [["comment"], "id"]],
        ["eq", [["comment", "user", "badge"], "id"], [["comment", "user"], "id"]],
      ])
    })

  })

})
