export const mockData = {
	costs: {
		flour: {
			id: 'flour',
			name: 'Flour',
			category: 'dry',
			product: {
				cost: 2000,
				amount: 1000,
				unit: 'g'
			},
			color: '#DB8585'
		},
		sugar: {
			id: 'sugar',
			name: 'Sugar',
			category: 'dry',
			product: {
				cost: 1500,
				amount: 1000,
				unit: 'g'
			},
			color: '#aaedad'
		},
		butter: {
			id: 'butter',
			name: 'Butter',
			category: 'wet',
			product: {
				cost: 3000,
				amount: 500,
				unit: 'g'
			},
			color: '#9acbea'
		},
		eggs: {
			id: 'eggs',
			name: 'Eggs',
			category: 'wet',
			product: {
				cost: 500,
				amount: 12,
				unit: 'pack'
			},
			color: '#a1b4eb'
		},
		milk: {
			id: 'milk',
			name: 'Milk',
			category: 'liquid',
			product: {
				cost: 300,
				amount: 1000,
				unit: 'ml'
			},
			color: '#c89ae0'
		},
		vanilla: {
			id: 'vanilla',
			name: 'Vanilla Extract',
			category: 'liquid',
			product: {
				cost: 800,
				amount: 100,
				unit: 'ml'
			},
			color: '#72e478'
		},
		cocoaPowder: {
			id: 'cocoaPowder',
			name: 'Cocoa Powder',
			category: 'powder',
			product: {
				cost: 2500,
				amount: 500,
				unit: 'g'
			},
			color: '#d38f9c'
		},
		salt: {
			id: 'salt',
			name: 'Salt',
			category: 'powder',
			product: {
				cost: 200,
				amount: 500,
				unit: 'g'
			},
			color: '#81d5db'
		}
	},
	recipes: {
		chocolateCake: {
			id: 'chocolateCake',
			name: 'Chocolate Cake',
			ingredients: [
				{
					id: 'cakeMix',
					portion: {
						amount: 1,
						unit: 'batch'
					},
					hidden: false
				},
				{
					id: 'eggs',
					portion: {
						amount: 2,
						unit: 'pack'
					},
					hidden: false
				},
				{
					id: 'butter',
					portion: {
						amount: 100,
						unit: 'g'
					},
					hidden: false
				},
				{
					id: 'milk',
					portion: {
						amount: 200,
						unit: 'ml'
					},
					hidden: false
				},
				{
					id: 'vanilla',
					portion: {
						amount: 1,
						unit: 'tsp'
					},
					hidden: false
				}
			]
		},
		vanillaCake: {
			id: 'vanillaCake',
			name: 'Vanilla Cake',
			ingredients: [
				{
					id: 'flour',
					portion: {
						amount: 250,
						unit: 'g'
					},
					hidden: false
				},
				{
					id: 'sugar',
					portion: {
						amount: 200,
						unit: 'g'
					},
					hidden: false
				},
				{
					id: 'eggs',
					portion: {
						amount: 3,
						unit: 'pack'
					},
					hidden: false
				},
				{
					id: 'butter',
					portion: {
						amount: 150,
						unit: 'g'
					},
					hidden: false
				},
				{
					id: 'milk',
					portion: {
						amount: 150,
						unit: 'ml'
					},
					hidden: false
				},
				{
					id: 'vanilla',
					portion: {
						amount: 2,
						unit: 'tsp'
					},
					hidden: false
				}
			]
		}
	},
	compoundIngredients: {
		cakeMix: {
			id: 'cakeMix',
			name: 'Cake Mix',
			category: 'Compound',
			color: '#b6a29c',
			yield: {
				amount: 1,
				unit: 'batch'
			},
			viewedUnit: 'batch',
			ingredients: [
				{
					id: 'flour',
					portion: {
						amount: 300,
						unit: 'g'
					},
					hidden: false
				},
				{
					id: 'sugar',
					portion: {
						amount: 200,
						unit: 'g'
					},
					hidden: false
				},
				{
					id: 'cocoaPowder',
					portion: {
						amount: 50,
						unit: 'g'
					},
					hidden: false
				},
				{
					id: 'salt',
					portion: {
						amount: 5,
						unit: 'g'
					},
					hidden: false
				}
			]
		}
	},
	unitLabels: {
		pack: 'Pack',
		batch: 'Batch'
	},
	unitConversions: [
		{
			ingredientId: 'butter',
			inputUnit: 'g',
			outputUnit: 'tbs',
			conversionFactor: 14
		},
		{
			ingredientId: 'vanilla',
			inputUnit: 'ml',
			outputUnit: 'tsp',
			conversionFactor: 5
		},
		{
			ingredientId: 'milk',
			inputUnit: 'ml',
			outputUnit: 'cup',
			conversionFactor: 240
		},
		{
			ingredientId: 'eggs',
			inputUnit: 'pack',
			outputUnit: 'egg',
			conversionFactor: 12
		}
	]
};
