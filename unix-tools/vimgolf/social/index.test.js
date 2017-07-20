var expect = require('chai').expect
var index = require('./index.js')

describe('score calculator', function() {
	it('calculates score when solutions contain just simple chars', function() {
		expect(index.calculateScore('abc')).to.be.eql(3);
		expect(index.calculateScore('')).to.be.eql(0);
	})
	it('calculates score when solutions contain special chars', function() {
		expect(index.calculateScore('<Esc>')).to.be.eql(1);
		expect(index.calculateScore('<C-W>')).to.be.eql(1);
	})
})

describe('video bucket (0-6) picker', function() {
	it('picks the middle bucket when the score is par', function() {
		expect(index.determineVideoBucket(4, 4)).to.be.eql(3);
	})
	it('picks the middle bucket when the score is within 10% of par', function() {
		expect(index.determineVideoBucket(11, 10)).to.be.eql(3);
		expect(index.determineVideoBucket(9, 10)).to.be.eql(3);
	})
	it('picks the third bucket when the score is 10+%-20% under par', function() {
		expect(index.determineVideoBucket(8, 10)).to.be.eql(2);
	})
	it('picks the fifth bucket when the score is 10+%-20% over par', function() {
		expect(index.determineVideoBucket(12, 10)).to.be.eql(4);
	})
	it('picks the second bucket when the score is 20+%-30% under par', function() {
		expect(index.determineVideoBucket(7, 10)).to.be.eql(1);
	})
	it('picks the sixth bucket when the score is 20+%-30% over par', function() {
		expect(index.determineVideoBucket(13, 10)).to.be.eql(5);
	})
	it('picks the first bucket when the score is 30+% under par', function() {
		expect(index.determineVideoBucket(6, 10)).to.be.eql(0);
	})
	it('picks the seventh bucket when the score is 30+% over par', function() {
		expect(index.determineVideoBucket(14, 10)).to.be.eql(6);
	})
})
