<script lang="ts">
	import type { RecipeDoc } from '$lib/data/schema';

	let {
		ingredientName,
		recipesUsing
	}: {
		ingredientName: string;
		recipesUsing: RecipeDoc[];
	} = $props();
</script>

<p>
	Are you sure you want to delete <strong>{ingredientName}</strong>?
</p>
{#if recipesUsing.length > 0}
	<p>This ingredient is currently used in the following recipes:</p>
	<ul>
		{#each recipesUsing as recipe}
			<li><strong>{recipe.name}</strong></li>
		{/each}
	</ul>
{/if}