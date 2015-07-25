stack = null

'abcxyz'.split('').reverse()
  .forEach (id) ->
    rjs.define "test/lib/#{id}.js", id

rjs.define 'bower_components/jquery/dist/jquery.js', 'jquery'
rjs.define 'bower_components/jquery.dfp/jquery.dfp.js', 'jquery.dfp'
rjs.define 'bower_components/moment/moment.js', 'moment'
rjs.define 'bower_components/moment/locale/es.js', 'moment/locale/es'
rjs.define 'bower_components/swiper/dist/js/swiper.jquery.js', 'swiper'
rjs.define 'bower_components/masonry/dist/masonry.pkgd.js', 'masonry'
rjs.define 'bower_components/semantic-ui/dist/semantic.js', 'semantic-ui'
rjs.define 'bower_components/lodash/lodash.js', 'lodash'
rjs.define 'bower_components/ractive/ractive.js', 'ractive'

describe 'TinyRJS', ->
  beforeEach ->
    stack = []

  it 'should load single dependencies', (done) ->
    rjs.require ['a'], (a) ->
      a(stack)
      expect(stack).toEqual ['A']
      done()

  it 'should load dependencies in order', (done) ->
    rjs.require ['b'], (b) ->
      b(stack)
      expect(stack).toEqual ['B', 'C']
      done()

  it 'should allow aliases for dependencies', (done) ->
    rjs.require ['c', 'D'], (c, D) ->
      expect(c).toBe D
      done()

  it 'should allow callbacks as dependencies to run (sync)', ->
    test = ->
      test.called = true
      test

    rjs.require [test], (t) ->
      expect(test.called).toBeTruthy()
      expect(test).toBe t

  it 'should allow callbacks as dependencies to run (promise)', (done) ->
    test = ->
      new Promise (resolve) ->
        setTimeout ->
          test.called = true
          resolve x: 'y'
        , 200

    rjs.require [test], (t) ->
      expect(test.called).toBeTruthy()
      expect(t).toEqual x: 'y'
      done()

  it 'should allow callbacks as dependencies to run (callback)', (done) ->
    test = (next) ->
      setTimeout ->
        test.called = true
        next x: 'y'
      , 200

    rjs.require [test], (t) ->
      expect(test.called).toBeTruthy()
      expect(t).toEqual x: 'y'
      done()

  it 'should throw an error on missing dependencies', ->
    expect(->
      rjs.require ['im_not_exists']
    ).toThrow()

  it  'should throw an error on indeterminated dependencies', (done) ->
    error = null

    window.onerror = (e) ->
      error = e
      true

    rjs.require ['x'], (x) ->
      delete window.onerror

      x(stack)
      expect(stack).toEqual ['X']
      expect(error).toContain 'indeterminate definition'

      done()

  it 'should handle asynchronously loading of all dependencies', (done) ->
    rjs.require ['y'], (y) ->
      expect(y).toBe 'Y'

    rjs.require ['z'], (z) ->
      expect(z).toBe 'Z'
      done()

  describe 'support for non AMD modules?', ->
    it 'should jQuery pollute the global scope? Yes', (done) ->
      rjs.require ['jquery'], ->
        expect($).not.toBeUndefined()
        done()

    it 'should jQuery-DFP pollute the global scope? Yes', (done) ->
      rjs.require ['jquery.dfp'], ->
        expect($.dfp).not.toBeUndefined()
        done()

    it 'should moment.js load its locales asynchronously? No', (done) ->
      rjs.require ['moment', 'moment/locale/es'], ->
        expect(moment('19870610', 'YYYYMMDD').fromNow())
          .toEqual "hace #{(new Date()).getFullYear() - 1987} años"

        done()

    it 'should load most dependencies asynchronously always? Yes', (done) ->
      rjs.require ['ractive', 'masonry', 'swiper', 'lodash', 'semantic-ui'], ->
        expect(Ractive).not.toBeUndefined()
        expect($.fn.masonry).not.toBeUndefined()
        expect($.fn.swiper).not.toBeUndefined()
        expect(_).not.toBeUndefined()
        expect($.fn.visibility).not.toBeUndefined()
        expect(arguments.length).toBe 5 # should be 0
        done()
