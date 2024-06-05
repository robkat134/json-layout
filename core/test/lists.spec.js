import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { compile, StatefulLayout } from '../src/index.js'

describe.only('Management of props from layout', () => {
  const defaultOptions = { debounceInputMs: 0 }

  it('should manage array of strings as a list if requested', async () => {
    const compiledLayout = await compile({
      type: 'object',
      properties: { arr1: { type: 'array', layout: 'list', items: { type: 'string', minLength: 2 } } }
    })
    assert.equal(compiledLayout.skeletonTree.root.children?.length, 1)
    assert.ok(!compiledLayout.skeletonTree.root.children[0].children)
    assert.equal(compiledLayout.skeletonTree.root.children[0].childrenTrees?.length, 1)
    const statefulLayout = new StatefulLayout(compiledLayout, compiledLayout.skeletonTree, defaultOptions, {
      arr1: ['Str 1', 'Str 2', 'a']
    })
    const arrNode = statefulLayout.stateTree.root.children?.[0]
    assert.ok(arrNode)
    assert.equal(arrNode.layout.comp, 'list')
    assert.deepEqual(arrNode.data, ['Str 1', 'Str 2', 'a'])

    assert.equal(arrNode.children?.length, 3)
    assert.equal(arrNode.children?.[0].key, 0)
    assert.equal(arrNode.children?.[0].data, 'Str 1')
    assert.equal(arrNode.children?.[0].layout.comp, 'text-field')
    assert.equal(arrNode.children?.[1].key, 1)
    assert.equal(arrNode.children?.[1].data, 'Str 2')

    assert.equal(statefulLayout.stateTree.valid, false)
    assert.equal(arrNode.children?.[2].error, 'must NOT be shorter than 2 characters')

    statefulLayout.input(arrNode.children[0], 'test')
    const arrNode2 = statefulLayout.stateTree.root.children?.[0]
    assert.ok(arrNode2)
    assert.notEqual(arrNode, arrNode2)
    assert.equal(arrNode2.children?.[0].data, 'test')
  })

  it('should manage array of objects as a list', async () => {
    const compiledLayout = await compile({
      type: 'object',
      properties: { arr1: { type: 'array', items: { type: 'object', properties: { str1: { type: 'string' } } } } }
    })
    assert.equal(compiledLayout.skeletonTree.root.children?.length, 1)
    assert.ok(!compiledLayout.skeletonTree.root.children[0].children)
    assert.equal(compiledLayout.skeletonTree.root.children[0].childrenTrees?.length, 1)
    const statefulLayout = new StatefulLayout(compiledLayout, compiledLayout.skeletonTree, defaultOptions, {
      arr1: [{ str1: 'val1' }]
    })
    const arrNode = statefulLayout.stateTree.root.children?.[0]
    assert.ok(arrNode)
    assert.equal(arrNode.layout.comp, 'list')
    assert.deepEqual(arrNode.data, [{ str1: 'val1' }])

    // push empty item before editing it
    statefulLayout.input(arrNode, [{ str1: 'val1' }, undefined])
    statefulLayout.activateItem(arrNode, 1)
    assert.deepEqual(statefulLayout.data, { arr1: [{ str1: 'val1' }, {}] })
  })
})