var expect = require('chai').expect
var index = require('./index.js')

describe('score calculator', function() {
	it('calculates score with just simple chars', function() {
		expect(index.calculateScore('abc')).to.be.eql(3)
		expect(index.calculateScore('')).to.be.eql(0)
	})
})
