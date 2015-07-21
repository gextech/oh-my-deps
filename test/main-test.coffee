['a', 'b', 'c'].reverse()
  .forEach (id) ->
    rjs.define "test/lib/#{id}.js", id

describe 'TinyRJS', ->
  beforeEach ->
    rjs.results = []

  it 'should load single dependencies', (done) ->
    rjs.require ['a'], ->
      expect(rjs.results).toEqual ['A']
      done()

  it 'should load dependencies in order', (done) ->
    rjs.require ['b', 'c'], ->
      expect(rjs.results).toEqual ['B', 'C']
      done()
