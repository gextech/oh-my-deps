describe 'TinyRJS', ->
  describe 'rjs.define()', ->
    it 'should allow to define modules', (done) ->
      rjs.define 'simple', -> 'OK'

      rjs.require ['simple'], (data) ->
        expect(data).toBe 'OK'
        done()

    it 'should allow to define modules with dependencies', (done) ->
      rjs.define 'mixed', -> 'MIXED'
      rjs.define 'composed', ['mixed'], (data) -> ['COMPOSED', data]

      rjs.require ['composed'], (data) ->
        expect(data.join(' & ')).toEqual 'COMPOSED & MIXED'
        done()
