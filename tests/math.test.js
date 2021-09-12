const {
	calculateTip,
	fahrenheitToCelsius,
	celsiusToFahrenheit,
	add,
} = require('./math.js');


test('Tip calculate for the rate of 10 %', () => {
	expect(calculateTip(10, 0.1)).toBe(1);
});

test('Tip calculate for the rate of 20% default', () => {
	expect(calculateTip(10)).toBe(2);
});

test('Should convert 32F to 0 Cel', () => {
	expect(fahrenheitToCelsius(32)).toBe(0);
});

test('Should convert 0 Cel to 32F', () => {
	expect(celsiusToFahrenheit(0)).toBe(32);
});

test('Async test demo', (done) => {
	setTimeout(() => {
		expect(1).toBe(1);
		done();
	}, 2000);
});

// test('Add two number', (done) => {
// 	add(10, 12)
// 		.then((sum) => {
// 			expect(sum).toBe(23);
// 			done();
// 		})
// 		.catch((err) => {
// 			done(err);
// 		});
// });
