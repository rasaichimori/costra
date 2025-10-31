import type { CompoundIngredientDoc, IngredientDoc, RecipeDoc } from './schema';

export const mockData = {
	costs: {
		'93a2205a-cad5-4f58-aa21-13ab65023a67': {
			id: '93a2205a-cad5-4f58-aa21-13ab65023a67',
			name: 'Granola',
			category: 'dry',
			product: {
				cost: 1988,
				amount: 1000,
				unit: 'g'
			},
			color: '#DB8585'
		},
		'8e26ac84-81c0-4009-8151-872768d7ac75': {
			id: '8e26ac84-81c0-4009-8151-872768d7ac75',
			name: 'coconut Flakes',
			category: 'dry',
			product: {
				cost: 2020,
				amount: 1000,
				unit: 'g'
			},
			color: '#aaedad'
		},
		'a360a3de-24cd-454c-b6c3-3b57346e9482': {
			id: 'a360a3de-24cd-454c-b6c3-3b57346e9482',
			name: 'Hemp Seeds',
			category: 'dry',
			product: {
				cost: 2868,
				amount: 907,
				unit: 'g'
			},
			color: '#9acbea'
		},
		'c830954d-f619-428f-b5dd-c5a28167e905': {
			id: 'c830954d-f619-428f-b5dd-c5a28167e905',
			name: 'Sunflower Seeds',
			category: 'dry',
			product: {
				cost: 2299,
				amount: 1000,
				unit: 'g'
			},
			color: '#a1b4eb'
		},
		'ad2eb70d-8f66-4ff1-88f9-f2d109d12ea7': {
			id: 'ad2eb70d-8f66-4ff1-88f9-f2d109d12ea7',
			name: 'Sliced Almonds',
			category: 'dry',
			product: {
				cost: 2480,
				amount: 1000,
				unit: 'g'
			},
			color: '#c89ae0'
		},
		'8c03a758-6c2b-4dcc-b379-0b0d4104c521': {
			id: '8c03a758-6c2b-4dcc-b379-0b0d4104c521',
			name: 'Pumpkin Seeds',
			category: 'dry',
			product: {
				cost: 2099,
				amount: 1000,
				unit: 'g'
			},
			color: '#72e478'
		},
		'801b62d2-9a37-4f00-8a8f-7d57419a9726': {
			id: '801b62d2-9a37-4f00-8a8f-7d57419a9726',
			name: 'Goji Berry',
			category: 'dry',
			product: {
				cost: 2880,
				amount: 1000,
				unit: 'g'
			},
			color: '#d38f9c'
		},
		'c7098cb7-5c93-464c-b542-42d1f3ecc174': {
			id: 'c7098cb7-5c93-464c-b542-42d1f3ecc174',
			name: 'Chia Seeds',
			category: 'dry',
			product: {
				cost: 3580,
				amount: 1000,
				unit: 'g'
			},
			color: '#81d5db'
		},
		'cce7e91c-b618-4ff0-9094-95676535ec92': {
			id: 'cce7e91c-b618-4ff0-9094-95676535ec92',
			name: 'Cacao Nibs',
			category: 'dry',
			product: {
				cost: 5480,
				amount: 1000,
				unit: 'g'
			},
			color: '#a993d9'
		},
		'951699b2-dced-40c2-892d-4f179cb74036': {
			id: '951699b2-dced-40c2-892d-4f179cb74036',
			name: 'Pistachio',
			category: 'dry',
			product: {
				cost: 2938,
				amount: 1000,
				unit: 'g'
			},
			color: '#e0b69d'
		},
		'b7b80f21-a45c-4a81-83ed-a01fb735fe93': {
			id: 'b7b80f21-a45c-4a81-83ed-a01fb735fe93',
			name: 'White Chocolate',
			category: 'dry',
			product: {
				cost: 2000,
				amount: 1000,
				unit: 'g'
			},
			color: '#b798e9'
		},
		'f6007718-8207-4f41-abb8-f74cdeffb3ce': {
			id: 'f6007718-8207-4f41-abb8-f74cdeffb3ce',
			name: 'Honey',
			category: 'wet',
			product: {
				cost: 2780,
				amount: 2040,
				unit: 'g'
			},
			color: '#d0ddad'
		},
		'5e039c48-bbd5-45fe-afc0-a3652c780630': {
			id: '5e039c48-bbd5-45fe-afc0-a3652c780630',
			name: 'Agave',
			category: 'wet',
			product: {
				cost: 2780,
				amount: 2040,
				unit: 'g'
			},
			color: '#ad9090'
		},
		'bcf35d8b-0986-4ca1-97d7-f0e881e53680': {
			id: 'bcf35d8b-0986-4ca1-97d7-f0e881e53680',
			name: 'Peanut Butter',
			category: 'wet',
			product: {
				cost: 3169,
				amount: 2720,
				unit: 'g'
			},
			color: '#85d99a'
		},
		'0735edac-f87b-40de-a3cb-675ce2b140db': {
			id: '0735edac-f87b-40de-a3cb-675ce2b140db',
			name: 'Mixed Nuts Butter',
			category: 'wet',
			product: {
				cost: 1988,
				amount: 765,
				unit: 'g'
			},
			color: '#7fd9b4'
		},
		'eedf952a-f257-4bb2-a149-2b6abe0bf616': {
			id: 'eedf952a-f257-4bb2-a149-2b6abe0bf616',
			name: 'Nutella',
			category: 'wet',
			product: {
				cost: 1498,
				amount: 1000,
				unit: 'g'
			},
			color: '#94bee1'
		},
		'854596b6-11eb-41d7-97be-c572d8c3b35c': {
			id: '854596b6-11eb-41d7-97be-c572d8c3b35c',
			name: 'Greek Yogurt',
			category: 'wet',
			product: {
				cost: 2430,
				amount: 1000,
				unit: 'g'
			},
			color: '#ec94db'
		},
		'0b481ce6-4b7c-4317-ade2-f61693e4e09b': {
			id: '0b481ce6-4b7c-4317-ade2-f61693e4e09b',
			name: 'Spinach',
			category: 'vegetable',
			product: {
				cost: 250,
				amount: 360,
				unit: 'g'
			},
			color: '#aec4e4'
		},
		'44dd3a74-bead-471d-8a56-b5f12ea412cc': {
			id: '44dd3a74-bead-471d-8a56-b5f12ea412cc',
			name: 'Avocado',
			category: 'vegetable',
			product: {
				cost: 899,
				amount: 1075,
				unit: 'g'
			},
			color: '#ddaccc'
		},
		'13fc1284-a87a-4d7c-8cfd-c13c4cc30030': {
			id: '13fc1284-a87a-4d7c-8cfd-c13c4cc30030',
			name: 'Strawberry',
			category: 'fruits',
			product: {
				cost: 2000,
				amount: 360,
				unit: 'g'
			},
			color: '#7284df'
		},
		'166f05a4-b792-42bd-8911-58aa0d4455c3': {
			id: '166f05a4-b792-42bd-8911-58aa0d4455c3',
			name: 'Banana',
			category: 'fruits',
			product: {
				cost: 315,
				amount: 1180,
				unit: 'g'
			},
			color: '#cbafe8'
		},
		'76b433d9-1846-4009-808c-b57277b80664': {
			id: '76b433d9-1846-4009-808c-b57277b80664',
			name: 'Raspberry',
			category: 'fruits',
			product: {
				cost: 998,
				amount: 180,
				unit: 'g'
			},
			color: '#d6b09f'
		},
		'b20a98b5-cddf-4cde-ac3d-118a2ece2c53': {
			id: 'b20a98b5-cddf-4cde-ac3d-118a2ece2c53',
			name: 'Pineapple',
			category: 'fruits',
			product: {
				cost: 500,
				amount: 905,
				unit: 'g'
			},
			color: '#b0d3e7'
		},
		'4f0e07a4-6f4f-4e6c-823b-ac03f487570b': {
			id: '4f0e07a4-6f4f-4e6c-823b-ac03f487570b',
			name: 'Kiwi',
			category: 'fruits',
			product: {
				cost: 1400,
				amount: 1050,
				unit: 'g'
			},
			color: '#8590e0'
		},
		'800c155e-5439-4742-80dd-75163036773f': {
			id: '800c155e-5439-4742-80dd-75163036773f',
			name: 'Blueberry',
			category: 'fruits',
			product: {
				cost: 1400,
				amount: 510,
				unit: 'g'
			},
			color: '#dea0a7'
		},
		'06abe694-884a-4730-b8b3-27ca0dbf6a7b': {
			id: '06abe694-884a-4730-b8b3-27ca0dbf6a7b',
			name: 'Frozen Mango',
			category: 'frozen',
			product: {
				cost: 1550,
				amount: 1500,
				unit: 'g'
			},
			color: '#ffdf6b'
		},
		'b83b0488-0716-42f1-a83f-36060e1b61f1': {
			id: 'b83b0488-0716-42f1-a83f-36060e1b61f1',
			name: 'Frozen Blueberry',
			category: 'frozen',
			product: {
				cost: 1400,
				amount: 2270,
				unit: 'g'
			},
			color: '#a8c7e8'
		},
		'647bbc34-c948-4f92-9304-c24dac0bb84a': {
			id: '647bbc34-c948-4f92-9304-c24dac0bb84a',
			name: 'Frozen Strawberry',
			category: 'frozen',
			product: {
				cost: 1400,
				amount: 2270,
				unit: 'g'
			},
			color: '#bdd988'
		},
		'e42fc8f1-3d4b-454a-836d-aefa21562047': {
			id: 'e42fc8f1-3d4b-454a-836d-aefa21562047',
			name: 'Acai Paste',
			category: 'frozen',
			product: {
				cost: 22000,
				amount: 60,
				unit: 'pack'
			},
			color: '#513691'
		},
		'7b4fbcb2-364d-4b1e-9c71-b4f9eeaf079f': {
			id: '7b4fbcb2-364d-4b1e-9c71-b4f9eeaf079f',
			name: 'Lakanto',
			category: 'powder',
			product: {
				cost: 745,
				amount: 8.29,
				unit: 'oz'
			},
			color: '#b79ade'
		},
		'ba391b3d-44d8-4ab4-b3ea-f80501dffc53': {
			id: 'ba391b3d-44d8-4ab4-b3ea-f80501dffc53',
			name: 'Cinnamon',
			category: 'powder',
			product: {
				cost: 494,
				amount: 25,
				unit: 'g'
			},
			color: '#dbcaa4'
		},
		'473c8f78-832f-401f-849a-32352476bfb9': {
			id: '473c8f78-832f-401f-849a-32352476bfb9',
			name: 'Cacao',
			category: 'powder',
			product: {
				cost: 2980,
				amount: 1,
				unit: 'g'
			},
			color: '#d7b08b'
		},
		'c8611d01-3ad2-401a-9216-52f8c546177e': {
			id: 'c8611d01-3ad2-401a-9216-52f8c546177e',
			name: 'Himalayian Pink Salt',
			category: 'powder',
			product: {
				cost: 950,
				amount: 220,
				unit: 'g'
			},
			color: '#ad8dd6'
		},
		'ddcf0a3e-7969-4c19-8cd1-ff1ffb89b22d': {
			id: 'ddcf0a3e-7969-4c19-8cd1-ff1ffb89b22d',
			name: 'Apple Juice',
			category: 'liquid',
			product: {
				cost: 2598,
				amount: 7560,
				unit: 'ml'
			},
			color: '#eac09a'
		},
		'22de7026-c267-45b9-abc1-1989d8c80a0e': {
			id: '22de7026-c267-45b9-abc1-1989d8c80a0e',
			name: 'Coconut Milk',
			category: 'liquid',
			product: {
				cost: 1498,
				amount: 6,
				unit: 'can'
			},
			color: '#dfeda6'
		},
		'749a05c7-3852-4858-bd5e-ec3569f95ace': {
			id: '749a05c7-3852-4858-bd5e-ec3569f95ace',
			name: 'Oat Milk',
			category: 'liquid',
			product: {
				cost: 3388,
				amount: 60,
				unit: 'oz'
			},
			color: '#91bee2'
		},
		'0d780462-cbaa-4ddf-b93c-8310adb0b116': {
			id: '0d780462-cbaa-4ddf-b93c-8310adb0b116',
			name: 'Almond Milk',
			category: 'liquid',
			product: {
				cost: 3388,
				amount: 11352,
				unit: 'ml'
			},
			color: '#82cab6'
		},
		'5128567b-f0be-4b90-bafc-bebc286ff9fc': {
			id: '5128567b-f0be-4b90-bafc-bebc286ff9fc',
			name: 'Coconut Cream',
			category: 'liquid',
			product: {
				cost: 1080,
				amount: 1000,
				unit: 'ml'
			},
			color: '#dc99e8'
		},
		'c0040a6a-3e29-42c0-ae65-27a46298fcd0': {
			id: 'c0040a6a-3e29-42c0-ae65-27a46298fcd0',
			name: 'Coconut Oil',
			category: 'liquid',
			product: {
				cost: 2480,
				amount: 2182,
				unit: 'g'
			},
			color: '#e4b0e1'
		},
		'346ca52c-bff3-4622-a1c8-1eeb567bfd89': {
			id: '346ca52c-bff3-4622-a1c8-1eeb567bfd89',
			name: 'katifi',
			category: 'dry',
			product: {
				cost: 2500,
				amount: 500,
				unit: 'g'
			},
			color: '#e27ea1'
		},
		'3d611b0d-28a1-4ccc-8ce3-49268ed0f692': {
			id: '3d611b0d-28a1-4ccc-8ce3-49268ed0f692',
			name: 'Pistachio Cream',
			category: 'cream',
			product: {
				cost: 1100,
				amount: 240,
				unit: 'g'
			},
			color: '#76e26e'
		}
	} as Record<string, IngredientDoc>,
	recipes: {
		'd90838e0-0835-4515-9048-af7898a85953': {
			id: 'd90838e0-0835-4515-9048-af7898a85953',
			name: 'Acai Base',
			ingredients: [
				{
					id: 'e42fc8f1-3d4b-454a-836d-aefa21562047',
					portion: {
						amount: 0.25,
						unit: 'pack'
					},
					hidden: false
				},
				{
					id: '06abe694-884a-4730-b8b3-27ca0dbf6a7b',
					portion: {
						amount: 1,
						unit: 'cup'
					},
					hidden: false
				},
				{
					id: 'b83b0488-0716-42f1-a83f-36060e1b61f1',
					portion: {
						amount: 1,
						unit: 'cup'
					},
					hidden: false
				},
				{
					id: '5e039c48-bbd5-45fe-afc0-a3652c780630',
					portion: {
						amount: 1,
						unit: 'tbs'
					},
					hidden: false
				},
				{
					id: 'ddcf0a3e-7969-4c19-8cd1-ff1ffb89b22d',
					portion: {
						amount: 1,
						unit: 'cup'
					},
					hidden: false
				}
			]
		},
		'b7b26e24-f164-4bee-8800-18590dda80fe': {
			id: 'b7b26e24-f164-4bee-8800-18590dda80fe',
			name: 'Mango Base',
			ingredients: [
				{
					id: '06abe694-884a-4730-b8b3-27ca0dbf6a7b',
					portion: {
						amount: 1,
						unit: 'cup'
					},
					hidden: false
				},
				{
					id: '5e039c48-bbd5-45fe-afc0-a3652c780630',
					portion: {
						amount: 1,
						unit: 'tsp'
					},
					hidden: false
				},
				{
					id: 'ddcf0a3e-7969-4c19-8cd1-ff1ffb89b22d',
					portion: {
						amount: 1,
						unit: 'cup'
					},
					hidden: false
				}
			]
		},
		'51cde09f-7b77-43cd-ae20-4fd425aaf101': {
			id: '51cde09f-7b77-43cd-ae20-4fd425aaf101',
			name: 'Coconut Base',
			ingredients: [
				{
					id: '5128567b-f0be-4b90-bafc-bebc286ff9fc',
					portion: {
						amount: 2,
						unit: 'tbs'
					},
					hidden: false
				},
				{
					id: '22de7026-c267-45b9-abc1-1989d8c80a0e',
					portion: {
						amount: 1,
						unit: 'cup'
					},
					hidden: false
				},
				{
					id: '5e039c48-bbd5-45fe-afc0-a3652c780630',
					portion: {
						amount: 1,
						unit: 'tbs'
					},
					hidden: false
				}
			]
		},
		'b20691ad-57ab-4840-80b1-6cd064f0d594': {
			id: 'b20691ad-57ab-4840-80b1-6cd064f0d594',
			name: 'Dubai Chocolate',
			ingredients: [
				{
					id: '346ca52c-bff3-4622-a1c8-1eeb567bfd89',
					portion: {
						amount: 45,
						unit: 'g'
					},
					hidden: false
				},
				{
					id: '3d611b0d-28a1-4ccc-8ce3-49268ed0f692',
					portion: {
						amount: 45,
						unit: 'g'
					},
					hidden: false
				},
				{
					id: '13fc1284-a87a-4d7c-8cfd-c13c4cc30030',
					portion: {
						amount: 48,
						unit: 'g'
					},
					hidden: false
				},
				{
					id: 'eedf952a-f257-4bb2-a149-2b6abe0bf616',
					portion: {
						amount: 3,
						unit: 'tbs'
					},
					hidden: false
				}
			]
		}
	} as Record<string, RecipeDoc>,
	compoundIngredients: {
		'd90838e0-0835-4515-9048-af7898a85953': {
			id: 'd90838e0-0835-4515-9048-af7898a85953',
			name: 'Acai Base',
			category: 'Compound',
			color: '#b6a29c',
			yield: {
				amount: 1,
				unit: 'pint'
			},
			viewedUnit: 'cup',
			ingredients: [
				{
					id: 'e42fc8f1-3d4b-454a-836d-aefa21562047',
					portion: {
						amount: 0.25,
						unit: 'pack'
					},
					hidden: false
				},
				{
					id: '06abe694-884a-4730-b8b3-27ca0dbf6a7b',
					portion: {
						amount: 1,
						unit: 'cup'
					},
					hidden: false
				},
				{
					id: 'b83b0488-0716-42f1-a83f-36060e1b61f1',
					portion: {
						amount: 1,
						unit: 'cup'
					},
					hidden: false
				},
				{
					id: '5e039c48-bbd5-45fe-afc0-a3652c780630',
					portion: {
						amount: 1,
						unit: 'tbs'
					},
					hidden: false
				},
				{
					id: 'ddcf0a3e-7969-4c19-8cd1-ff1ffb89b22d',
					portion: {
						amount: 1,
						unit: 'cup'
					},
					hidden: false
				}
			]
		},
		'b7b26e24-f164-4bee-8800-18590dda80fe': {
			id: 'b7b26e24-f164-4bee-8800-18590dda80fe',
			name: 'Mango Base',
			category: 'Compound',
			color: '#ddba87',
			yield: {
				amount: 1,
				unit: 'pint'
			},
			viewedUnit: 'cup',
			ingredients: [
				{
					id: '06abe694-884a-4730-b8b3-27ca0dbf6a7b',
					portion: {
						amount: 1,
						unit: 'cup'
					},
					hidden: false
				},
				{
					id: '5e039c48-bbd5-45fe-afc0-a3652c780630',
					portion: {
						amount: 1,
						unit: 'tsp'
					},
					hidden: false
				},
				{
					id: 'ddcf0a3e-7969-4c19-8cd1-ff1ffb89b22d',
					portion: {
						amount: 1,
						unit: 'cup'
					},
					hidden: false
				}
			]
		},
		'51cde09f-7b77-43cd-ae20-4fd425aaf101': {
			id: '51cde09f-7b77-43cd-ae20-4fd425aaf101',
			name: 'Coconut Base',
			category: 'Compound',
			color: '#cdb2b5',
			yield: {
				amount: 1,
				unit: 'pint'
			},
			viewedUnit: 'cup',
			ingredients: [
				{
					id: '5128567b-f0be-4b90-bafc-bebc286ff9fc',
					portion: {
						amount: 2,
						unit: 'tbs'
					},
					hidden: false
				},
				{
					id: '22de7026-c267-45b9-abc1-1989d8c80a0e',
					portion: {
						amount: 1,
						unit: 'cup'
					},
					hidden: false
				},
				{
					id: '5e039c48-bbd5-45fe-afc0-a3652c780630',
					portion: {
						amount: 1,
						unit: 'tbs'
					},
					hidden: false
				}
			]
		}
	} as Record<string, CompoundIngredientDoc>
};
