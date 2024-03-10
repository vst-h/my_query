
import { assert, describe, expect, test } from 'vitest'
import { createQuery } from '../src/Query'
import { ESelect, getSelectData, newESelect } from '../src/ESelect'
import { Post } from './EntityMap'

// describe("Select", () => {
//   return
//   const q = createQuery({})

//   test("entity prop Remove the `~include` key.", () => {
//     type PropKey = keyof ESelect<Post>
//     function test<T>(_: T extends "~include" ? never : T, key: PropKey) {
//       test(key, key)
//     }
//   })

//   test("entity prop", () => {
//     const qSelect = q.Post.select(e => e.id.titel.content.create_at)

//   })
// })

describe("ESelect type", () => {
  const e = newESelect<Post>()
  test("Id is a property, not a WithEntity", () => {
    e.id.titel
  })
  test("Date is a property, not a WithEntity", () => {
    e.create_at.titel
  })
  test("The Function property should error out", () => {
    // @ts-expect-error
    e.author.titel

    // @ts-expect-error
    e.author.name.length
  })
})

describe("ESelect", () => {
  test("entity prop chain", () => {
    const e = newESelect<Post>()
    const select = e.id.titel.content.create_at
    const data = getSelectData(select)

    expect(data).toEqual({
      i: 1,
      columns: ["id", "titel", "content", "create_at"],
      with: []
    })

  })

  test("entity with empty", () => {
    const e = newESelect<Post>()
    const select = e.id.titel.content.create_at.author()
    const data = getSelectData(select)

    expect(data).toEqual({
      i: 1,
      columns: ["id", "titel", "content", "create_at",],
      with: [["author", []]],
    })
  })

  test("entity with deep", () => {
    const e = newESelect<Post>()
    const select = e.id.titel.content.create_at
      .comment(e => e.id.user_id.content
        .user(u => u.name.badge(b => b.name.icon)))
      .tags(e => e.id.name)

    const data = getSelectData(select)

    const expect_data: typeof data = {
      i: 1,
      columns: ["id", "titel", "content", "create_at",],
      with: [
        ["comment", {
          i: 11,
          columns: ["id", "user_id", "content"],
          with: [
            ["user", {
              i: 111,
              columns: ["name",],
              with: [
                ["badge", { i: 1111, columns: ["name", "icon"], with: [] }]
              ]
            }]
          ]
        }],
        ["tags", { i: 12, columns: ["id", "name"], with: [] }]
      ],
    }
    expect(data).toEqual(expect_data)

  })
})
