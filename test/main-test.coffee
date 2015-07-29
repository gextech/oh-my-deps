describe 'Oh my deps!', ->
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

  it 'should load all external dependencies in order (async: false)', (done) ->
    expect(window.moment).toBeUndefined()

    rjs.define 'test', ->
      (data) ->
        expect(data).toEqual "hace #{(new Date()).getFullYear() - 1987} años"
        done()

    rjs.define 'moment', 'bower_components/moment/moment.js'
    rjs.define 'moment/locale/es', 'bower_components/moment/locale/es.js'

    rjs.require ['test', 'moment', 'moment/locale/es'], (test) ->
      test moment('19870610', 'YYYYMMDD').fromNow()
