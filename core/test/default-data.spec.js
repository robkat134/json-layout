import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { compile, StatefulLayout } from '../src/index.js'

describe('default data management', () => {
  it('should fill default values when data is empty', async () => {
    const compiledLayout = await compile({
      type: 'object',
      properties: { str1: { type: 'string', default: 'String 1' } }
    })
    const statefulLayout = new StatefulLayout(compiledLayout, compiledLayout.skeletonTree, {}, {})

    assert.deepEqual(statefulLayout.data, { str1: 'String 1' })

    // reuse default value if property is emptied
    assert.ok(statefulLayout.stateTree.root.children)
    statefulLayout.input(statefulLayout.stateTree.root.children?.[0], '')
    assert.deepEqual(statefulLayout.data, { str1: 'String 1' })

    statefulLayout.input(statefulLayout.stateTree.root.children?.[0], 'test')
    assert.deepEqual(statefulLayout.data, { str1: 'test' })
  })

  it('should fill default values when data is empty', async () => {
    const compiledLayout = await compile({
      type: 'object',
      properties: { str1: { type: 'string', default: 'String 1' } }
    })
    const statefulLayout = new StatefulLayout(compiledLayout, compiledLayout.skeletonTree, { defaultOn: 'missing' }, {})

    // console.log(JSON.stringify(statefulLayout.data, null, 2))
    assert.deepEqual(statefulLayout.data, { str1: 'String 1' })

    // DO NOT reuse default value if property is emptied
    assert.ok(statefulLayout.stateTree.root.children)
    statefulLayout.input(statefulLayout.stateTree.root.children?.[0], '')
    assert.deepEqual(statefulLayout.data, { str1: '' })

    statefulLayout.input(statefulLayout.stateTree.root.children?.[0], 'test')
    assert.deepEqual(statefulLayout.data, { str1: 'test' })
  })

  /* it.only('should use expression to fill default values', async () => {
    const compiledLayout = await compile({
      type: 'object',
      properties: { str1: { type: 'string', layout: { defaultData: 'String 1' } } }
    })
  }) */
})
