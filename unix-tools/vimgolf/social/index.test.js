var expect = require('chai').expect
var index = require('./index.js')

describe('score calculator', function() {
	it('calculates score when solutions contain just simple chars', function() {
		expect(index.calculateScore('abc')).to.be.eql(3)
		expect(index.calculateScore('')).to.be.eql(0)
	})
	it('calculates score when solutions contain special chars', function() {
		expect(index.calculateScore('<Esc>')).to.be.eql(1)
		expect(index.calculateScore('<C-W>')).to.be.eql(1)
	})
})
