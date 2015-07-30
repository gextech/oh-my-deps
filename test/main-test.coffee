describe 'Oh my deps!', ->
  it 'should allow to define modules', (done) ->
    oh.define 'simple', -> 'OK'

    oh.require ['simple'], (data) ->
      expect(data).toBe 'OK'
      done()

  it 'should allow to define modules with dependencies', (done) ->
    oh.define 'mixed', -> 'MIXED'
    oh.define 'composed', ['mixed'], (data) -> ['COMPOSED', data]

    oh.require ['composed'], (data) ->
      expect(data.join(' & ')).toEqual 'COMPOSED & MIXED'
      done()

  it 'should allow to define and require external dependencies', (done) ->
    expect(window.jQuery).toBeUndefined()

    oh.define 'jquery', 'bower_components/jquery/dist/jquery.js'

    oh.require ['jquery'], ->
      expect(window.jQuery).not.toBeUndefined()
      done()

  it 'should load all external dependencies in order (async: false)', (done) ->
    expect(window.moment).toBeUndefined()

    oh.define 'test', ->
      (data) ->
        expect(data).toEqual "hace #{(new Date()).getFullYear() - 1987} años"
        done()

    oh.define 'moment/locale/es', 'bower_components/moment/locale/es.js'
    oh.define 'moment', 'bower_components/moment/moment.js'

    oh.require ['test', 'moment', 'moment/locale/es'], (test) ->
      test moment('19870610', 'YYYYMMDD').fromNow()
