<script lang="ts">
	// Placeholder component for Recipe Editor when no recipe is selected or created.
</script>

<div class="placeholder-card">
	<div class="placeholder-content">
		<div class="left">
			<h3>No recipe selected</h3>
			<p>Select a recipe from the list on the left or create a new one to begin editing.</p>
		</div>

		<div class="demo-chart-section">
			<div class="demo-chart" aria-hidden="true"></div>
			<ul class="demo-legend" aria-hidden="true">
				<li><span class="color" style="--c:#FF6384"></span> Ingredient A</li>
				<li><span class="color" style="--c:#36A2EB"></span> Ingredient B</li>
				<li><span class="color" style="--c:#FFCE56"></span> Ingredient C</li>
				<li><span class="color" style="--c:#B4B4B4"></span> Ingredient D</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.placeholder-card {
		display: flex;
		flex: 1;
		background: var(--bg-quaternary);
		border: 2px dashed var(--border-secondary);
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		backdrop-filter: blur(4px);
	}

	.placeholder-content {
		display: flex;
		gap: 12px;
		color: var(--text-primary);
		flex: 1;
	}

	.left {
		display: flex;
		flex-direction: column;
		gap: 12px;
		flex: 1;
		text-align: left;
	}

	h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	p {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.demo-chart-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		opacity: 0.4;
	}

	.demo-chart {
		width: 160px;
		height: 160px;
		border-radius: 50%;
		background: conic-gradient(
			#ff6384 0deg 40deg,
			#36a2eb 40deg 120deg,
			#ffce56 120deg 280deg,
			#b4b4b4 280deg 360deg
		);
		position: relative;
	}
	.demo-chart::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 75%;
		height: 75%;
		border-radius: 50%;
		background: var(--bg-primary);
	}

	.demo-legend {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		font-size: 0.7rem;
		padding: 0;
		list-style: none;
	}
	.demo-legend li {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.demo-legend .color {
		width: 10px;
		height: 10px;
		border-radius: 2px;
		background: var(--c);
		display: inline-block;
	}
</style>
