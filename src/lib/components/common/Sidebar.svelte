<script lang="ts">
	// Simple sidebar navigation component
</script>

<nav class="sidebar">
	<ul>
		<li><a href="/dashboard">Dashboard</a></li>
		<li><a href="/products">Products</a></li>
		<li><a href="/costs">Costs</a></li>
	</ul>
</nav>

<style>
	.sidebar {
		width: 220px;
		min-height: 100vh;
		background: #1e1e1e;
		padding: 1rem;
		box-sizing: border-box;
		border-right: 1px solid rgba(255, 255, 255, 0.05);
	}

	.sidebar ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.sidebar a {
		color: rgba(255, 255, 255, 0.8);
		text-decoration: none;
		font-size: 0.95rem;
		transition: color 0.2s ease;
	}

	.sidebar a:hover {
		color: #ffffff;
	}
</style>
