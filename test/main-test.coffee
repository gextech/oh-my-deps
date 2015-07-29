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

    it 'should allow to define and require external dependencies', (done) ->
      expect(window.jQuery).toBeUndefined()

      rjs.define 'jquery', 'bower_components/jquery/dist/jquery.js'

      rjs.require ['jquery'], ->
        expect(window.jQuery).not.toBeUndefined()
        done()
