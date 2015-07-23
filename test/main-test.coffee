'abc'.split('').reverse()
  .forEach (id) ->
    rjs.define "test/lib/#{id}.js", id

rjs.define 'bower_components/jquery/dist/jquery.js', 'jquery'
rjs.define 'bower_components/lodash/lodash.js', 'lodash'
rjs.define 'bower_components/moment/moment.js', 'moment'
rjs.define 'bower_components/moment/locale/es.js', 'moment/locale/es'

describe 'TinyRJS', ->
  beforeEach ->
    rjs.results = []

  it 'should load single dependencies', (done) ->
    rjs.require ['a'], (a) ->
      stack = []
      a(stack)
      expect(stack).toEqual ['A']
      done()

  it 'should load dependencies in order', (done) ->
    rjs.require ['b'], (b) ->
      stack = []
      b(stack)

      expect(stack).toEqual ['B', 'C']
      done()

  describe 'support for define.amd modules', ->
    it 'should jQuery pollute the global scope?', (done) ->
      expect(window.jQuery).toBeUndefined()

      rjs.require ['jquery'], (j) ->
        expect(window.jQuery).toBe j
        done()

    it 'should moment.js load its locales asynchronously?', (done) ->
      rjs.require ['moment', 'moment/locale/es'], (m) ->
        expect(window.moment).toBeUndefined()

        expect(m('19870610', 'YYYYMMDD').fromNow())
          .toEqual "hace #{(new Date()).getFullYear() - 1987} años"

        done()
